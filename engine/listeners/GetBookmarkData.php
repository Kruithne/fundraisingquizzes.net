<?php
	class GetBookmarkData extends PacketListener
	{
		public function run()
		{
			$this->setReturn('data', BookmarkHandler::getBookmarkedQuizzes());
		}
	}
?>