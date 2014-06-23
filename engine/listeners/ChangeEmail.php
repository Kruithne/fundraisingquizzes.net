<?php
	class ChangeEmail extends PacketListener
	{
		public function run()
		{
			$this->setReturn('success', false);
			if (!Authenticator::isLoggedIn())
				return;

			$email = REST::Get('email');
			if ($email !== NULL)
			{
				Authenticator::getLoggedInUser()->setEmailAddress($email);
				$this->setReturn('success', true);
			}
		}
	}
?>