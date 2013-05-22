<?php
	class UserHandler
	{
		public static function CreateUser($username, $password, $email)
		{
			$query = DB::prepare('INSERT INTO users (username, password, email, registered) VALUES (
				:username, :password, :email, NOW())');
			$query->bindValue(':username', $username);
			$query->bindValue(':password', crypt($password));
			$query->bindValue(':email', $email);
			$query->execute();

			$query = DB::prepare('SELECT LAST_INSERT_ID() AS ID FROM users');
			$query->execute();

			if ($result = $query->fetchObject())
				return $result->ID;

			return null;
		}

		public static function UserExists($username)
		{
			$query = DB::prepare('SELECT COUNT(ID) as user_count FROM users WHERE username = :user');
			$query->bindValue(':user', $username);
			$query->execute();

			if ($result = $query->fetchObject())
				if ($result->user_count > 0)
					return true;

			return false;
		}

		public static function EmailAddressInUse($email)
		{
			$query = DB::prepare('SELECT COUNT(ID) AS user_count FROM users WHERE email = :email');
			$query->bindValue(':email', $email);
			$query->execute();

			if ($result = $query->fetchObject())
				if ($result->user_count > 0)
					return true;

			return false;
		}

		public static function GetUsername($user_id)
		{
			$query = DB::prepare('SELECT username FROM users WHERE ID = :user');
			$query->bindValue(':user', $user_id);
			$query->execute();

			if ($user = $query->fetchObject())
				return $user->username;

			return null;
		}

		public static function GetUserCacheData($user_id)
		{
			$query = DB::prepare('SELECT username, flags FROM users WHERE ID = :user');
			$query->bindValue(':user', $user_id);
			$query->execute();

			if ($user = $query->fetchObject())
				return $user;

			return null;
		}

		public static function GetUserFlags($user_id = null)
		{
			if ($user_id === null)
				$user_id = Authenticator::GetLoggedInUserID();

			$query = DB::prepare('SELECT flags FROM users WHERE ID = :user');
			$query->bindValue(':user', $user_id);
			$query->execute();

			if ($user = $query->fetchObject())
				return $user->flags;

			return 0;
		}

		public static function SetUserFlags($user_id = null, $flags)
		{
			if ($user_id === null)
				$user_id = Authenticator::GetLoggedInUserID();

			$query = DB::prepare('UPDATE users SET flags = :flags WHERE ID = :user');
			$query->bindValue(':flags', $flags);
			$query->bindValue(':user', $user_id);
			$query->execute();
		}
	}
?>