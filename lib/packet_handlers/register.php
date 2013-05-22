<?php
	class RegisterPacketHandler extends PacketHandler
	{
		protected function run()
		{
			$this->output['response'] = $this->validateInput();
		}

		private function validateInput()
		{
			$username = REST::Get('username');
			$email = REST::Get('email');
			$password = REST::Get('password');

			if (!($username !== null && $email !== null && $password !== null))
				return 1;

			if (UserHandler::UserExists($username))
				return 2;

			if (preg_match('/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i', $email) == false)
				return 3;

			if (UserHandler::EmailAddressInUse($email))
				return 4;

			if (strlen($username) > 20)
				return 5;

			if (strlen($password) < 5)
				return 6;

			// So far no errors, let's create a user.
			$new_user = UserHandler::CreateUser($username, $password, $email);

			if ($new_user !== null)
				Authenticator::LoginUser($new_user); // Login the new user.
			else
				return 7; // Something goofed, oh dear.

			return 0;
		}
	}
?>