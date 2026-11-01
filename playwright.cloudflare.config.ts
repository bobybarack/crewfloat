import {defineConfig} from '@playwright/test';
import base from './playwright.config.ts';
export default defineConfig({...base, webServer: undefined,
  use: {...base.use, baseURL: process.env.CREWFLOAT_TEST_URL || 'http://localhost:8788'}});
