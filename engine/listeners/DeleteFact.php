<?php
	class DeleteFact extends PacketListener
	{
		public function run()
		{
			$this->setReturn('success', false);
			if (!Authenticator::isLoggedInAsAdmin())
				return;

			$fact = RandomFact::get((int) REST::Get('id'));
			if ($fact !== NULL)
			{
				$fact->delete();
				$this->setReturn('success', true);
			}
		}
	}
?>