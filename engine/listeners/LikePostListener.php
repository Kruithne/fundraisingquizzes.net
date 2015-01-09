<?php
	class LikePostListener extends PacketListener
	{
		public function run()
		{
			$post = intval(REST::Get('post'));
			if ($post > 0 && Authenticator::isLoggedIn())
			{
				$post = ForumReply::get($post);
				if ($post != NULL)
					$post->likePost();
			}
		}
	}
?>