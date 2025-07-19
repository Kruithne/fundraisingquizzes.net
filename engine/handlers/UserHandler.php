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
			if ($user_id == User::NONE)
				return User::NONE;

			if (array_key_exists($user_id, self::$cache))
				return self::$cache[$user_id];

			$current_user = Authenticator::getLoggedInUser();
			if ($current_user instanceof User && $user_id == $current_user->getId())
				return $current_user;

			$query = DB::get()->prepare('SELECT username, flags, avatar, forum_sig FROM users WHERE ID = :user');
			$query->setValue(':user', $user_id);

			$row = $query->getFirstRow();
			if ($row !== null)
			{
				$user = new User($user_id, $row->username, $row->flags, $row->avatar, $row->forum_sig);
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
			$query = DB::get()->prepare('SELECT ID FROM users WHERE LOWER(username) = :username');
			$query->setValue(':username', strtolower($username));

			$user = $query->getFirstRow();
			return $user == NULL ? FALSE : $user->ID;
		}

		/**
		 * Retrieve a password reset key for the user.
		 * @param int $user_id The ID of the user.
		 * @param bool $create Should a key be created if none exists?
		 * @return string|null
		 */
		public static function getPasswordResetKey($user_id, $create = true)
		{
			$query = DB::get()->prepare('SELECT resetKey FROM password_resets WHERE userID = :user');
			$query->setValue(':user', $user_id);
			$result = $query->getFirstRow();

			if ($result !== NULL)
				return $result->resetKey;

			if (!$create)
				return NULL;

			$new_key = md5($user_id + time());
			$query = DB::get()->prepare('INSERT INTO password_resets (userID, resetKey, created) VALUES(:user, :key, NOW())');
			$query->setValue(':user', $user_id);
			$query->setValue(':key', $new_key);
			$query->execute();

			return $new_key;
		}

		/**
		 * Retrieve the user_id linked to a password reset key.
		 * @param string $key
		 * @return int|null
		 */
		public static function getPasswordResetKeyUser($key)
		{
			$query = DB::get()->prepare('SELECT userID FROM password_resets WHERE resetKey = :key');
			$query->setValue(':key', $key);

			$result = $query->getFirstRow();
			return $result === NULL ? NULL : $result->userID;
		}

		/**
		 * Delete a password reset key.
		 * @param string $key
		 */
		public static function deleteResetKey($key)
		{
			DB::get()->prepare('DELETE FROM password_resets WHERE resetKey = :key')->setValue(':key', $key)->execute();
		}

		/**
		 * Change the password of a user account.
		 * @param int|null $user_id ID of the user, NULL defaults to logged in user.
		 * @param string $password New password.
		 * @return bool
		 */
		public static function changeUserPassword($user_id, $password)
		{
			if ($user_id === NULL)
			{
				$user = Authenticator::getLoggedInUser();
				if (!($user instanceof User))
					return false;

				$user_id = $user->getId();
			}

			$query = DB::get()->prepare('UPDATE users SET password = :pass WHERE ID = :id');
			$query->setValue(':pass', crypt($password));
			$query->setValue(':id', $user_id);
			$query->execute();

			return true;
		}

		/**
		 * Check if the user is eligible to be flagged as a contributor and flag them if so.
		 * @param User $user
		 */
		public static function checkContributorStatus($user)
		{
			$query = DB::get()->prepare('SELECT postCount FROM post_counts WHERE userID = :user');
			$query->setValue(':user', $user->getId());

			if ($query->getFirstRow()->postCount >= 100)
			{
				$user->addFlag(User::FLAG_CONTRIBUTOR);
				$user->persist();
			}
			else if ($user->hasFlag(User::FLAG_CONTRIBUTOR))
			{
				$user->removeFlag(User::FLAG_CONTRIBUTOR);
				$user->persist();
			}
		}

		/**
		 * Get the amount of users registered on the site.
		 * @return int
		 */
		public static function getUserCount()
		{
			$query = DB::get()->prepare('SELECT COUNT(*) AS amount FROM users');
			$row = $query->getFirstRow();

			return $row == null ? 0 : $row->amount;
		}

		public static function getUserList()
		{
			$users = Array();
			foreach (DB::get()->prepare('SELECT ID, username FROM users ORDER BY username ASC')->getRows() as $user)
				$users[$user->ID] = $user->username;

			return $users;
		}

		private static $cache = Array();
	}
?>