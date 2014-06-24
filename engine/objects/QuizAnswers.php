<?php
	class QuizAnswers
	{
		/**
		 * Create a new answer object.
		 * @param $id int
		 * @param $title string
		 * @param $charity string
		 * @param $closed string
		 * @param $answers string
		 * @param int $accepted
		 * @param int $submitter
		 */
		public function __construct($id, $title, $charity, $closed, $answers, $accepted, $submitter)
		{
			$this->id = $id;
			$this->title = $title;
			$this->charity = $charity;
			$this->closed = $closed;
			$this->answers = $answers;
			$this->accepted = $accepted;
			$this->submitter = $submitter;
		}

		/**
		 * @return int
		 */
		public function getId()
		{
			return $this->id;
		}

		/**
		 * @param string $answers
		 */
		public function setAnswers($answers)
		{
			$this->answers = $answers;
		}

		/**
		 * @return string
		 */
		public function getAnswers()
		{
			return $this->answers;
		}

		/**
		 * @param string $charity
		 */
		public function setCharity($charity)
		{
			$this->charity = $charity;
		}

		/**
		 * @return string
		 */
		public function getCharity()
		{
			return $this->charity;
		}

		/**
		 * @param string $closed
		 */
		public function setClosed($closed)
		{
			$this->closed = $closed;
		}

		/**
		 * @return int
		 */
		public function getClosed()
		{
			return $this->closed;
		}

		/**
		 * @param string $title
		 */
		public function setTitle($title)
		{
			$this->title = $title;
		}

		/**
		 * @return string
		 */
		public function getTitle()
		{
			return $this->title;
		}

		/**
		 * @param bool $accepted
		 */
		public function setAccepted($accepted)
		{
			$this->accepted = (int) $accepted;
		}

		/**
		 * @return int
		 */
		public function isAccepted()
		{
			return $this->accepted;
		}

		/**
		 * @return int
		 */
		public function getSubmitter()
		{
			return $this->submitter;
		}

		/**
		 * Persist any changes made to this quiz answer object.
		 */
		public function persist()
		{
			$query = DB::get()->prepare('UPDATE quiz_answers SET title = :title, charity = :charity, closed = :closed, answers = :answers, accepted = :accepted WHERE ID = :id');
			$query->setValue(':title', $this->getTitle());
			$query->setValue(':charity', $this->getCharity());
			$query->setValue(':closed', $this->getClosed());
			$query->setValue(':answers', $this->getAnswers());
			$query->setValue(':accepted', $this->isAccepted());
			$query->setValue(':id', $this->getId());
			$query->execute();
		}

		/**
		 * Delete the answer set this object represents.
		 */
		public function delete()
		{
			DB::get()->prepare('DELETE FROM quiz_answers WHERE ID = :id')->setValue(':id', $this->getId())->execute();
		}

		/**
		 * Retrieve a set of answers for a quiz.
		 * @param int $id Quiz ID
		 * @return null|QuizAnswers
		 */
		public static function get($id)
		{
			$query = DB::get()->prepare('SELECT title, charity, UNIX_TIMESTAMP(closed) AS closed, answers, accepted, submitter FROM quiz_answers WHERE ID = :id');
			$query->setValue(':id', $id);

			$result = $query->getFirstRow();
			return $result === NULL ? NULL : new QuizAnswers($id, $result->title, $result->charity, $result->closed, $result->answers, $result->accepted, $result->submitter);
		}

		/**
		 * Return all available quiz answer sets.
		 * @return QuizAnswers[]
		 */
		public static function getAll()
		{
			$objects = Array();

			$query = DB::get()->prepare('SELECT ID, title, charity, UNIX_TIMESTAMP(closed) AS closed, answers, accepted, submitter FROM quiz_answers ORDER BY closed DESC');
			foreach ($query->getRows() as $row)
				$objects[$row->ID] = new QuizAnswers($row->ID, $row->title, $row->charity, $row->closed, $row->answers, $row->accepted, $row->submitter);

			return $objects;
		}

		/**
		 * Create a new answer set object.
		 * @param string $title
		 * @param string $charity
		 * @param string $closed
		 * @param string $answers
		 * @param int $accepted
		 * @param int $submitter
		 * @return QuizAnswers
		 */
		public static function create($title, $charity, $closed, $answers, $accepted, $submitter)
		{
			$query = DB::get()->prepare('INSERT INTO quiz_answers (title, charity, closed, answers, accepted, submitter) VALUES(:title, :charity, :closed, :answers, :accepted, :submitter)');
			$query->setValue(':title', $title);
			$query->setValue(':charity', $charity);
			$query->setValue(':closed', $closed);
			$query->setValue(':answers', $answers);
			$query->setValue(':accepted', $accepted);
			$query->setValue(':submitter', $submitter);
			$query->execute();

			return new QuizAnswers(DB::get()->getLastInsertID('quiz_answers'), $title, $charity, $closed, $answers, $accepted, $submitter);
		}

		/**
		 * @var int
		 */
		private $id;

		/**
		 * @var string
		 */
		private $title;

		/**
		 * @var string
		 */
		private $charity;

		/**
		 * @var int
		 */
		private $closed;

		/**
		 * @var string
		 */
		private $answers;

		/**
		 * @var int
		 */
		private $accepted;

		/**
		 * @var int
		 */
		private $submitter;
	}
?>