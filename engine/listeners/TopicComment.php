<?php
	class TopicComment extends PacketListener
	{
		public function run()
		{
			$this->setReturn('success', false);
			if (!Authenticator::isLoggedIn())
				return;

			$thread = ForumTopic::get((int) REST::Get('id'));
			if ($thread instanceof ForumTopic)
			{
				$message = REST::Get('message');
				if ($message !== NULL)
				{
					$user = Authenticator::getLoggedInUser();
					$thread->addReply($message, $user);
					$thread->setAsUnread();
					$this->setReturn('success', true);

					UserHandler::checkContributorStatus($user);
				}
			}
		}
	}
?>