<?php
	class RecoverAccount extends PacketListener
	{
		public function run()
		{
			$type = REST::Get('type');

			switch ($type)
			{
				case 'username': $this->recoverUsername(false); break;
				case 'password': $this->recoverPassword(); break;
				case 'both': $this->recoverUsername(true); break;
			}
		}

		private function recoverUsername($withPassword = false)
		{
			$email = REST::Get('value');
			if ($email !== NULL)
			{
				if (UserHandler::emailRegistered($email))
				{
					// E-mail the username to this address.
					if ($withPassword)
					{
						// Include a password reset link in the e-mail to the user.
					}

					$this->setReturn('success', true);
				}
				else
				{
					$this->setReturn('error', 'E-mail address not registered.');
				}
			}
			else
			{
				$this->setReturn('error', 'Server error, try again later!');
			}
		}

		private function recoverPassword()
		{
			$username = REST::Get('value');
			if ($username !== NULL)
			{
				if (UserHandler::usernameRegistered($username))
				{
					// E-mail the user a password reset link.
					$this->setReturn('success', true);
				}
				else
				{
					$this->setReturn('error', 'Username does not exist!');
				}
			}
			else
			{
				$this->setReturn('error', 'Server error, try again later!');
			}
		}
	}
?>