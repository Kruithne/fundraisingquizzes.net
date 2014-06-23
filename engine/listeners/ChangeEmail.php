<?php
	class ChangeEmail extends PacketListener
	{
		public function run()
		{
			$this->setReturn('success', false);
			if (!Authenticator::isLoggedIn())
				return;

			$email = REST::Get('email');
			$password = REST::Get('pass');

			if ($email !== NULL && $password !== NULL)
			{
				$user = Authenticator::getLoggedInUser();

				if (Authenticator::authenticateUser($user->getUsername(), $password) == User::NONE)
				{
					$this->setReturn('error', 'Invalid password.');
					return;
				}

				if (UserHandler::emailRegistered($email))
				{
					$this->setReturn('error', 'E-mail address already in-use.');
					return;
				}

				$user->setEmailAddress($email);
				$this->setReturn('success', true);
			}
		}
	}
?>