<?php
	interface IPacketListener
	{
		public function run();
		public function setReturn($key, $value);
	}
?>