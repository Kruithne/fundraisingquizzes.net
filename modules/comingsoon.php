<?php
	class ComingSoonPage extends Module implements IModule
	{
		public function Build()
		{
			$this->content = new Template('../templates/comingsoon.php');
			$this->title = 'Coming Soon';
		}
	}
?>