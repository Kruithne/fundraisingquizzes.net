<?php
	abstract class PacketListener implements IPacketListener
	{
		public function __construct()
		{
			$this->output = Array();
		}

		/**
		 * Set output in key->value format.
		 * @param $key mixed
		 * @param $value mixed
		 */
		protected function output($key, $value)
		{
			$this->output[$key] = $value;
		}

		/**
		 * Compile the output of this listener to a JSON string.
		 * @return string JSON formatted output.
		 */
		public function __toString()
		{
			$this->run();
			return json_encode(PacketHandler::convertChildren($this->output));
		}

		protected $output;
	}
?>