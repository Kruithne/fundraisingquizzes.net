<?php
	class BugsPage extends Module
	{
		public function Build()
		{
			$this->content = new Template('../templates/bugs.php');
			$this->title = 'Bugs';

			$this->content->bugs = BugHandler::getBugList();
		}
	}
?>