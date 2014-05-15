<?php
	class AccountsFlags
	{
		const Admin = 0x1;
		const Banned = 0x2;

		public static function hasFlag($flags, $check)
		{
			return (bool) ($flags & $check);
		}

		public static function addFlag($flags, $flag)
		{
			$flags = $flags | $flag;
			return $flags;
		}

		public static function removeFlag($flags, $flag)
		{
			$flags &= ~$flag;
			return $flags;
		}
	}
?>