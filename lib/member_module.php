<?php
	class MemberModule extends Module
	{
		public function __construct()
		{
			if (Authenticator::IsLoggedIn())
				parent::__construct();
			else
				$this->Deny();
		}

		private function Deny()
		{
			$this->content = new Template('../templates/member_only.php');
			$this->title = 'Log-in Required';
		}
	}
?>