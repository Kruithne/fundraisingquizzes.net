<?php
	class LinksPage extends Module
	{
		public function __construct()
		{
			$template = new KW_Template('../templates/links.php');
			parent::__construct('Links', $template);
			$this->addStylesheet('links.css');
			$this->addScript('links.js');

			$template->links = SiteLink::getAll();
		}
	}
?>