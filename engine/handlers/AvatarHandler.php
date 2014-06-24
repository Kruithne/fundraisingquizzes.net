<?php
	class AvatarHandler
	{
		/**
		 * Return available avatars for a user.
		 * @param null|User|int $user Defaults to the logged in user.
		 * @return array
		 */
		public static function getAvailableAvatars($user = null)
		{
			$avatars = Array();
			if ($user === NULL)
				$user = Authenticator::getLoggedInUser();

			if ($user instanceof User)
				$user = $user->getId();

			$query = DB::get()->prepare('SELECT ID, image FROM avatars WHERE ((avail_start >= CURDATE() OR avail_start IS NULL) AND (avail_end <= CURDATE() OR avail_end IS NULL)) OR (SELECT COUNT(*) FROM avatar_override WHERE avatar = ID AND user = :user) > 0');
			$query->setValue(':user', $user);

			foreach ($query->getRows() as $row)
				$avatars[$row->ID] = $row->image;

			return $avatars;
		}

		/**
		 * Check if a user can use a specific avatar.
		 * @param int $avatar
		 * @param null|int|User $user
		 * @return bool
		 */
		public static function canUseAvatar($avatar, $user = null)
		{
			if ($user === NULL)
				$user = Authenticator::getLoggedInUser();

			if ($user instanceof User)
				$user = $user->getId();

			$query = DB::get()->prepare('SELECT COUNT(*) AS amount FROM avatars WHERE ID = :id AND ((avail_start >= CURDATE() OR avail_start IS NULL) AND (avail_end <= CURDATE() OR avail_end IS NULL)) OR (SELECT COUNT(*) FROM avatar_override WHERE avatar = ID AND user = :user) > 0');
			$query->setValue(':id', $avatar);
			$query->setValue(':user', $user);

			return $query->getFirstRow()->amount > 0;
		}

		/**
		 * Grab the image for an avatar.
		 * @param int $avatar_id
		 * @return mixed|null
		 */
		public static function getAvatarImage($avatar_id)
		{
			if (array_key_exists($avatar_id, self::$avatar_cache))
				return self::$avatar_cache[$avatar_id];

			$query = DB::get()->prepare('SELECT image FROM avatars WHERE ID = :id');
			$query->setValue(':id', $avatar_id);

			return $query->getFirstRow()->image;
		}

		private static $avatar_cache = [];
	}
?>