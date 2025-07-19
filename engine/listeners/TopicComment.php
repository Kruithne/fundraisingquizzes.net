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
					$current = $thread->getId() . '-' . $message;
					$previous = Session::Get('previous-comment');

					if ($previous == null || $previous != $current)
					{
						$user = Authenticator::getLoggedInUser();
						$thread->addReply($message, $user);
						$thread->setAsUnread();
						$thread->markAsRead();
						$this->setReturn('success', true);
						Session::Set('previous-comment', $current);

						UserHandler::checkContributorStatus($user);
					}
				}
			}
		}
	}
?>