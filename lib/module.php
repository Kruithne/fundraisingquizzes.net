<?php
	abstract class Module implements IModule
	{
		public function __construct()
		{
			$this->Build();
		}

		public function __toString()
		{
			$site = new Template('../templates/site_structure.php');

			if ($this->title !== null)
				$site->title = $this->title;

			$site->content = $this->content;

			if ($_SERVER['REQUEST_METHOD'] == 'POST')
				$this->HandlePost();

			return $site->__toString();
		}

		public function HandlePost() {}

		protected $title;
		protected $content;
	}
?>