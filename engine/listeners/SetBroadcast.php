<?php
	class SetBroadcast extends PacketListener
	{
		public function run()
		{
			$this->setReturn('success', false);
			if (!Authenticator::isLoggedInAsAdmin())
				return;

			$this->setReturn('success', true);
			$message = REST::Get('message');

			if ($message == NULL)
				Settings::delete('broadcast');
			else
				Settings::set('broadcast', $message);
		}
	}
?>