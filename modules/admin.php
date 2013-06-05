<?php
	class AdminPage extends RestrictedModule
	{
		public function Build()
		{
			$this->content = new Template('../templates/admin.php');
			$this->title = 'Admin Section';
		}
	}
?>