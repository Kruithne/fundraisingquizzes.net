<?php
	class RandomFact
	{
		/**
		 * @param int $id
		 * @param string $text
		 */
		public function __construct($id, $text)
		{
			$this->id = $id;
			$this->text = $text;
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
			$result = DB::get()->prepare('SELECT ID, text FROM random_facts ORDER BY RAND() LIMIT 1')->getFirstRow();
			return $result == NULL ? NULL : new RandomFact($result->ID, $result->text);
		}

		/**
		 * Return all random facts available.
		 * @return RandomFact[]
		 */
		public static function getAll()
		{
			$return = Array();
			foreach (DB::get()->prepare('SELECT ID, text FROM random_facts')->getRows() as $fact)
				$return[] = new RandomFact($fact->ID, $fact->text);

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

			$query = DB::get()->prepare('SELECT text FROM random_facts WHERE ID = :id');
			$query->setValue(':id', $id);

			$result = $query->getFirstRow();
			return $result == NULL ? NULL : new RandomFact($id, $result->text);
		}

		/**
		 * Create a new random fact and return an object for it.
		 * @param $text
		 * @return RandomFact
		 */
		public static function create($text)
		{
			$query = DB::get()->prepare('INSERT INTO random_facts (text) VALUES(:text)');
			$query->setValue(':text', $text);
			$query->execute();

			return new RandomFact(DB::get()->getLastInsertID('random_facts'), $text);
		}

		private $id;
		private $text;
	}
?>