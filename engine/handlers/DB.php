<?php
	class DB
	{
		public static function get()
		{
			if (self::$database == null)
				self::$database = new KW_DatabaseConnection(DATABASE_DSN, DATABASE_USER, DATABASE_PASSWORD);

			return self::$database;
		}

		/**
		 * KW_DatabaseConnection
		 */
		private static $database;
	}
?>