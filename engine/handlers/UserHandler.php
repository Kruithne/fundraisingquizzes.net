<?php
	class UserHandler
	{
		/**
		 * Query basic data on a user.
		 * @param $user_id int ID of the to get.
		 * @return int|User
		 */
		public static function getUser($user_id)
		{
			if (array_key_exists($user_id, self::$cache))
				return self::$cache[$user_id];

			$current_user = Authenticator::getLoggedInUser();
			if ($current_user instanceof User && $user_id == $current_user->getId())
				return $current_user;

			$query = DB::get()->prepare('SELECT username, flags FROM users WHERE ID = :user');
			$query->setValue(':user', $user_id);

			$row = $query->getFirstRow();
			if ($row !== null)
			{
				$user = new User($user_id, $row->username, $row->flags);
				self::$cache[$user_id] = $user;
				return $user;
			}

			return User::NONE;
		}

		/**
		 * Creates a new user in the authentication system.
		 * @param $username string A username to identify the user.
		 * @param $password string Password used to authentication.
		 * @param $email string E-mail address for the account.
		 * @return int The ID of the user once created.
		 */
		public static function createUser($username, $password, $email)
		{
			DB::get()
				->prepare('INSERT INTO users (username, password, email, registered) VALUES(:username, :password, :email, NOW())')
				->setValue(':username', $username)->setValue(':password', crypt($password))->setValue(':email', $email)
				->execute();

			return DB::get()->getLastInsertID('users');
		}

		/**
		 * Check to see if a specified e-mail address is already registered.
		 * @param $email string E-mail address to check for.
		 * @return string|boolean Returns the username the account is linked to, or FALSE
		 */
		public static function emailRegistered($email)
		{
			$query = DB::get()->prepare('SELECT username FROM users WHERE email = :email');
			$query->setValue(':email', $email);

			$row = $query->getFirstRow();
			return $row == NULL ? FALSE : $row->username;
		}

		/**
		 * Check if a username is registered on the site.
		 * @param string $username Username to check for.
		 * @return boolean
		 */
		public static function usernameRegistered($username)
		{
			$query = DB::get()->prepare('SELECT ID FROM users WHERE username = :username');
			$query->setValue(':username', $username);

			return count($query->getRows()) > 0;
		}

		private static $cache = Array();
	}
?>