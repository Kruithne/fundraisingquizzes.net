<?php
	class RestrictedModule extends MemberModule
	{
		public function __construct()
		{
			if (Authenticator::IsAdmin())
				parent::__construct();
			else
				$this->Deny();
		}

		private function Deny()
		{
			$this->content = new Template('../templates/admin_only.php');
			$this->title = 'Access Denied';
		}
	}
?>