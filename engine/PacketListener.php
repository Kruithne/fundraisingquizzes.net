<?php
	abstract class PacketListener implements IPacketListener
	{
		public function __construct()
		{
			$this->output = Array();
		}

		protected function output($key, $value)
		{
			$this->output[$key] = $value;
		}

		public function __toString()
		{
			$this->run();
			return json_encode(PacketHandler::convertChildren($this->output));
		}

		protected $output;
	}
?>