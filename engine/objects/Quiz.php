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
		 * @param string $update Days the quiz is flagged as updated for.
		 * @param int $new Days the quiz is flagged as new for.
		 * @param int $id ID of the quiz. Leave blank if the quiz has never been persisted.
		 */
		public function __construct($title, $charity, $description, $extra, $closing, $update, $new, $id = Quiz::NONE)
		{
			$this->id = $id;
			$this->title = $title;
			$this->charity = $charity;
			$this->description = $description;
			$this->extra = $extra;
			$this->closing = $closing;
			$this->update = $update;
			$this->new = $new;
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
		 * @param int $closing
		 */
		public function setClosing($closing)
		{
			$this->closing = $closing;
		}

		/**
		 * @return int
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
		 * Persist this quiz object in the database.
		 */
		public function persist()
		{
			$query = null;
			if ($this->id == Quiz::NONE)
			{
				$query = DB::get()->prepare('INSERT INTO quizzes (title, charity, description, description_extra, closing, updated_flag)
					VALUES(:title, :charity, :description, :extra, :closing, :updated)');

				$query->setValue(':updated', Quiz::DEFAULT_UPDATE_FLAG);
			}
			else
			{
				$query = DB::get()->prepare('UPDATE quizzes SET
					title = :title,
					charity = :charity,
					description = :description,
					description_extra = :extra,
					closing = :closing,
					new_flag = :new WHERE ID = :id');

				$query->setValue(':new', QUIZ::DEFAULT_NEW_FLAG);
				$query->setValue(':id', $this->id);
			}

			$query->setValue(':title', $this->title);
			$query->setValue(':charity', $this->charity);
			$query->setValue(':extra', $this->extra);
			$query->setValue(':closing', $this->closing);

			$query->execute();
		}

		/**
		 * Retrieve data relating to a specific quiz.
		 * @param $id int ID of the quiz to query.
		 * @return int|Quiz Populated quiz object or Quiz::NONE
		 */
		public static function get($id)
		{
			$query = DB::get()->prepare('SELECT title, charity, description, description_extra, closing, updated_flag, new_flag FROM quizzes WHERE ID = :id');
			$query->setValue(':id', $id);

			$result = $query->getFirstRow();

			return $result == null ? Quiz::NONE : new Quiz(
				$result->title,
				$result->charity,
				$result->description,
				$result->description_extra,
				$result->closing,
				$result->updated_flag,
				$result->new_flag,
				$id
			);
		}

		/**
		 * Retrieve an array of quizzes available.
		 * @param bool $acceptedOnly Should only accepted quizzes be queried?
		 * @return array
		 */
		public static function getAll($acceptedOnly = true)
		{
			$query = DB::get()->prepare('SELECT ID, title, charity, description, description_extra, closing, updated_flag, new_flag FROM quizzes WHERE accepted = ' . ($acceptedOnly ? 1 : 0) . ' ORDER BY closing ASC');
			$return = Array();

			foreach ($query->getRows() as $row)
			{
				$return[] = new Quiz(
					$row->title,
					$row->charity,
					$row->description,
					$row->description_extra,
					$row->closing,
					$row->updated_flag,
					$row->new_flag,
					$row->ID
				);
			}

			return $return;
		}

		private $id;
		private $title;
		private $charity;
		private $description;
		private $extra;
		private $closing;
		private $update;
		private $new;
	}
?>