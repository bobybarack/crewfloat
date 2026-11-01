import {defineConfig} from '@playwright/test';
import base from './playwright.config.ts';
export default defineConfig({...base, webServer: undefined,
  timeout: process.env.CREWFLOAT_TEST_URL ? 90000 : 30000,
  expect: {timeout: process.env.CREWFLOAT_TEST_URL ? 30000 : 5000},
  use: {...base.use, baseURL: process.env.CREWFLOAT_TEST_URL || 'http://localhost:8788'}});
