<?php
	class AdminPage extends RestrictedModule implements IModule
	{
		public function Build()
		{
			$this->content = new Template('../templates/admin.php');
			$this->title = 'Admin Section';
		}
	}
?>