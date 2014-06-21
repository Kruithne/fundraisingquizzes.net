<?php
	class RegisterAccountListener extends PacketListener
	{
		public function run()
		{
			$username = REST::Get('username');
			$email = REST::Get('email');
			$password = REST::Get('password');

			if ($username !== null && $email !== null && $password !== null)
			{
				$error = $this->check($username, $email);
				if ($error === NULL)
				{
					UserHandler::createUser($username, $password, $email);
					$this->setReturn('success', true);
					return;
				}
				$this->setReturn('error', $error);
			}
			else
			{
				$this->setReturn('error', 'Internal server goof, try again later!');
			}
		}

		private function check($username, $email)
		{
			if (!preg_match('/^[a-zA-Z0-9_]{4,}$/', $username))
				return 'Your username must be 4+ characters and can only consist of a-z, A-Z, 0-9 and _';

			if (!preg_match('/^\S+@\S+\.[a-zA-Z]+$/', $email))
				return 'You must enter a valid e-mail address!';

			if (UserHandler::usernameRegistered($username) !== FALSE)
				return 'That username is already in-use on the site!';

			if (UserHandler::emailRegistered($email) !== FALSE)
				return 'That e-mail address is already registered on the site!';

			return NULL;
		}
	}
?>