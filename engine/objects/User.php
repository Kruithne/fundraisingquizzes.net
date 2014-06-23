<?php
	class User
	{
		const NONE = 0;

		const FLAG_ADMIN = 0x1;
		const FLAG_BANNED = 0x2;

		public function __construct($id, $username, $flags)
		{
			$this->id = $id;
			$this->username = $username;
			$this->flags = $flags;
		}

		/**
		 * Check if the user is an admin on the site.
		 * @return bool True if the user is an admin, else false.
		 */
		public function isAdmin()
		{
			return $this->hasFlag(User::FLAG_ADMIN);
		}

		/**
		 * Check if the user is banned from the site.
		 * @return bool True if the user is banned, else false.
		 */
		public function isBanned()
		{
			return $this->hasFlag(User::FLAG_BANNED);
		}

		/**
		 * Returns the flags for this user.
		 * @return int
		 */
		public function getFlags()
		{
			return $this->flags;
		}

		/**
		 * Add a flag to this user.
		 * @param $flag int
		 */
		public function addFlag($flag)
		{
			$this->flags = $this->flags | $flag;
		}

		/**
		 * Remove a flag from this user.
		 * @param $flag int
		 */
		public function removeFlag($flag)
		{
			$this->flags &= ~$flag;
		}

		/**
		 * Check if this user has a certain flag.
		 * @param $flag int
		 * @return bool True if the user does, else false.
		 */
		public function hasFlag($flag)
		{
			return (bool) ($this->flags & $flag);
		}

		/**
		 * Returns the ID of this user.
		 * @return int
		 */
		public function getId()
		{
			return $this->id;
		}

		/**
		 * Returns the username of this user.
		 * @return string
		 */
		public function getUsername()
		{
			return $this->username;
		}

		/**
		 * Returns the e-mail address of this user.
		 * @return null|string
		 */
		public function getEmailAddress()
		{
			if ($this->email !== NULL)
				return $this->email;

			$query = DB::get()->prepare('SELECT email FROM users WHERE ID = :user');
			$query->setValue(':user', $this->getId());

			$result = $query->getFirstRow();
			$this->email = $result === NULL ? NULL : $result->email;
			return $this->email;
		}

		/**
		 * Return the join date for this user.
		 * @return string|null
		 */
		public function getJoined()
		{
			if ($this->joined !== NULL)
				return $this->joined;

			$query = DB::get()->prepare('SELECT registered FROM users WHERE ID = :user');
			$query->setValue(':user', $this->getId());

			$result = $query->getFirstRow();
			$this->joined = $result === NULL ? NULL : $result->registered;
			return $this->joined;
		}

		/**
		 * Returns the login key for this user.
		 * @return string
		 */
		public function getLoginKey()
		{
			if ($this->loginKey == null)
			{
				$query = DB::get()->prepare('SELECT loginKey FROM users WHERE ID = :id');
				$query->setValue(':id', $this->id);

				$result = $query->getFirstRow();
				if ($result != null)
					$this->loginKey = $result->loginKey;
			}
			return $this->loginKey;
		}

		/**
		 * Set the login key for this user.
		 * @param $key string
		 */
		public function setLoginKey($key)
		{
			$this->loginKey = $key;
			DB::get()->prepare('UPDATE users SET loginKey = :key WHERE ID = :id')->setValue(':key', $key)->setValue(':id', $this->id)->execute();
		}

		/**
		 * Persist any modifications to this users flags in the database.
		 * Login keys are not persisted using this function to reduce common overhead.
		 */
		public function persist()
		{
			$query = DB::get()->prepare('UPDATE users SET flags = :flags WHERE ID = :id');
			$query->setValue(':flags', $this->flags);
			$query->setValue(':id', $this->id);
			$query->execute();
		}

		/**
		 * @var int ID of the user this object represents.
		 */
		private $id;

		/**
		 * @var string The username to represent this user.
		 */
		private $username;

		/**
		 * @var int Flags relating to this user.
		 */
		private $flags;

		/**
		 * @var string Login key for this user, normally NULL until requested.
		 */
		private $loginKey;

		/**
		 * @var string E-mail address for this user, normally NULL until requested.
		 */
		private $email;

		/**
		 * @var string Date string for when the user joined the site.
		 */
		private $joined;
	}
?>