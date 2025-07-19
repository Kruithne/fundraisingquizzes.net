<?php
	class PacketHandler
	{
		/**
		 * Used by IPacketListener classes to convert their output to JSON.
		 * @param $node mixed Node to convert.
		 * @return array|string
		 */
		public static function convertChildren($node)
		{
			if (is_array($node))
				return array_map(self::$convertFunction, $node);
			else if ($node instanceof JsonSerializable)
				return array_map(self::$convertFunction, $node->jsonSerialize());
			else if (is_object($node))
				return array_map(self::$convertFunction, get_object_vars($node));
			else if (is_string($node))
				return html_entity_decode(self::convertCharacters($node), ENT_COMPAT, "UTF-8");

			return $node;
		}

		/**
		 * Used by convertChildren to filter out any JSON breaking characters.
		 * @param $text string Text to filter.
		 * @return string
		 */
		private static function convertCharacters($text)
		{
			foreach (self::$char_swaps as $find => $replace)
				$text = str_replace($find, $replace, $text);

			return $text;
		}

		/**
		 * Register a packet listener.
		 * @param $listeners array Associative array with keys as the ID and values as the listeners.
		 */
		public static function registerListeners($listeners)
		{
			foreach ($listeners as $id => $listener)
				self::$listeners[$id] = $listener;
		}

		/**
		 * @param $id int ID of the packet listener to retrieve.
		 * @return null|IPacketListener Will be null if no listener found for that ID.
		 */
		public static function getListener($id)
		{
			return array_key_exists($id, self::$listeners) ? new self::$listeners[$id]() : null;
		}

		private static $listeners = Array();
		private static $char_swaps = Array(
			'‘' => '\'',
			'’' => '\''
		);
		private static $convertFunction = ["PacketHandler", "convertChildren"];
	}
?>