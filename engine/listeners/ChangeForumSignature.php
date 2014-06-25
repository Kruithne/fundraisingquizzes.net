<?php
	class ChangeForumSignature extends PacketListener
	{
		public function run()
		{
			$this->setReturn('success', false);
			if (!Authenticator::isLoggedIn())
				return;

			$user = Authenticator::getLoggedInUser();
			$user->setSignature(REST::Get('sig'));
			$user->persist();
			$this->setReturn('success', true);
		}
	}
?>