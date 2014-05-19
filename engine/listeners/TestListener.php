<?php
	class TestListener extends PacketListener
	{
		public function run()
		{
			$this->output('reply', intval(REST::Get('test') * 5));
		}
	}
?>