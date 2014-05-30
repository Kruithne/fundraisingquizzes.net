<?php
	class PrivatePage extends Module
	{
		public function __construct()
		{
			$template = new KW_Template('../templates/private.php');
			parent::__construct('Access Denied', $template);
		}
	}
?>