<?php
	class User
	{
		const NONE = 0;

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