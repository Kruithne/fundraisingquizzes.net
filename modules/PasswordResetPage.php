<?php
	class PasswordResetPage extends Module
	{
		public function __construct()
		{
			$this->reset_template = new KW_Template('../templates/password_reset.php');
			parent::__construct('Password Reset', $this->reset_template);
			$this->addStylesheet('password_reset.css');
			$this->addScript('password_reset.js');
		}

		/**
		 * Check if the module has a valid reset key.
		 * @return bool
		 */
		public function hasValidKey()
		{
			$key = REST::Get('key');
			if ($key !== NULL)
			{
				if (UserHandler::getPasswordResetKeyUser($key) !== NULL)
				{
					$this->reset_template->key = $key;
					return true;
				}
			}
			return false;
		}

		private $reset_template;
	}
?>