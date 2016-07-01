<?php
	require_once('../engine/bootstrap.php');
	require_once('../engine/packet_handling_bootstrap.php');

	$packet_id = (int) REST::Get('pid');
	$packet_uid = (int) REST::Get('uid');

	if ($packet_id == 0)
	{
		$packet_id = (int) REST::Post('pid');
		$packet_uid = (int) REST::Post('uid');
	}

	if ($packet_id > 0)
	{
		$handler = PacketHandler::getListener($packet_id);
		if ($handler instanceof IPacketListener)
		{
			if ($packet_uid > 0)
				$handler->setReturn('uid', $packet_uid);

			echo $handler;
		}
	}
?>