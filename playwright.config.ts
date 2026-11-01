import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir:'./e2e',workers:1,
  use:{baseURL:'http://127.0.0.1:4410',channel:'chrome',viewport:{width:1440,height:1050},screenshot:'only-on-failure',trace:'retain-on-failure'},
  webServer:{command:'npm run build && node --import tsx server/index.ts',url:'http://127.0.0.1:4410/api/health',reuseExistingServer:false,timeout:60000,env:{PORT:'4410',BIND_HOST:'127.0.0.1',APP_ORIGIN:'http://127.0.0.1:4410',OWNER_ACCESS_CODE:'',PAYMENT_MODE:'demo',PAYPAL_CLIENT_ID:'',PAYPAL_CLIENT_SECRET:'',PAYPAL_WEBHOOK_ID:'',AI_API_KEY:'',AI_MODEL:'',CREWFLOAT_DB:'data/browser-tests.sqlite'}}
});
