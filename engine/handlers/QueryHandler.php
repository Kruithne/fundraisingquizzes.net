<?php
	class QueryHandler
	{
		/**
		 * Add an answer to an existing query.
		 * @param int $queryID ID of the query to add the answer to.
		 * @param string $answer The answer to add.
		 */
		public static function addQueryAnswer($queryID, $answer)
		{
			$query = DB::get()->prepare('UPDATE quiz_queries SET answer = :answer, answer_user = :user WHERE queryID = :id');
			$query->setValue(':answer', $answer);
			$query->setValue(':user', Authenticator::getLoggedInUser()->getId());
			$query->setValue(':id', $queryID);
			$query->execute();

			$query = DB::get()->prepare('UPDATE quizzes SET updated_flag = :flag WHERE ID = (SELECT quizID FROM quiz_queries WHERE queryID = :id)');
			$query->setValue(':flag', Quiz::DEFAULT_UPDATE_FLAG);
			$query->setValue(':id', $queryID);
			$query->execute();
		}

		/**
		 * Delete an existing query.
		 * @param int $queryID ID of the query to delete.
		 */
		public static function deleteQuery($queryID)
		{
			DB::get()->prepare('DELETE FROM quiz_queries WHERE queryID = :id')->setValue(':id', $queryID)->execute();
		}

		/**
		 * Add a query to a quiz.
		 * @param quiz $quiz Quiz to the add the query to.
		 * @param string $query_text Query to add.
		 * @return null|int
		 */
		public static function addQuery($quiz, $query_text)
		{
			if ($quiz->getId() !== Quiz::NONE && !Authenticator::isLoggedIn())
				return null;

			$user_id = Authenticator::getLoggedInUser()->getId();

			$query = DB::get()->prepare('UPDATE quizzes SET updated_flag = :flag WHERE ID = :quiz');
			$query->setValue(':flag', Quiz::DEFAULT_UPDATE_FLAG);
			$query->setValue(':quiz', $quiz->getId());
			$query->execute();

			$query = DB::get()->prepare('INSERT INTO quiz_queries (quizID, query, query_user) VALUES(:quiz, :query, :user)');
			$query->setValue(':quiz', $quiz->getId());
			$query->setValue(':query', $query_text);
			$query->setValue(':user', $user_id);
			$query->execute();

			return DB::get()->getLastInsertID('quiz_queries');
		}
	}
?>