<?php
	class DataSanitizer
	{
		/**
		 * @param string $data
		 * @return string
		 */
		public static function CleanData($data)
		{
			return htmlentities(utf8_decode(trim($data)));
		}
	}
?>