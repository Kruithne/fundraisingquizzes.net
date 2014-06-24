<?php
	class ForumReply implements JsonSerializable
	{
		/**
		 * @param int $id
		 * @param int $topic
		 * @param string $text
		 * @param int $poster
		 * @param string $posted
		 * @param string|null $edited
		 */
		public function __construct($id, $topic, $text, $poster, $posted, $edited)
		{
			$this->id = $id;
			$this->topic = $topic;
			$this->text = $text;
			$this->poster = $poster;
			$this->posted = $posted;
			$this->edited = $edited;
		}

		/**
		 * @return null|string
		 */
		public function getEdited()
		{
			return $this->edited;
		}

		/**
		 * @param string $text
		 */
		public function setText($text)
		{
			$this->text = $text;
		}

		/**
		 * @return string
		 */
		public function getText()
		{
			return $this->text;
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
		 * @return int
		 */
		public function getPoster()
		{
			return $this->poster;
		}

		/**
		 * @return int
		 */
		public function getTopic()
		{
			return $this->topic;
		}

		/**
		 * Persist any changes made to this forum reply.
		 */
		public function persist()
		{
			$query = DB::get()->prepare('UPDATE topic_replies SET text = :text, edited = NOW() WHERE ID = :id');
			$query->setValue(':text', $this->getText());
			$query->setValue(':id', $this->getId());
			$query->execute();
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
			$user = UserHandler::getUser($this->getPoster());
			return [
				'id' => $this->getId(),
				'text' => $this->getText(),
				'posted' => $this->getPosted(),
				'poster' => $this->getPoster(),
				'posterName' => $user->getUsername(),
				'posterAvatar' => AvatarHandler::getAvatarImage($user->getAvatar()),
				'edited' => $this->getEdited()
			];
		}

		/**
		 * @param int $topic
		 * @param string $text
		 * @param int|User $poster
		 * @return ForumReply
		 */
		public static function create($topic, $text, $poster)
		{
			if ($poster instanceof User)
				$poster = $poster->getId();

			$now = DB::get()->prepare('SELECT NOW() AS now')->getFirstRow()->now;

			$query = DB::get()->prepare('INSERT INTO topic_replies (topic, text, posted, poster) VALUES(:topic, :text, :now, :poster)');
			$query->setValue(':topic', $topic);
			$query->setValue(':text', $text);
			$query->setValue(':now', $now);
			$query->setValue(':poster', $poster);
			$query->execute();

			return new ForumReply(DB::get()->getLastInsertID('topic_replies'), $topic, $text, $poster, $now, NULL);
		}

		/**
		 * Return all replies linked to a topic.
		 * @param int $topic
		 * @param int $offset
		 * @param int $limit
		 * @return ForumReply[]
		 */
		public static function getTopicReplies($topic, $offset, $limit)
		{
			$replies = Array();

			$query = DB::get()->prepare("SELECT ID, text, posted, edited, poster FROM topic_replies WHERE topic = :id LIMIT $offset, $limit");
			$query->setValue(':id', $topic);

			foreach ($query->getRows() as $reply)
				$replies[] = new ForumReply($reply->ID, $topic, $reply->text, $reply->poster, $reply->posted, $reply->edited);

			return $replies;
		}

		/**
		 * @var int
		 */
		private $id;

		/**
		 * @var int
		 */
		private $topic;

		/**
		 * @var string
		 */
		private $text;

		/**
		 * @var int
		 */
		private $poster;

		/**
		 * @var string
		 */
		private $posted;

		/**
		 * @var string|null
		 */
		private $edited;
	}
?>