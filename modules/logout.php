<?php
	class LogoutPage extends Module
	{
		public function Build()
		{
			Authenticator::LogoutUser();

			$this->content = new Template('../templates/logout.php');
			$this->title = 'Logging out';
		}
	}
?>