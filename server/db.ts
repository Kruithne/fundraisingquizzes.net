import { db_mysql } from 'spooder';

export const db = await db_mysql({
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_DATABASE
}, false, true);

if (Bun.isMainThread)
	await db.update_schema('./schema');