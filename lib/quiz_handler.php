<?php
	class QuizHandler
	{
		public static function GetQuizzes()
		{
			// TODO: Check the ordering on this list.
			$query = DB::prepare('SELECT ID, title, charity, description, description_extra, closing, updated_flag, new_flag FROM quizzes WHERE accepted = 1 ORDER BY closing ASC');
			$query->execute();

			return $query->fetchAll();
		}

		public static function GetQuizList()
		{
			$query = DB::prepare('SELECT ID, title FROM quizzes ORDER BY closing ASC');
			$query->execute();

			return DB::prepareObjects($query);
		}

		public static function GetBookmarkedQuizzes()
		{
			if (Authenticator::IsLoggedIn())
			{
				$return = Array();

				$query = DB::prepare('SELECT QuizID FROM bookmarks WHERE UserID = :user');
				$query->bindValue(':user', Authenticator::GetLoggedInUserID());
				$query->execute();

				while ($bookmark = $query->fetchObject())
					$return[] = $bookmark->QuizID;

				return $return;
			}
			return null;
		}

		public static function HasQuizBookmarked($quiz_id)
		{
			$query = DB::prepare('SELECT COUNT(*) AS bookmarks FROM bookmarks WHERE UserID = :user AND QuizID = :quiz');
			$query->bindValue(':user', Authenticator::GetLoggedInUserID());
			$query->bindValue(':quiz', $quiz_id);
			$query->execute();

			if ($result = $query->fetchObject())
				if ($result->bookmarks > 0) return true;

			return false;
		}

		public static function BookmarkQuiz($quiz_id)
		{
			if (Authenticator::IsLoggedIn())
			{
				$query = DB::prepare('INSERT IGNORE INTO bookmarks (UserID, QuizID) VALUES(:user, :quiz)');
				$query->bindValue(':user', Authenticator::GetLoggedInUserID());
				$query->bindValue(':quiz', $quiz_id);
				$query->execute();
			}
		}

		public static function RemoveBookmark($quiz_id)
		{
			if (Authenticator::IsLoggedIn())
			{
				$query = DB::prepare('DELETE FROM bookmarks WHERE QuizID = :quiz AND UserID = :user');
				$query->bindValue(':user', Authenticator::GetLoggedInUserID());
				$query->bindValue(':quiz', $quiz_id);
				$query->execute();
			}
		}

		public static function GetWeeklyQuiz()
		{
			$query = DB::prepare('SELECT title FROM quizzes WHERE ID = (SELECT settingValue FROM settings WHERE settingKey = :key)');
			$query->bindValue(':key', 'weeklyQuiz');
			$query->execute();

			if ($quiz = $query->fetchObject())
				return $quiz->title;

			return 'Coming Soon';
		}

		public static function GetQuizData($quiz_id)
		{
			$query = DB::prepare('SELECT title, charity, description, description_extra, closing, updated_flag, new_flag FROM quizzes WHERE ID = :quiz');
			$query->bindValue(':quiz', $quiz_id);
			$query->execute();

			if ($quiz = $query->fetchObject())
			{
				$quiz->ID = $quiz_id;
				return $quiz;
			}

			return null;
		}
	}
?>