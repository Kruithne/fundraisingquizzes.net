<?php
	class REST
	{
		/**
		 * @param string $key
		 * @return null|mixed
		 */
		public static function Post($key)
		{
			if (array_key_exists($key, $_POST))
			{
				$data = DataSanitizer::CleanData($_POST[$key]);

				if (!empty($data))
					return $data;
			}

			return null;
		}

		/**
		 * @param string $key
		 * @return null|mixed
		 */
		public static function Get($key)
		{
			if (array_key_exists($key, $_GET))
			{
				$data = DataSanitizer::CleanData($_GET[$key]);

				if (!empty($data))
					return $data;
			}

			return null;
		}
	}
?>