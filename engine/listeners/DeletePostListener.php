<?php
	class DeletePostListener extends PacketListener
	{
		public function run()
		{
			$post = intval(REST::Get('post'));
			if ($post > 0 && Authenticator::isLoggedInAsAdmin())
			{
				$post = ForumReply::get($post);
				$post->delete();
			}
		}
	}
?>