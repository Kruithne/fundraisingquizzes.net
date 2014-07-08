<?php
	class AddNewFact extends PacketListener
	{
		public function run()
		{
			$this->setReturn('success', false);
			if (!Authenticator::isLoggedInAsAdmin())
				return;

			$text = REST::Get('text');
			if ($text !== NULL)
			{
				$fact = RandomFact::create($text);

				$this->setReturn('factID', $fact->getId());
				$this->setReturn('success', true);
			}
		}
	}
?>