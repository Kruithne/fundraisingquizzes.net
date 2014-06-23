<?php
	class ChangePassword extends PacketListener
	{
		public function run()
		{
			$this->setReturn('success', false);
			if (!Authenticator::isLoggedIn())
				return;

			$password = REST::Get('pass');
			if ($password !== NULL)
			{
				Authenticator::getLoggedInUser()->setPassword($password);
				$this->setReturn('success', true);
			}
		}
	}
?>