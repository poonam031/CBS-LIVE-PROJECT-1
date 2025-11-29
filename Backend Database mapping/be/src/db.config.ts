export const dbConfig = {
  source: {
    type: process.env.SOURCE_DB || 'mssql', // oracle | mssql | mysql | mongo
    host: process.env.SOURCE_HOST || 'localhost',
    port: Number(process.env.SOURCE_PORT) || 1433,
    user: process.env.SOURCE_USER || 'sa',
    password: process.env.SOURCE_PASS || 'Akshat@1930',
    database: process.env.SOURCE_DBNAME || 'employee',

    options: {
      instanceName: process.env.SOURCE_INSTANCE || 'SQLEXPRESS', // 
      encrypt: false,
      trustServerCertificate: true,
    }
  },

  target: {
    type: 'postgres',
    host: process.env.TARGET_HOST || 'localhost',
    port: Number(process.env.TARGET_PORT) || 5432,
    username: process.env.TARGET_USER || 'postgres',
    password: process.env.TARGET_PASS || '12345',
    database: process.env.TARGET_DBNAME || 'sidhnerli',
  }
};
