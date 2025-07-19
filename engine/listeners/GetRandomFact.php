<?php
	class GetRandomFact extends PacketListener
	{
		public function run()
		{
			$fact = RandomFact::getRandom();
			$this->setReturn('id', $fact->getId());
			$this->setReturn('text', $fact->getText());
		}
	}
?>