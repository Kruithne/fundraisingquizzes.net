<?php
	class PacketHandler
	{
		public static function convertChildren($node)
		{
			if (is_array($node))
				return array_map(array("PacketHandler", "convertChildren"), $node);
			else if (is_object($node))
				return array_map(array("PacketHandler", "convertChildren"), get_object_vars($node));
			else if (is_string($node))
				return html_entity_decode(self::convertCharacters($node), ENT_COMPAT, "UTF-8");

			return $node;
		}

		private static function convertCharacters($text)
		{
			foreach (self::$char_swaps as $find => $replace)
				$text = str_replace($find, $replace, $text);

			return $text;
		}

		public static function registerListeners()
		{
			foreach (func_get_args() as $register)
			{
				if (is_array($register) && count($register) == 2)
					self::$listeners[$register[0]] = $register[1];
			}
		}

		/**
		 * @param $id
		 * @return null|IPacketListener
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
	}
?>