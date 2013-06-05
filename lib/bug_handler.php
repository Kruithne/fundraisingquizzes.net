<?php
	class BugHandler
	{
		public static function getOpenBugs()
		{
			return self::getBugs(0);
		}

		public static function getClosedBugs()
		{
			return self::getBugs(1);
		}

		private static function getBugs($status)
		{
			$query = DB::prepare('SELECT ID, title, submitted, status, submitter FROM bugs WHERE status = :status ORDER BY submitted DESC');
			$query->bindValue(':status', $status);
			$query->execute();

			return DB::prepareObjects($query);
		}
	}
?>