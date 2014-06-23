<?php
	class GetForumTopics extends PacketListener
	{
		public function run()
		{
			$topics = Array();
			if (Authenticator::isLoggedIn())
			{
				$offset = REST::Get('offset');
				if ($offset === NULL)
					$offset = 0;

				$topics = ForumTopic::getAll($offset, 30);
			}
			$this->setReturn('topics', $topics);
		}
	}
?>