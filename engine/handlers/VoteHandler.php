<?php
	class VoteHandler
	{
		/**
		 * @return int|Quiz
		 */
		public static function getHighestQuiz()
		{
			$row = DB::get()->prepare('SELECT quizID FROM quiz_votes GROUP BY quizID ORDER BY COUNT(*) DESC LIMIT 1')->getFirstRow();
			return $row === NULL ? Quiz::NONE : Quiz::get($row->quizID);
		}

		/**
		 * Purge the table of all existing quiz votes.
		 */
		public static function clearAllVotes()
		{
			DB::get()->execute('DELETE FROM quiz_votes');
		}
	}
?>