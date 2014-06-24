<?php
	class CreateTopic extends PacketListener
	{
		public function run()
		{
			$this->setReturn('success', false);
			if (!Authenticator::isLoggedIn())
				return;

			$message = REST::Get('message');
			$title = REST::Get('title');

			if ($message !== NULL && $title !== NULL)
			{
				$topic = ForumTopic::create($title, $message, Authenticator::getLoggedInUser());
				if ($topic instanceof ForumTopic)
				{
					$this->setReturn('id', $topic->getId());
					$this->setReturn('success', true);
				}
			}
		}
	}
?>