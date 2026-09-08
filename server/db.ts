import { db_mysql, db_update_schema_mysql } from 'spooder';

export const db = await db_mysql({
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_DATABASE
}, true, true);

if (Bun.isMainThread) {
	const connection = await db.instance.getConnection();
	await db_update_schema_mysql(connection, './schema');
	connection.release();
}