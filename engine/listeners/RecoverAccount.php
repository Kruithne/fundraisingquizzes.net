<?php
	class RecoverAccount extends PacketListener
	{
		public function run()
		{
			$type = REST::Get('type');
			$result = null;

			switch ($type)
			{
				case 'username': $result = $this->recoverUsername(false); break;
				case 'password': $result = $this->recoverPassword(); break;
				case 'both': $result = $this->recoverUsername(true); break;
			}

			if ($result !== NULL)
				$this->setReturn('error', $result);
			else
				$this->setReturn('success', true);
		}

		private function recoverUsername($withPassword = false)
		{
			$email = REST::Get('value');

			if ($email === NULL)
				return 'Server error, try again later!';

			$username = UserHandler::emailRegistered($email);

			if ($username === FALSE)
				return 'E-mail address not registered.';


			if ($withPassword)
			{
				$user_id = UserHandler::usernameRegistered($username);
				if ($user_id === FALSE)
					return 'Error getting account details!';

				EmailHandler::sendEmail($email, 'Account Recovery', 'recover_both.txt', Array(
					'{key}' => UserHandler::getPasswordResetKey($user_id),
					'{username}' => $username
				));
			}
			else
			{
				EmailHandler::sendEmail($email, 'Account Recovery', 'recover_username.txt', Array(
					'{username}' => $username
				));
			}
			return NULL;
		}

		private function recoverPassword()
		{
			$username = REST::Get('value');

			if ($username === NULL)
				return 'Server error, try again later!';

			$user_id = UserHandler::usernameRegistered($username);
			if ($user_id === FALSE)
				return 'Username does not exist!';

			$user = UserHandler::getUser($user_id);
			if (!($user instanceof User))
				return 'Error getting user info!';

			EmailHandler::sendEmail($user, 'Account Recovery', 'recover_password.txt', Array(
				'{key}' => UserHandler::getPasswordResetKey($user_id)
			));
			return NULL;
		}
	}
?>