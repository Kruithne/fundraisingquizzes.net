<?php
	class ThreadPage extends Module
	{
		public function __construct()
		{
			$thread = ForumTopic::get((int) REST::Get('id'));

			if ($thread instanceof ForumTopic)
			{
				$template = new KW_Template('../templates/thread.php');
				parent::__construct($thread->getTitle(), $template);
				$this->addStylesheet('forum.css');
				$this->addScript('time.js');
				$this->addScript('formatting.js');
				$this->addScript('thread.js');

				$template->thread = $thread;
			}
			else
			{
				$template = new KW_Template('../templates/thread_404.php');
				parent::__construct('Topic Not Found', $template);
				$this->addStylesheet('error.css');
			}
		}
	}
?>