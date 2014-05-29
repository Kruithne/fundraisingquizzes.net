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
		 */
		public static function loginUser($user_id)
		{
			Session::Set('LoggedInUser', UserHandler::getUser($user_id));
		}

		/**
		 * Discard the currently logged in user.
		 */
		public static function logoutUser()
		{
			Session::Delete('LoggedInUser');
		}
	}
?>