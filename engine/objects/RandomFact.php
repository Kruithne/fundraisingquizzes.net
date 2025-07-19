<?php
	class RandomFact
	{
		/**
		 * @param int $id
		 * @param string $text
		 * @param $thread
		 */
		public function __construct($id, $text, $thread)
		{
			$this->id = $id;
			$this->text = $text;
			$this->thread = $thread;

			if (strpos($this->text, '%usercount%') !== false)
				$this->text = str_replace('%usercount%', UserHandler::getUserCount(), $this->text);
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
		public function getText()
		{
			return $this->text;
		}

		/**
		 * @return ForumTopic
		 */
		public function getThread()
		{
			return ForumTopic::get($this->getThreadId());
		}

		/**
		 * @return int
		 */
		public function getThreadId()
		{
			if ($this->thread == null)
			{
				$this->thread = self::createThread($this->getText())->getId();
				$query = DB::get()->prepare('UPDATE random_facts SET threadID = :threadID WHERE ID = :id');
				$query->setValue(':threadID', $this->thread);
				$query->setValue(':id', $this->getId());
				$query->execute();
			}

			return $this->thread;
		}

		/**
		 * Delete this random fact from the database.
		 */
		public function delete()
		{
			DB::get()->prepare('DELETE FROM random_facts WHERE ID = :id')->setValue(':id', $this->getId())->execute();
		}

		/**
		 * Return a random fact.
		 * @return null|RandomFact
		 */
		public static function getRandom()
		{
			$result = DB::get()->prepare('SELECT ID, text, threadID FROM random_facts ORDER BY RAND() LIMIT 1')->getFirstRow();
			return $result == NULL ? NULL : new RandomFact($result->ID, $result->text, $result->threadID);
		}

		/**
		 * Return all random facts available.
		 * @return RandomFact[]
		 */
		public static function getAll()
		{
			$return = Array();
			foreach (DB::get()->prepare('SELECT ID, text, threadID FROM random_facts')->getRows() as $fact)
				$return[] = new RandomFact($fact->ID, $fact->text, $fact->threadID);

			return $return;
		}

		/**
		 * @param $id
		 * @return null|RandomFact
		 */
		public static function get($id)
		{
			if ($id == NULL)
				return NULL;

			$query = DB::get()->prepare('SELECT text, threadID FROM random_facts WHERE ID = :id');
			$query->setValue(':id', $id);

			$result = $query->getFirstRow();
			return $result == NULL ? NULL : new RandomFact($id, $result->text, $result->threadID);
		}

		/**
		 * Create a new random fact and return an object for it.
		 * @param $text
		 * @return RandomFact
		 */
		public static function create($text)
		{
			$thread = self::createThread($text);

			$query = DB::get()->prepare('INSERT INTO random_facts (text, threadID) VALUES(:text, :thread)');
			$query->setValue(':text', $text);
			$query->setValue(':thread', $thread->getId());
			$query->execute();

			return new RandomFact(DB::get()->getLastInsertID('random_facts'), $text, $thread->getId());
		}

		/**
		 * @param string $text
		 * @return ForumTopic|int
		 */
		private static function createThread($text)
		{
			return ForumTopic::create('Did you know...', "Did you know: " . $text, 1, ForumTopic::TYPE_FACT);
		}

		private $id;
		private $text;
		private $thread;
	}
?>