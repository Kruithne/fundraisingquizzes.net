<?php
	class PacketHandler
	{
		public function __construct()
		{
			$this->output = Array();
		}

		protected function run()
		{
			// Override
		}

		public function convertChildren($node)
		{
			if (is_array($node))
				return array_map(array("PacketHandler", "convertChildren"), $node);
			else if (is_object($node))
				return array_map(array("PacketHandler", "convertChildren"), get_object_vars($node));
			else if (is_string($node))
				return html_entity_decode($node, ENT_COMPAT, "UTF-8");

			return $node;
		}

		public function __toString()
		{
			$this->run();
			$this->output = $this->convertChildren($this->output);
			return json_encode($this->output);
		}

		protected $output;
	}
?>