<?php
	class ForumPage extends Module
	{
		public function __construct()
		{
			$template = new KW_Template('../templates/forum.php');
			parent::__construct('Forum', $template);
			$this->addStylesheet('forum.css');
			$this->addScript('time.js');
			$this->addScript('forum.js');

			$template->post_count = ForumTopic::getTotalCount();
		}
	}
?>