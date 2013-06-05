<?php
	class BugHandler
	{
		public static function getBugList()
		{
			$query = DB::prepare('SELECT ID, title, submitted, status, submitter WHERE status = 0 ORDER BY submitted DESC');
			$query->execute();

			return DB::prepareObjects($query);
		}
	}
?>