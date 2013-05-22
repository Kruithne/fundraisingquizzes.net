<?php
	class ErrorPage extends Module
	{
		public function Build()
		{
			$this->title = 'Error';
			$this->selectErrorPage();
		}

		private function selectErrorPage()
		{
			$template = 'error_unknown.php';
			$error = REST::Get('error');

			if ($error !== null)
			{
				switch ($error)
				{
					case '404': $template = 'error_404.php'; break;
					case '500': $template = 'error_500.php'; break;
				}
			}

			$this->content = new Template('../templates/' . $template);
		}
	}
?>