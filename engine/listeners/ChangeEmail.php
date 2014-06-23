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
				if (UserHandler::emailRegistered($email))
				{
					$this->setReturn('error', 'E-mail address already in-use.');
					return;
				}

				Authenticator::getLoggedInUser()->setEmailAddress($email);
				$this->setReturn('success', true);
			}
		}
	}
?>