<?php
	class Authenticator
	{
		/**
		 * Return the currently logged in user.
		 * @return int|User Representation of the logged in user.
		 */
		public static function getLoggedInUser()
		{
			$user = Session::Get('LoggedInUser');
			return $user == null ? User::NONE : $user;
		}

		/**
		 * Check if a user is currently logged in for this session.
		 * @return bool
		 */
		public static function isLoggedIn()
		{
			return self::getLoggedInUser() instanceof User;
		}

		/**
		 * Check if the current user is an admin.
		 * @return bool
		 */
		public static function isLoggedInAsAdmin()
		{
			$user = self::getLoggedInUser();
			if ($user instanceof User)
				return $user->isAdmin();

			return false;
		}

		/**
		 * Attempts to authenticate a user.
		 * @param $username string Username to authenticate.
		 * @param $password string Password to authenticate with.
		 * @return int The user ID.
		 */
		public static function authenticateUser($username, $password)
		{
			$query = DB::get()->prepare('SELECT ID, password FROM users WHERE username = :user');
			$query->setValue(':user', $username);

			$user = $query->getFirstRow();
			if ($user != null)
				if (crypt($password, $user->password) === $user->password)
					return $user->ID;

			return User::NONE;
		}

		/**
		 * Set the currently logged in user.
		 * @param $user_id int ID of the user to log-in.
		 * @param $new bool If true, a new login key will be set.
		 */
		public static function loginUser($user_id, $new = false)
		{
			$user = UserHandler::getUser($user_id);
			Session::Set('LoggedInUser', $user);

			$loginKey = $user->getLoginKey();

			if ($new)
			{
				$loginKey = hash('md5', $user->getUsername() . time());
				$user->setLoginKey($loginKey);
			}

			$date = new DateTime();
			$date->add(new DateInterval('P1Y'));

			Cookie::Set('LoginKey', $loginKey, $date);
			Cookie::Set('LoginUser', $user->getId(), $date);
		}

		/**
		 * Discard the currently logged in user.
		 */
		public static function logoutUser()
		{
			Session::Delete('LoggedInUser');
			Cookie::Delete('LoginKey');
			Cookie::Delete('LoginUser');
		}

		public static function checkLoginKey()
		{
			if (self::isLoggedIn())
				return;

			$loginUser = Cookie::Get('LoginUser');
			$loginKey = Cookie::Get('LoginKey');

			if ($loginUser !== null && $loginKey !== null)
			{
				$user = UserHandler::getUser($loginUser);
				if ($user instanceof User && $user->getLoginKey() === $loginKey)
					Authenticator::loginUser($user->getId(), false);
			}
		}
	}
?>