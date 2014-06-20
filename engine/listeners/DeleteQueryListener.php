<?php
	class DeleteQueryListener extends PacketListener
	{
		public function run()
		{
			$this->setReturn('success', false);
			if (!Authenticator::isLoggedInAsAdmin())
				return;

			$query = (int) REST::Get('id');
			if ($query > 0)
			{
				QueryHandler::deleteQuery($query);
				$this->setReturn('success', true);
			}
		}
	}
?>