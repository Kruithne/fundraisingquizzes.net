<?php
	class LoginListener extends PacketListener
	{
		public function run()
		{
			$username = REST::Get('user');
			$password = REST::Get('pass');

			if ($username != null && $password != null)
			{
				$user_id = Authenticator::authenticateUser($username, $password);
				if ($user_id !== User::NONE)
				{
					Authenticator::loginUser($user_id, true);
					$user = Authenticator::getLoggedInUser();

					if ($user->isBanned())
					{
						$this->setReturn('isBanned', true);
						return;
					}

					$this->setReturns(array(
						'success' => true,
						'username' => $user->getUsername(),
						'admin' => $user->isAdmin()
					));
				}
				else
				{
					$this->setReturn('success', false);
				}
			}
			else
			{
				Authenticator::logoutUser();
				$this->setReturn('logout', true);
			}
		}
	}
?>