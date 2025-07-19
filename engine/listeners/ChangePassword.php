<?php
	class ChangePassword extends PacketListener
	{
		public function run()
		{
			$this->setReturn('success', false);
			if (!Authenticator::isLoggedIn())
				return;

			$password = REST::Get('pass');
			$current = REST::Get('current');

			if ($password !== NULL && $current !== NULL)
			{
				$user = Authenticator::getLoggedInUser();

				if (Authenticator::authenticateUser($user->getUsername(), $current) == User::NONE)
				{
					$this->setReturn('error', 'Invalid current password!');
					return;
				}

				$user->setPassword($password);
				$this->setReturn('success', true);
			}
		}
	}
?>