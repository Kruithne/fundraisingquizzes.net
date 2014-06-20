<?php
	class GetVoteData extends PacketListener
	{
		public function run()
		{
			$this->setReturn('data', VoteHandler::getVotedQuizzes());
		}
	}
?>