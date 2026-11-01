export interface Database {
  exec(sql: string): unknown;
  prepare(sql: string): {
    get(...values: (string | number)[]): unknown;
    all(...values: (string | number)[]): unknown[];
    run(...values: (string | number)[]): unknown;
  };
  transaction<T>(action: () => T): T;
}

export interface AppOptions {
  db: Database;
  mode: 'demo' | 'sandbox';
  settings: { origin: string; code: string; secure: boolean };
  paymentToken?: () => string;
  serveStatic?: boolean;
}
