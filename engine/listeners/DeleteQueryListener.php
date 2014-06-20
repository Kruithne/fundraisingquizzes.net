<?php
	class DeleteQueryListener extends PacketListener
	{
		public function run()
		{
			$this->setReturn('success', false);
			if (!Authenticator::isLoggedInAsAdmin())
				return;

			$query = (int) REST::Get('id');
			if ($query > 0)
			{
				DB::get()->prepare('DELETE FROM quiz_queries WHERE queryID = :id')->setValue(':id', $query)->execute();
				$this->setReturn('success', true);
			}
		}
	}
?>