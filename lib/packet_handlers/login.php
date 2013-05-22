<?php
	class LoginPacketHandler extends PacketHandler
	{
		protected function run()
		{
			$username = REST::Get('username');
			$password = REST::Get('password');

			$this->output['auth'] = 0;

			if ($username !== null && $password !== null)
			{
				Authenticator::LoginThrottle();
				$auth = Authenticator::AuthenticateUser($username, $password);
				if ($auth !== false)
				{
					Authenticator::LoginUser($auth);
					$this->output['auth'] = 1; // Change the auth to success.
				}
				else
				{
					Authenticator::AddFailedLoginAttempt(); // Failed, add a throttle level.
				}
			}
		}
	}
?>