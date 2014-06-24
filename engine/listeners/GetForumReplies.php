<?php
	class GetForumReplies extends PacketListener
	{
		public function run()
		{
			$replies = [];

			if (!Authenticator::isLoggedIn())
				return;

			$topic = ForumTopic::get((int) REST::Get('id'));
			$offset = (int) REST::Get('offset');

			if ($topic instanceof ForumTopic)
				$replies = $topic->getReplies($offset, 30);

			$this->setReturn('replies', $replies);
		}
	}
?>