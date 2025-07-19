<?php
	class GetQuizData extends PacketListener
	{
		public function run()
		{
			$this->setReturn('votes', VoteHandler::getVotedQuizzes());
			$this->setReturn('bookmarks', BookmarkHandler::getBookmarkedQuizzes());
		}
	}
?>