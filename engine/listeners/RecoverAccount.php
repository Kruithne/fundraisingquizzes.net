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
				$username = UserHandler::emailRegistered($email);
				if ($username !== FALSE)
				{
					if ($withPassword)
					{
						$user_id = UserHandler::usernameRegistered($username);
						if ($user_id !== FALSE)
						{
							$this->sendRecoverEmail($email, 'recover_both.txt', Array(
								'{key}', '{username}'
							), Array(
								UserHandler::getPasswordResetKey($user_id), $username
							));
						}
						else
						{
							$this->setReturn('error', 'Error getting account details!');
						}
					}
					else
					{
						$this->sendRecoverEmail($email, 'recover_username.txt', '{username}', $username);
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
				$user_id = UserHandler::usernameRegistered($username);
				if ($user_id !== FALSE)
				{
					$user = UserHandler::getUser($user_id);
					if ($user instanceof User)
					{
						$this->sendRecoverEmail($user->getEmailAddress(), 'recover_password.txt', '{key}', UserHandler::getPasswordResetKey($user_id));
						$this->setReturn('success', true);
					}
					else
					{
						$this->setReturn('error', 'Error getting user info!');
					}
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

		private function sendRecoverEmail($email, $file, $search, $replace)
		{
			$mail = new KW_Mail();
			$mail->setSender('noreply@fundraisingquizzes.net');
			$mail->addRecipients($email);
			$mail->setSubject('Account Recovery - Fundraising Quizzes');
			$mail->append(str_replace($search, $replace, file_get_contents('../engine/emails/' . $file)));
			$mail->send();
		}
	}
?>