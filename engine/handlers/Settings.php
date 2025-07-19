<?php
	class Settings
	{
		/**
		 * Return a side-wide setting by the given key.
		 * @param $key string Key of the setting to retrieve.
		 * @return mixed|null Retrieved value or null if none exists.
		 */
		public static function get($key)
		{
			$query = DB::get()->prepare('SELECT settingValue FROM settings WHERE settingKey = :key');
			$query->setValue(':key', $key);

			$row = $query->getFirstRow();
			return $row == null ? null : $row->settingValue;
		}

		/**
		 * Set a site-wide setting with the given key and value.
		 * @param $key string Key to store the setting under.
		 * @param $value mixed Value to store under the given key.
		 */
		public static function set($key, $value)
		{
			$query = DB::get()->prepare('INSERT INTO settings (settingKey, settingValue) VALUES(:key, :value)
				ON DUPLICATE KEY UPDATE settingValue = :value');
			$query->setValue(':key', $key)->setValue(':value', $value)->execute();
		}

		/**
		 * Delete a site-wide setting.
		 * @param string $key
		 */
		public static function delete($key)
		{
			DB::get()->prepare('DELETE FROM settings WHERE settingKey = :key')->setValue(':key', $key)->execute();
		}
	}
?>