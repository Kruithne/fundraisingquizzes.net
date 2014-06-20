<?php
	class QuerySubmitListener extends PacketListener
	{
		public function run()
		{
			$this->setReturn('success', false);

			if (!Authenticator::isLoggedIn())
				return;

			$query = REST::Get('query');
			$quiz = Quiz::get((int) REST::Get('quiz'));

			if ($query !== null && $quiz instanceof Quiz)
			{
				$id = QueryHandler::addQuery($quiz, $query);
				if ($id !== NULL)
				{
					$this->setReturn('success', true);
					$this->setReturn('queryID', $id);
				}
			}
		}
	}
?>