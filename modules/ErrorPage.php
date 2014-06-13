<?php
	class ErrorPage extends Module
	{
		public function __construct($error = null)
		{
			if ($error == null)
				$error = (int) REST::Get('e');

			$template = 'error_500.php';
			$title = 'Server Error';

			switch ($error)
			{
				case 404:
					$template = 'error_404.php';
					$title = 'Page Not Found';
				break;

				case 403:
					$template = 'error_403.php';
					$title = 'Access Denied';
				break;
			}

			parent::__construct($title, new KW_Template('../templates/' . $template));
			$this->addStylesheet('error.css');
		}
	}
?>