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
	}
?>