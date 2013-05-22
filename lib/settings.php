<?php
	class Settings
	{
		public static function Get($key)
		{
			$query = DB::prepare('SELECT settingValue FROM settings WHERE settingKey = :key');
			$query->bindValue(':key', $key);
			$query->execute();

			if ($result = $query->fetchObject())
				return $result->value;

			return null;
		}

		public static function Set($key, $value)
		{
			$query = DB::prepare('
				INSERT INTO settings (settingKey, settingValue) VALUES(:key, :value) ON DUPLICATE KEY UPDATE settingValue = :value
			');
			$query->bindValue(':value', $value);
			$query->bindValue(':key', $key);
			$query->execute();
		}
	}
?>