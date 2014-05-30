<?php
	class AdminPage extends Module
	{
		public function __construct()
		{
			$template = new KW_Template('../templates/admin.php');
			parent::__construct('Admin', $template);
		}
	}
?>