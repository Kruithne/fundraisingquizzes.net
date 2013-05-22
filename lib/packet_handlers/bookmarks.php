<?php
	class BookmarksPacketHandler extends PacketHandler
	{
		protected function run()
		{
			$this->output['bookmarks'] = QuizHandler::GetBookmarkedQuizzes();
		}
	}
?>