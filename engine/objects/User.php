<?php
	class User
	{
		const NONE = 0;

		const FLAG_ADMIN = 0x1; // 2 ^ 0
		const FLAG_BANNED = 0x2; // 2 ^ 1
		const FLAG_CONTRIBUTOR = 0x4; // 2 ^ 2
		const FLAG_BIRTHDAY_PROMPT = 0x8; // 2 ^ 3

		public function __construct($id, $username, $flags, $avatar, $signature)
		{
			$this->id = $id;
			$this->username = $username;
			$this->flags = $flags;
			$this->avatar = $avatar;
			$this->signature = $signature;
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

		public function isContributor()
		{
			return $this->hasFlag(User::FLAG_CONTRIBUTOR);
		}

		public function hasSeenBirthdayPrompt()
		{
			return $this->hasFlag(User::FLAG_BIRTHDAY_PROMPT);
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
		 * @param int $avatar
		 */
		public function setAvatar($avatar)
		{
			$this->avatar = $avatar;
		}

		/**
		 * @return int
		 */
		public function getAvatar()
		{
			return $this->avatar;
		}

		/**
		 * @param null|string $signature
		 */
		public function setSignature($signature)
		{
			$this->signature = $signature;
		}

		/**
		 * @return null|string
		 */
		public function getSignature()
		{
			return $this->signature;
		}

		/**
		 * @param string $password Set the users password.
		 */
		public function setPassword($password)
		{
			$query = DB::get()->prepare('UPDATE users SET password = :pass WHERE ID = :user');
			$query->setValue(':pass', crypt($password));
			$query->setValue(':user', $this->getId());
			$query->execute();
		}

		/**
		 * Set the users e-mail address.
		 * @param string $email
		 */
		public function setEmailAddress($email)
		{
			$this->email = $email;

			$query = DB::get()->prepare('UPDATE users SET email = :email WHERE ID = :user');
			$query->setValue(':email', $email);
			$query->setValue(':user', $this->getId());
			$query->execute();
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
		 * @return int|null
		 */
		public function getJoined()
		{
			if ($this->joined !== NULL)
				return $this->joined;

			$query = DB::get()->prepare('SELECT UNIX_TIMESTAMP(registered) AS registered FROM users WHERE ID = :user');
			$query->setValue(':user', $this->getId());

			$result = $query->getFirstRow();
			$this->joined = $result === NULL ? NULL : $result->registered;
			return $this->joined;
		}

		/**
		 * Return the birthday for this user, NULL if not set.
		 * @return UserBirthday|null
		 */
		public function getBirthday()
		{
			if ($this->birthday !== NULL)
				return $this->birthday;

			$query = DB::get()->prepare('SELECT DAY(birthday) AS b_day, MONTH(birthday) AS b_month FROM users WHERE ID = :user');
			$query->setValue(':user', $this->getId());

			$result = $query->getFirstRow();
			$this->birthday = $result->b_day === NULL ? NULL : new UserBirthday($result->b_day, $result->b_month);
			return $this->birthday;
		}

		/**
		 * @param UserBirthday $birthday
		 */
		public function setBirthday($birthday)
		{
			$this->birthday = $birthday;
			$query = DB::get()->prepare('UPDATE users SET birthday = :birthday WHERE ID = :user');
			$query->setValue(':birthday', $birthday->getSQL());
			$query->setValue(':user', $this->getId());
			$query->execute();
		}

		/**
		 * Returns the login key for this user.
		 * @return string[]
		 */
		public function getLoginKeys()
		{
			if ($this->loginKeys == null)
			{
				$this->loginKeys = Array();
				$query = DB::get()->prepare('SELECT loginKey FROM login_keys WHERE userID = :id');
				$query->setValue(':id', $this->id);

				foreach ($query->getRows() as $result)
					$this->loginKeys[] = $result->loginKey;
			}
			return $this->loginKeys;
		}

		/**
		 * Add a log-in key for this user.
		 * @param $key string
		 */
		public function addLoginKey($key)
		{
			$this->loginKeys[] = $key;
			DB::get()->prepare('INSERT IGNORE INTO login_keys (userID, loginKey) VALUES(:id, :key)')->setValue(':key', $key)->setValue(':id', $this->id)->execute();
		}

		/**
		 * Delete an existing login key for the user.
		 * @param $key
		 */
		public function deleteLoginKey($key)
		{
			DB::get()->prepare('DELETE FROM login_keys WHERE userID = :id AND loginKey = :key')->setValue(':key', $key)->setValue(':id', $this->id)->execute();
			if (($index = array_search($key, $this->loginKeys)) !== false)
				unset($this->loginkeys[$index]);
		}

		/**
		 * Check if the given login key is valid for this user.
		 * @param string $key
		 * @return bool
		 */
		public function isValidLoginKey($key)
		{
			return in_array($key, $this->getLoginKeys());
		}

		/**
		 * Persist any modifications to this users flags in the database.
		 * Login keys are not persisted using this function to reduce common overhead.
		 */
		public function persist()
		{
			$query = DB::get()->prepare('UPDATE users SET flags = :flags, avatar = :avatar, forum_sig = :signature WHERE ID = :id');
			$query->setValue(':flags', $this->flags);
			$query->setValue(':avatar', $this->avatar);
			$query->setValue(':signature', $this->signature);
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
		 * @var string[] Login key for this user, normally NULL until requested.
		 */
		private $loginKeys;

		/**
		 * @var string E-mail address for this user, normally NULL until requested.
		 */
		private $email;

		/**
		 * @var int Timestamp for when the user joined the site.
		 */
		private $joined;

		/**
		 * @var int
		 */
		private $avatar;

		/**
		 * @var string|null
		 */
		private $signature;

		/**
		 * @var UserBirthday|null Timestamp for the users birthday.
		 */
		private $birthday;
	}
?>