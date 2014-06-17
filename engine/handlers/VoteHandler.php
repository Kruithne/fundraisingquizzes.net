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

		/**
		 * @param Quiz $quiz The quiz to vote for.
		 */
		public static function castVote($quiz)
		{
			$query = DB::get()->prepare('INSERT IGNORE INTO quiz_votes (quizID, userID) VALUES(:quiz, :user)');
			$query->setValue(':quiz', $quiz->getId());
			$query->setValue(':user', Authenticator::getLoggedInUser()->getId());
			$query->execute();
		}

		/**
		 * Grab all the quizzes a user has voted for.
		 * @param null|User $user
		 * @return array
		 */
		public static function getVotedQuizzes($user = null)
		{
			$quizzes = Array();
			if ($user == null)
			{
				if (Authenticator::isLoggedIn())
					$user = Authenticator::getLoggedInUser();
				else
					return $quizzes;
			}

			$query = DB::get()->prepare('SELECT quizID FROM quiz_votes WHERE userID = :user');
			$query->setValue(':user', $user->getId());

			foreach ($query->getRows() as $row)
				$quizzes[] = $row->quizID;

			return $quizzes;
		}
	}
?>