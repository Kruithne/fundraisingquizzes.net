<?php
	class VoteHandler
	{
		public static function HasVotedForQuiz($quiz)
		{
			$query = DB::prepare('SELECT COUNT(*) AS vote_count FROM quiz_votes WHERE QuizID = :quiz AND UserID = :user');
			$query->bindValue(':quiz', $quiz);
			$query->bindValue(':user', Authenticator::GetLoggedInUserID());
			$query->execute();

			if ($result = $query->fetchObject())
				if ($result->vote_count > 0)
					return true;

			return false;
		}

		public static function VoteForQuiz($quiz)
		{
			if (Authenticator::IsLoggedIn())
			{
				$query = DB::prepare('INSERT IGNORE INTO quiz_votes (QuizID, UserID) VALUES(:quiz, :user)');
				$query->bindValue(':quiz', $quiz);
				$query->bindValue(':user', Authenticator::GetLoggedInUserID());
				$query->execute();
			}
		}

		public static function GetUserVotes($user = null)
		{
			if ($user === null)
				$user = Authenticator::GetLoggedInUserID();

			$votes = Array();
			$query = DB::prepare('SELECT QuizID FROM quiz_votes WHERE UserID = :user');
			$query->bindValue(':user', $user);
			$query->execute();

			while ($result = $query->fetchObject())
				$votes[] = $result->QuizID;

			return $votes;
		}

		public static function GetVoteCount($user = null)
		{
			if ($user === null)
				$user = Authenticator::GetLoggedInUserID();

			$query = DB::prepare('SELECT COUNT(*) AS vote_count FROM quiz_votes WHERE UserID = :user');
			$query->bindValue(':user', $user);
			$query->execute();

			if ($result = $query->fetchObject())
				return $result->vote_count;

			return 0;
		}
	}
?>