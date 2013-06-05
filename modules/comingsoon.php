<?php
	class ComingSoonPage extends Module
	{
		public function Build()
		{
			$this->content = new Template('../templates/comingsoon.php');
			$this->title = 'Coming Soon';
		}
	}
?>