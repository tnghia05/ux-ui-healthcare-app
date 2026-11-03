import {defineConfig} from '@playwright/test';
const mongoUri=process.env.E2E_MONGODB_URI??`mongodb://127.0.0.1:27018/uxui_e2e_${Date.now()}?replicaSet=rs0&directConnection=true`;
process.env.E2E_MONGODB_URI=mongoUri;
export default defineConfig({testDir:'./tests/e2e',globalSetup:'./tests/e2e/readiness.mjs',globalTeardown:'./tests/e2e/cleanup.mjs',timeout:60000,workers:1,outputDir:'.local/test-results',reporter:'list',use:{headless:true},webServer:{command:'node --env-file=apps/api/.env apps/api/dist/main.js',url:'http://127.0.0.1:3002/api/v1/health/ready',timeout:90000,reuseExistingServer:false,env:{PORT:'3002',MONGODB_URI:mongoUri,CORS_ORIGINS:'http://localhost:8081,http://127.0.0.1:8081'}}});
