<?php
	class ResetPassword extends PacketListener
	{
		public function run()
		{
			$this->setReturn('success', false);
			$password = REST::Get('password');

			if ($password === NULL)
				return;

			$key = REST::Get('key');
			$result = $key === NULL ? $this->resetUsingAccount($password) : $this->resetUsingKey($key, $password);

			if ($result === true)
				$this->setReturn('success', true);
			else
				$this->setReturn('error', $result);
		}

		private function resetUsingKey($key, $password)
		{
			$user_id = UserHandler::getPasswordResetKeyUser($key);
			if ($user_id === NULL)
				return 'Invalid reset, go back to the recovery page and try again!';

			if (!UserHandler::changeUserPassword($user_id, $password))
				return 'Unable to change password, server error!';

			UserHandler::deleteResetKey($key);
			return true;
		}

		private function resetUsingAccount($password)
		{
			if (!UserHandler::changeUserPassword(NULL, $password))
				return 'Unable to change password, server error!';

			return true;
		}
	}
?>