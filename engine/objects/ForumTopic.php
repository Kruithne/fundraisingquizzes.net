<?php
	class ForumTopic implements JsonSerializable
	{
		const NONE = 0;

		public function __construct($id, $title, $creator, $posted, $sticky)
		{
			$this->id = $id;
			$this->title = $title;
			$this->creator = $creator;
			$this->posted = $posted;
			$this->sticky = $sticky;
		}

		/**
		 * @return int
		 */
		public function getCreator()
		{
			return $this->creator;
		}

		/**
		 * @return int
		 */
		public function getId()
		{
			return $this->id;
		}

		/**
		 * @return string
		 */
		public function getPosted()
		{
			return $this->posted;
		}

		/**
		 * @return string
		 */
		public function getTitle()
		{
			return $this->title;
		}

		/**
		 * @return int
		 */
		public function isSticky()
		{
			return $this->sticky;
		}

		/**
		 * @param bool|int $sticky
		 */
		public function setSticky($sticky)
		{
			$this->sticky = (int) $sticky;
		}

		/**
		 * (PHP 5 &gt;= 5.4.0)<br/>
		 * Specify data which should be serialized to JSON
		 * @link http://php.net/manual/en/jsonserializable.jsonserialize.php
		 * @return mixed data which can be serialized by <b>json_encode</b>,
		 * which is a value of any type other than a resource.
		 */
		public function jsonSerialize()
		{
			return [
				'id' => $this->getId(),
				'title' => $this->title,
				'creator' => $this->getCreator(),
				'creatorName' => UserHandler::getUser($this->getCreator())->getUsername(),
				'posted' => $this->getPosted(),
				'sticky' => $this->isSticky()
			];
		}

		/**
		 * Retrieve a forum topic by ID.
		 * @param int $id
		 * @return ForumTopic|int
		 */
		public static function get($id)
		{
			if ($id == ForumTopic::NONE)
				return $id;

			$query = DB::get()->prepare('SELECT title, creator, posted, sticky FROM topics WHERE ID = :id');
			$query->setValue(':id', $id);
			$query->execute();

			$topic = $query->getFirstRow();
			return $topic !== NULL ? new ForumTopic($id, $topic->title, $topic->creator, $topic->posted, $topic->sticky) : ForumTopic::NONE;
		}

		/**
		 * Retrieve all available forum topics.
		 * @param int $start
		 * @param int $limit
		 * @return array
		 */
		public static function getAll($start = 0, $limit = 30)
		{
			$topics = Array();

			$query = DB::get()->prepare("SELECT ID, title, creator, posted, sticky FROM topics ORDER BY sticky DESC, posted DESC LIMIT $start, $limit");
			foreach ($query->getRows() as $topic)
				$topics[] = new ForumTopic($topic->ID, $topic->title, $topic->creator, $topic->posted, $topic->sticky);

			return $topics;
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
		 * @var int
		 */
		private $creator;

		/**
		 * @var string
		 */
		private $posted;

		/**
		 * @var int
		 */
		private $sticky;
	}
?>