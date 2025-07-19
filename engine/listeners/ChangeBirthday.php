<?php
	class ChangeBirthday extends PacketListener
	{
		public function run()
		{
			$this->setReturn('success', false);
			if (!Authenticator::isLoggedIn())
				return;

			$day = intval(REST::Get('day'));
			$month = intval(REST::Get('month'));

			if ($day > 0 && $month > 0)
			{
				$user = Authenticator::getLoggedInUser();
				$user->setBirthday(new UserBirthday($day, $month));
				$this->setReturn('success', true);
			}
		}
	}
?>