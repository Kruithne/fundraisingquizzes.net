<?php
	class EmailHandler
	{
		public static function sendEmail($user, $subject, $file, $replacements = Array())
		{
			$mail = new KW_Mail();
			$mail->setSender('Fundraising Quizzes <noreply@fundraisingquizzes.net>');
			$mail->addRecipients($user instanceof User ? $user->getEmailAddress() : $user);
			$mail->setSubject($subject);

			$contents = file_get_contents('../engine/emails/' . $file);

			foreach ($replacements as $search => $replace)
				$contents = str_replace($search, $replace, $contents);

			$mail->append($contents);
			$mail->send();
		}
	}
?>