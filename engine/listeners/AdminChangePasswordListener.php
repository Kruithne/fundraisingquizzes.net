<?php
	class AdminChangePasswordListener extends PacketListener
	{
		public function run()
		{
			$this->setReturn('success', false);
			if (!Authenticator::isLoggedInAsAdmin())
				return;

			$userID = intval(REST::Get("user"));
			$user = UserHandler::getUser($userID);

			if ($user !== User::NONE)
			{
				$password = REST::Get("password");
				if ($password !== null)
				{
					$user->setPassword($password);
					$user->persist();

					$this->setReturn('success', true);
				}
			}
		}
	}
?>