<?php
	class Authenticator
	{
		public static function IsLoggedIn()
		{
			return (Session::Get('LoggedInUserID') !== null);
		}

		public static function AuthenticateUser($username, $password)
		{
			$query = DB::prepare('SELECT ID, password FROM users WHERE username = :user');
			$query->bindValue(':user', $username);
			$query->execute();

			if ($user = $query->fetchObject())
				if (crypt($password, $user->password) === $user->password)
					return $user->ID;

			return false;
		}

		public static function GetLoggedInUsername()
		{
			return Session::Get('LoggedInUsername');
		}

		public static function GetLoggedInUserID()
		{
			return Session::Get('LoggedInUserID');
		}

		public static function LoginUser($user_id)
		{
			$user_data = UserHandler::GetUserCacheData($user_id);
			Session::Set('LoggedInUserID', $user_id); // Set the session as logged in.
			Session::Set('LoggedInUsername', $user_data->username); // Cache the username.
		}

		public static function LogoutUser()
		{
			Session::Delete('LoggedInUserID'); // Burn the session key!
			Session::Delete('LoggedInUsername'); // Burn the session!!!11!
			Session::Delete('LoggedInUserFlags');
		}

		public static function LoginThrottle()
		{
			$last_attempt = Session::Get('LastFailedLogin'); // Get our last failure, if any.
			if ($last_attempt !== null)
			{
				if (time() - $last_attempt > LOGIN_THROTTLE_RESET)
					self::ResetLoginThrottle();
				else
					sleep(self::GetFailedLoginAttemptCount() * LOGIN_THROTTLE_SECONDS); // Sleep, little child.
			}
		}

		private static function ResetLoginThrottle()
		{
			Session::Delete('LastFailedLogin'); // Unset the last failed login.
			Session::Delete('FailedLoginAttempts'); // Unset the amount of fails we've had.
		}

		public static function GetFailedLoginAttemptCount()
		{
			$attempts = Session::Get('FailedLoginAttempts'); // Check if we have a counter.
			return ($attempts === null ? 0 : $attempts); // Return the counter or zero if we don't.
		}

		public static function AddFailedLoginAttempt()
		{
			$attempts = self::GetFailedLoginAttemptCount();
			if ($attempts < MAX_LOGIN_THROTTLE) // Are we below the limit?
				Session::Set('FailedLoginAttempts', $attempts + 1); // Add a failed login.

			Session::Set('LastFailedLogin', time()); // Set the last failed login to now.
		}

		public static function IsAdmin()
		{
			return AccountFlags::HasFlag(UserHandler::GetUserFlags(), AccountFlags::IsAdmin);
		}

		// TODO: Use this when someone tries to log-in.
		public static function IsBanned()
		{
			return AccountFlags::HasFlag(UserHandler::GetUserFlags(), AccountFlags::IsBanned);
		}
	}
?>