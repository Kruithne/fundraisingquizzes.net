<?php
	class DeleteSiteLink extends PacketListener
	{
		public function run()
		{
			$this->setReturn('success', false);
			if (!Authenticator::isLoggedInAsAdmin())
				return;

			$id = REST::Get('id');
			if ($id !== NULL)
			{
				$site_link = SiteLink::get($id);
				if ($site_link instanceof SiteLink)
				{
					$site_link->delete();
					$this->setReturn('success', true);
				}
			}
		}
	}
?>