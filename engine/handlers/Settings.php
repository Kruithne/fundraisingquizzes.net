<?php
	class Settings
	{
		public static function get($key)
		{
			$query = DB::get()->prepare('SELECT settingValue FROM settings WHERE settingKey = :key');
			$query->setValue(':key', $key);

			$row = $query->getFirstRow();
			return $row == null ? null : $row->settingValue;
		}

		public static function set($key, $value)
		{
			$query = DB::get()->prepare('INSERT INTO settings (settingKey, settingValue) VALUES(:key, :value)
				ON DUPLICATE KEY UPDATE settingValue = :value');
			$query->setValue(':key', $key)->setValue(':value', $value)->execute();
		}
	}
?>