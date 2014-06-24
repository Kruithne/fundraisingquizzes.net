<?php
	class EditMessage extends PacketListener
	{
		public function run()
		{
			$this->setReturn('success', false);
			if (!Authenticator::isLoggedIn())
				return;

			$reply = ForumReply::get((int) REST::Get('id'));
			if ($reply instanceof ForumReply && $reply->getPoster() === Authenticator::getLoggedInUser()->getId())
			{
				$message = REST::Get('message');
				if ($message !== NULL)
				{
					$reply->setText($message);
					$reply->persist();
					$this->setReturn('success', true);
				}
			}
		}
	}
?>