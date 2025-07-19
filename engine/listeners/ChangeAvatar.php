<?php
	class ChangeAvatar extends PacketListener
	{
		public function run()
		{
			$this->setReturn('success', false);
			if (!Authenticator::isLoggedIn())
				return;

			$avatar = (int) REST::Get('avatar');

			if ($avatar > 0 && AvatarHandler::canUseAvatar($avatar))
			{
				$user = Authenticator::getLoggedInUser();
				$user->setAvatar($avatar);
				$user->persist();
				$this->setReturn('success', true);
			}
		}
	}
?>