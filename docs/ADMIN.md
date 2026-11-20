# Admin Developer Guide: Adding a New Resource

The `admin/` application follows a clean, layered architecture so a new CRUD resource can be added in under 30 minutes without touching unrelated modules.

---

## Architecture Layers

```text
admin/src/
├── types/index.ts              # 1. TypeScript domain interfaces
├── data/mockData.ts            # 2. Deterministic mock seed data (for VITE_USE_MOCK=true)
├── services/<resource>.service.ts # 3. Dual-mode (Mock + Axios HTTP) service functions
├── pages/<Resource>Page.tsx    # 4. Page component using React Query + Common UI library
└── routes/index.tsx            # 5. Route registration + Sidebar navigation entry
```

> **Constraint**: Components in `admin/src/components/` and `admin/src/pages/` must **never** import directly from `admin/src/data/mockData.ts`. Always go through `admin/src/services/*.service.ts`.

---

## Step-by-Step Guide (Example: Adding `Testimonials`)

### Step 1: Define the Type (`admin/src/types/index.ts`)
```ts
export interface Testimonial {
  _id: string;
  clientName: string;
  quote: string;
  quoteEn?: string;
  rating: number;
  isVisible: boolean;
  createdAt?: string;
}
```

### Step 2: Add Mock Data (`admin/src/data/mockData.ts`)
Export `initialMockTestimonials: Testimonial[]` for offline/mock development.

### Step 3: Create the Service (`admin/src/services/testimonials.service.ts`)
```ts
import api from './http/api';
import { Testimonial, ApiResponse } from '../types';
import { initialMockTestimonials, mockDelay } from '../data/mockData';

const isMock = import.meta.env.VITE_USE_MOCK === 'true';
let mockStore = [...initialMockTestimonials];

export const testimonialsService = {
  getAll: async (): Promise<Testimonial[]> => {
    if (isMock) {
      await mockDelay();
      return [...mockStore];
    }
    const res = await api.get<ApiResponse<Testimonial[]>>('/testimonials');
    return res.data.data;
  },
  create: async (payload: Partial<Testimonial>): Promise<Testimonial> => {
    const res = await api.post<ApiResponse<Testimonial>>('/testimonials', payload);
    return res.data.data;
  },
};
```

### Step 4: Build the Page (`admin/src/pages/TestimonialsPage.tsx`)
Reuse the shared primitives from `admin/src/components/common`:
- `PageHeader`, `FilterBar`, `DataTable`, `Pagination`, `Modal`, `Drawer`, `FormField`, `Input`, `Textarea`, `Switch`, `StatusBadge`, `EmptyState`, `ErrorState`.
- Use `useTableState()` for URL-synchronized search, filter, sort, and pagination.
- Use `useConfirm()` for destructive action confirmation dialogs.
- Use `useToastStore()` (`addToast({ message, type })`) for user feedback.

### Step 5: Register Route & Sidebar (`admin/src/routes/index.tsx` & `Sidebar.tsx`)
Add a lazy-loaded route in `admin/src/routes/index.tsx` and a navigation item in `admin/src/components/layout/Sidebar.tsx`.
