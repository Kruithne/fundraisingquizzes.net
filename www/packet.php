<?php
	require_once('../engine/bootstrap.php');
	require_once('../engine/packet_handling_bootstrap.php');

	$packet_id = intval(REST::Get('pid'));
	if ($packet_id > 0)
		echo PacketHandler::getListener($packet_id);
?>