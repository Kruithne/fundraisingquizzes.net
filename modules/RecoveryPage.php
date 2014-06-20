<?php
	class RecoveryPage extends Module
	{
		public function __construct()
		{
			$template = new KW_Template('../templates/recovery.php');
			parent::__construct('Account Recovery', $template);
			$this->addStylesheet('recovery.css');
			$this->addScript('recovery.js');
		}
	}
?>