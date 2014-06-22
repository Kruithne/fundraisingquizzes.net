<?php
	class EditSiteLink extends PacketListener
	{
		public function run()
		{
			$this->setReturn('success', false);

			if (!Authenticator::isLoggedInAsAdmin())
				return;

			$id = (int) REST::Get('id');
			$title = REST::Get('title');
			$url = REST::Get('url');
			$description = REST::Get('desc');

			if ($title !== NULL && $url !== NULL && $description !== NULL)
			{
				if ($id > 0)
				{
					$link = SiteLink::get($id);
					if ($link instanceof SiteLink)
					{
						$link->setTitle($title);
						$link->setUrl($url);
						$link->setDescription($description);
						$link->persist();
						$this->setReturn('success', true);
					}
				}
				else
				{
					$link = SiteLink::create($url, $title, $description);
					$this->setReturn('id', $link->getId());
					$this->setReturn('success', true);
				}
			}
		}
	}
?>