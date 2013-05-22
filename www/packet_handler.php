<?php
	require_once('../lib/bootstrap.php'); // Include framework
	require_once('../lib/packet_mapping_bootstrap.php'); // Include packet mapping bootstrap

	$packet = REST::Get('pid');
	if ($packet !== null)
	{
		$handler = ClassLoader::getPacketHandler($packet);
		if ($handler instanceof PacketHandler)
			echo $handler;
	}
?>