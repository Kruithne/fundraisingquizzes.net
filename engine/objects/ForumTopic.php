<?php
	class ForumTopic implements JsonSerializable
	{
		const NONE = 0;

		public function __construct($id, $title, $creator, $posted, $sticky, $replyCount, $unread = 0)
		{
			$this->id = $id;
			$this->title = $title;
			$this->creator = $creator;
			$this->posted = $posted;
			$this->sticky = $sticky;
			$this->replyCount = $replyCount;
			$this->unread = $unread;
		}

		/**
		 * @return int
		 */
		public function getCreator()
		{
			return $this->creator;
		}

		/**
		 * @return string
		 */
		public function getCreatorName()
		{
			return UserHandler::getUser($this->getCreator())->getUsername();
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
		 * @return int
		 */
		public function getReplyCount()
		{
			return $this->replyCount;
		}

		/**
		 * @return int
		 */
		public function isUnread()
		{
			return $this->unread;
		}

		/**
		 * Mark this topic as read.
		 * @param null|int|User $user
		 */
		public function markAsRead($user = null)
		{
			if ($user === NULL)
				$user = Authenticator::getLoggedInUser()->getId();
			else if ($user instanceof User)
				$user = $user->getId();

			$this->unread = 0;
			$query = DB::get()->prepare('INSERT INTO unread (userID, topicID) VALUES(:user, :topic)');
			$query->setValue(':user', $user);
			$query->setValue(':topic', $this->getId());
			$query->execute();
		}

		/**
		 * Return all replies linked to this topic.
		 * @param int $offset
		 * @param int $limit
		 * @return ForumReply[]
		 */
		public function getReplies($offset = 0, $limit = 30)
		{
			return ForumReply::getTopicReplies($this->getId(), $offset, $limit);
		}

		/**
		 * This this topic and all linked replies.
		 */
		public function delete()
		{
			DB::get()->prepare('DELETE FROM topic_replies WHERE topic = :id')->setValue(':id', $this->getId())->execute();
			DB::get()->prepare('DELETE FROM topics WHERE ID = :id')->setValue(':id', $this->getId())->execute();
		}

		/**
		 * Create a new reply linked to this topic.
		 * @param string $text
		 * @param int|user $poster
		 * @return ForumReply
		 */
		public function addReply($text, $poster)
		{
			if ($poster instanceof User)
				$poster = $poster->getId();

			$this->setAsUnread();
			return ForumReply::create($this->getId(), $text, $poster);
		}

		/**
		 * Set this topic as unread for all forum members.
		 */
		public function setAsUnread()
		{
			DB::get()->prepare('DELETE FROM unread WHERE topicID = :id')->setValue(':id', $this->getId())->execute();
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
				'creatorName' => $this->getCreatorName(),
				'posted' => $this->getPosted(),
				'sticky' => (int) $this->isSticky(),
				'replyCount' => $this->getReplyCount(),
				'unread' => (int) $this->unread
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

			$query = DB::get()->prepare('SELECT title, creator, UNIX_TIMESTAMP(posted) AS posted, sticky, (SELECT COUNT(*) = 0 FROM unread WHERE topicID = t.ID AND userID = :user) AS unread, (SELECT COUNT(*) FROM topic_replies AS r WHERE r.topic = t.ID) AS replyCount FROM topics AS t WHERE t.ID = :id');
			$query->setValue(':id', $id);
			$query->setValue(':user', Authenticator::getLoggedInUser()->getId());
			$query->execute();

			$topic = $query->getFirstRow();
			return $topic !== NULL ? new ForumTopic($id, $topic->title, $topic->creator, $topic->posted, $topic->sticky, $topic->replyCount, $topic->unread) : ForumTopic::NONE;
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

			$query = DB::get()->prepare("SELECT ID, title, creator, UNIX_TIMESTAMP(posted) AS posted, sticky, (SELECT COUNT(*) = 0 FROM unread WHERE topicID = t.ID AND userID = :user) AS unread, (SELECT COUNT(*) FROM topic_replies AS r WHERE r.topic = t.ID) AS replyCount FROM topics AS t ORDER BY sticky DESC, posted DESC LIMIT $start, $limit");
			$query->setValue(':user', Authenticator::getLoggedInUser()->getId());

			foreach ($query->getRows() as $topic)
				$topics[] = new ForumTopic($topic->ID, $topic->title, $topic->creator, $topic->posted, $topic->sticky, $topic->replyCount, $topic->unread);

			return $topics;
		}

		/**
		 * Get the total amount of forum posts.
		 * @return int
		 */
		public static function getTotalCount()
		{
			return DB::get()->prepare('SELECT COUNT(*) AS amount FROM topics')->getFirstRow()->amount;
		}

		/**
		 * Create a new forum topic.
		 * @param string $title
		 * @param string $message
		 * @param int $poster
		 * @return ForumTopic|int
		 */
		public static function create($title, $message, $poster)
		{
			if ($poster instanceof User)
				$poster = $poster->getId();

			$query = DB::get()->prepare('INSERT INTO topics (title, creator, posted) VALUES(:title, :creator, NOW())');
			$query->setValue(':title', $title);
			$query->setValue(':creator', $poster);
			$query->execute();

			$topic = self::get(DB::get()->getLastInsertID('topics'));
			$topic->addReply($message, $poster);

			return $topic;
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

		/**
		 * @var int
		 */
		private $replyCount;

		/**
		 * @var int
		 */
		private $unread;
	}
?>