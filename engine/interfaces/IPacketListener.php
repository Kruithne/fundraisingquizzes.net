<?php
	interface IPacketListener
	{
		public function run();
		public function output($key, $value);
	}
?>