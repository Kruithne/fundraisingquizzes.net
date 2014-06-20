<?php
	class BookmarkHandler
	{
		/**
		 * Bookmark a quiz as the current user, if the quiz is already bookmarked the bookmark will be removed.
		 * @param Quiz $quiz
		 */
		public static function bookmarkQuiz($quiz)
		{
			$id = $quiz->getId();
			$query = null;

			if (in_array($id, self::getBookmarkedQuizzes()))
				$query = DB::get()->prepare('DELETE FROM bookmarks WHERE quizID = :quiz AND userID = :user');
			else
				$query = DB::get()->prepare('INSERT IGNORE INTO bookmarks (userID, quizID) VALUES(:user, :quiz)');

			$query->setValue(':user', Authenticator::getLoggedInUser()->getId());
			$query->setValue(':quiz', $id);
			$query->execute();
		}

		/**
		 * Get the quizzes bookmarked by a certain user.
		 * @param null|int $user
		 * @return array
		 */
		public static function getBookmarkedQuizzes($user = null)
		{
			$quizzes = Array();
			if ($user == null)
			{
				if (Authenticator::isLoggedIn())
					$user = Authenticator::getLoggedInUser();
				else
					return $quizzes;
			}

			$query = DB::get()->prepare('SELECT quizID FROM bookmarks WHERE userID = :user');
			$query->setValue(':user', $user->getId());

			foreach ($query->getRows() as $row)
				$quizzes[] = $row->quizID;

			return $quizzes;
		}

		/**
		 * Purge all bookmarks for a specific quiz.
		 * @param int $quizID ID of the quiz to purge for.
		 */
		public static function purge($quizID)
		{
			DB::get()->prepare('DELETE FROM bookmarks WHERE quizID = :id')->setValue(':id', $quizID)->execute();
		}
	}
?>