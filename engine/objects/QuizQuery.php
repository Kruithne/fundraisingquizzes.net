<?php
	class QuizQuery
	{
		/**
		 * Construct a query object.
		 * @param int $id
		 * @param string $query
		 * @param string|null $answer
		 * @param int $query_user
		 * @param int|null $answer_user
		 */
		public function __construct($id, $query, $answer = NULL, $query_user, $answer_user = NULL)
		{
			$this->id = $id;
			$this->query = $query;
			$this->answer = $answer;
			$this->query_user = UserHandler::getUser($query_user);

			if ($answer_user !== NULL)
				$this->answer_user = UserHandler::getUser($answer_user);
		}

		/**
		 * @return User
		 */
		public function getAnswerUser()
		{
			return $this->answer_user;
		}

		/**
		 * @return User
		 */
		public function getQueryUser()
		{
			return $this->query_user;
		}

		/**
		 * @return int
		 */
		public function getId()
		{
			return $this->id;
		}

		/**
		 * @return null|string
		 */
		public function getAnswer()
		{
			return $this->answer;
		}

		/**
		 * @return string
		 */
		public function getQuery()
		{
			return $this->query;
		}

		private $id;
		private $query;
		private $answer;
		private $query_user;
		private $answer_user;
	}
?>