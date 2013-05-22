<?php
	class VotesPacketHandler extends PacketHandler
	{
		protected function run()
		{
			$this->output['votes'] = VoteHandler::GetUserVotes();
		}
	}
?>