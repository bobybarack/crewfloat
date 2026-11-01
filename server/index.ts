import 'dotenv/config';
import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { createApp } from './app.ts';
import { deploymentSettings } from './access.ts';
import type { Database } from './storage.ts';

mkdirSync('data', { recursive: true });
const sqlite = new DatabaseSync(process.env.CREWFLOAT_DB || 'data/crewfloat.sqlite');
sqlite.exec('PRAGMA journal_mode=WAL');
const db: Database = {
  prepare: sql => sqlite.prepare(sql),
  exec: sql => sqlite.exec(sql),
  transaction: action => {
    sqlite.exec('BEGIN IMMEDIATE');
    try { const result = action(); sqlite.exec('COMMIT'); return result; }
    catch (error) { sqlite.exec('ROLLBACK'); throw error; }
  }
};
const mode = process.env.PAYMENT_MODE === 'sandbox' ? 'sandbox' : 'demo';
const settings = deploymentSettings(), port = Number(process.env.PORT || 4310);
const app = createApp({db, mode, settings});
app.listen(port, settings.host, () => console.log(`CrewFloat API: http://${settings.host}:${port} (${mode}); UI origin ${settings.origin}`));
