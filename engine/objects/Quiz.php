<?php
	class Quiz
	{
		const NONE = 0;
		const DEFAULT_UPDATE_FLAG = 4;
		const DEFAULT_NEW_FLAG = 7;

		/**
		 * Construct a new quiz object.
		 * @param string $title Title of the quiz.
		 * @param string $charity Charity which the quiz is for.
		 * @param string $description First-line description of the quiz.
		 * @param string $extra Extra description of the quiz.
		 * @param int $closing The date which the quiz closes.
		 * @param int $submitter The ID of the user who submitted the quiz.
		 * @param boolean $accepted True if the quiz has been accepted.
		 * @param int $update Days the quiz is flagged as updated for.
		 * @param int $new Days the quiz is flagged as new for.
		 * @param int $id ID of the quiz. Leave blank if the quiz has never been persisted.
		 */
		public function __construct($title, $charity, $description, $extra, $closing, $submitter, $accepted = false, $update = self::DEFAULT_UPDATE_FLAG, $new = self::DEFAULT_NEW_FLAG, $id = Quiz::NONE)
		{
			$this->id = $id;
			$this->title = $title;
			$this->charity = $charity;
			$this->description = $description;
			$this->extra = $extra;
			$this->closing = $closing;
			$this->update = $update;
			$this->submitted_by = $submitter;
			$this->accepted = $accepted;
			$this->new = $new;
			$this->queries = Array();
		}

		/**
		 * @return int
		 */
		public function getId()
		{
			return $this->id;
		}

		/**
		 * @return int
		 */
		public function getNewDays()
		{
			return $this->new;
		}

		/**
		 * @return string
		 */
		public function getUpdateDays()
		{
			return $this->update;
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
		 * @param string $closing
		 */
		public function setClosing($closing)
		{
			$this->closing = $closing;
		}

		/**
		 * @return string
		 */
		public function getClosing()
		{
			return $this->closing;
		}

		/**
		 * @param string $description
		 */
		public function setDescription($description)
		{
			$this->description = $description;
		}

		/**
		 * @return string
		 */
		public function getDescription()
		{
			return $this->description;
		}

		/**
		 * @param string $extra
		 */
		public function setExtra($extra)
		{
			$this->extra = $extra;
		}

		/**
		 * @return string
		 */
		public function getExtra()
		{
			return $this->extra;
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
		 * @param mixed $submitted_by
		 */
		public function setSubmittedBy($submitted_by)
		{
			$this->submitted_by = $submitted_by;
		}

		/**
		 * @return mixed
		 */
		public function getSubmittedBy()
		{
			return $this->submitted_by;
		}

		/**
		 * @param boolean $accepted
		 */
		public function setAccepted($accepted)
		{
			$this->accepted = $accepted;
		}

		/**
		 * @return boolean
		 */
		public function isAccepted()
		{
			return $this->accepted;
		}

		/**
		 * @return QuizQuery[]
		 */
		public function getQueries()
		{
			return $this->queries;
		}

		/**
		 * Delete the current quiz from the database.
		 */
		public function delete()
		{
			if ($this->id !== Quiz::NONE)
			{
				DB::get()->prepare('UPDATE quizzes SET deleted = 1 WHERE ID = :id')->setValue(':id', $this->id)->execute();
			}
		}

		/**
		 * Pull any queries for this quiz into the object.
		 */
		public function pullQueries()
		{
			$this->queries = Array();
			if ($this->getId() === Quiz::NONE)
				return;

			$query = DB::get()->prepare('SELECT queryID, query, answer, query_user, answer_user FROM quiz_queries WHERE quizID = :id');
			$query->setValue(':id', $this->getId());

			foreach ($query->getRows() as $row)
				$this->queries[] = new QuizQuery($row->queryID, $row->query, $row->answer, $row->query_user, $row->answer_user);
		}

		/**
		 * Persist this quiz object in the database.
		 */
		public function persist()
		{
			$query = null;
			if ($this->id == Quiz::NONE)
			{
				$query = DB::get()->prepare('INSERT INTO quizzes (title, charity, description, description_extra, closing, submitted_by, new_flag, accepted)
					VALUES(:title, :charity, :description, :extra, :closing, :submitter, :new, :accepted)');

				$query->setValue(':new', QUIZ::DEFAULT_NEW_FLAG);
			}
			else
			{
				$query = DB::get()->prepare('UPDATE quizzes SET
					title = :title,
					charity = :charity,
					description = :description,
					description_extra = :extra,
					closing = :closing,
					submitted_by = :submitter,
					accepted = :accepted,
					updated_flag = :updated WHERE ID = :id');

				$query->setValue(':updated', Quiz::DEFAULT_UPDATE_FLAG);
				$query->setValue(':id', $this->id);
			}

			$query->setValue(':title', $this->title);
			$query->setValue(':charity', $this->charity);
			$query->setValue(':description', $this->getDescription());
			$query->setValue(':extra', $this->extra);
			$query->setValue(':closing', $this->closing);
			$query->setValue(':submitter', $this->submitted_by);
			$query->setValue(':accepted', $this->accepted ? 1 : 0);

			$query->execute();
		}

		/**
		 * Retrieve data relating to a specific quiz.
		 * @param $id int ID of the quiz to query.
		 * @return int|Quiz Populated quiz object or Quiz::NONE
		 */
		public static function get($id)
		{
			if ($id == 0)
				return QUIZ::NONE;

			$query = DB::get()->prepare('SELECT title, charity, description, description_extra, closing, submitted_by, accepted, updated_flag, new_flag FROM quizzes WHERE ID = :id');
			$query->setValue(':id', $id);

			$result = $query->getFirstRow();

			if ($result == null)
				return Quiz::NONE;

			$quiz = new Quiz(
				$result->title,
				$result->charity,
				$result->description,
				$result->description_extra,
				$result->closing,
				$result->submitted_by,
				(bool) $result->accepted,
				$result->updated_flag,
				$result->new_flag,
				$id
			);

			$quiz->pullQueries();
			return $quiz;
		}

		/**
		 * Retrieve an array of quizzes available.
		 * @param bool $acceptedOnly Should only accepted quizzes be queried?
		 * @return array
		 */
		public static function getAll($acceptedOnly = true)
		{
			$query = DB::get()->prepare('SELECT ID, title, charity, description, description_extra, closing, submitted_by, accepted, updated_flag, new_flag FROM quizzes WHERE deleted = 0' . ($acceptedOnly ? ' AND accepted = 1' : '') . ' ORDER BY closing ASC');
			$return = Array();

			foreach ($query->getRows() as $row)
			{
				$quiz = new Quiz(
					$row->title,
					$row->charity,
					$row->description,
					$row->description_extra,
					$row->closing,
					$row->submitted_by,
					(bool) $row->accepted,
					$row->updated_flag,
					$row->new_flag,
					$row->ID
				);
				$quiz->pullQueries();
				$return[] = $quiz;
			}

			return $return;
		}

		/**
		 * Get the current quiz of the week.
		 * @return int|Quiz
		 */
		public static function getWeekly()
		{
			return self::get(Settings::get('weeklyQuiz'));
		}

		private $id;
		private $title;
		private $charity;
		private $description;
		private $extra;
		private $closing;
		private $update;
		private $new;
		private $accepted;
		private $queries;
		private $submitted_by;
	}
?>