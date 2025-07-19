<?php
	class UpdateTodayTextListener extends PacketListener
	{
		public function run()
		{
			$this->setReturn('success', false);
			if (!Authenticator::isLoggedInAsAdmin())
				return;

			$data = REST::Post("data");
			if ($data !== null)
			{
				file_put_contents("../data/today.txt", $data);
				$this->setReturn('success', true);
			}
		}
	}
?>