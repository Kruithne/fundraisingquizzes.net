<?php
	class RestrictedPacketHandler extends PacketHandler
	{
		public function __construct()
		{
			parent::__construct();
		}

		public function __toString()
		{
			if (Authenticator::IsAdmin())
				return parent::__toString();

			return "";
		}
	}
?>