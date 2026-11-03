export function readConfig(env: NodeJS.ProcessEnv = process.env) {
  const port = Number(env.PORT ?? 3000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Invalid PORT');
  const uri = env.MONGODB_URI;
  if (!uri || !/^mongodb(\+srv)?:\/\//.test(uri)) throw new Error('MONGODB_URI is required');
  const origins = (env.CORS_ORIGINS ?? 'http://localhost:8081').split(',').map(x => x.trim()).filter(Boolean);
  if (origins.includes('*')) throw new Error('CORS_ORIGINS must list explicit origins');
  return {port, uri, origins};
}
