<?php
	class DB
	{
		/**
		 * Retrieve the currently active database connection.
		 * @return KW_DatabaseConnection
		 */
		public static function get()
		{
			if (self::$database == null)
			{
				self::$database = new KW_DatabaseConnection(DATABASE_DSN, DATABASE_USER, DATABASE_PASSWORD);
				self::$database->execute('SET time_zone = "+00:00"');
			}

			return self::$database;
		}

		/**
		 * KW_DatabaseConnection
		 */
		private static $database;
	}
?>