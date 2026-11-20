// MongoDB initialization script: creates least-privilege application user (readWrite)
const dbName = process.env.MONGO_INITDB_DATABASE || 'photographer';
const appUser = process.env.MONGO_APP_USER || 'photographer_app';
const appPassword = process.env.MONGO_APP_PASSWORD;

if (appPassword) {
  const targetDb = db.getSiblingDB(dbName);
  targetDb.createUser({
    user: appUser,
    pwd: appPassword,
    roles: [{ role: 'readWrite', db: dbName }],
  });
  print(`[mongo-init] Created readWrite user '${appUser}' on database '${dbName}'`);
} else {
  print('[mongo-init] MONGO_APP_PASSWORD not set, skipping application user creation');
}
