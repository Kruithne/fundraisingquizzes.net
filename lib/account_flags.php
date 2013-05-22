<?php
	class AccountFlags
	{
		const IsAdmin = 0x1;
		const IsBanned = 0x2;

		public static function HasFlag($flags, $check)
		{
			return (boolean) ($flags & $check);
		}

		public static function AddFlag($flags, $flag)
		{
			$flags = $flags | $flag;
			return $flags;
		}

		public static function RemoveFlag($flags, $flag)
		{
			$flags &= ~$flag;
			return $flags;
		}
	}
?>