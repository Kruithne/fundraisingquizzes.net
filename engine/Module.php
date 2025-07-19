<?php
	class Module extends KW_Module
	{
		public function __construct($title, $content)
		{
			$this->styles = Array();
			$this->scripts = Array();

			// Base site template
			$this->template = new KW_Template('../templates/site_template.php');
			$this->template->title = $title;
			$this->template->content = $content;
		}

		/**
		 * Called after the module is built.
		 *
		 * @return string The output of the module.
		 */
		public function renderModule()
		{
			$this->template->styles = $this->styles;
			$this->template->scripts = $this->scripts;
			return $this->template;
		}

		/**
		 * Add a stylesheet location to be injected into the template.
		 * @param $file string Location of the stylesheet file.
		 */
		protected function addStylesheet($file)
		{
			$this->styles[] = $file;
		}

		/**
		 * Add a script location to be injected into the template.
		 * @param $file string Location of the script file.
		 */
		protected function addScript($file)
		{
			$this->scripts[] = $file;
		}

		/**
		 * @var KW_Template Internal template object for this module.
		 */
		protected $template;

		/**
		 * @var array Stylesheets that will be injected into the template.
		 */
		private $styles;

		/**
		 * @var array Scripts that will be injected into the template.
		 */
		private $scripts;
	}
?>