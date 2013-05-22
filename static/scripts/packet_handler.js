var Packet = {
	Login: 1,
	Register: 2,
	QuizList: 3,
	Bookmarks: 4,
	BookmarkQuiz: 5,
	Votes: 6,
	VoteQuiz: 7,
	QuizData: 8,
	EditQuiz: 9,
	DeleteQuiz: 10
};

var PacketHandler = {
	events: {}
};

PacketHandler.hook = function(packet_id, event)
{
	if (PacketHandler.events.packet_id === undefined)
		PacketHandler.events[packet_id] = [];

	PacketHandler.events[packet_id].push(event);
};

PacketHandler.run = function(packet_id, data)
{
	if (packet_id in PacketHandler.events)
	{
		var events = PacketHandler.events[packet_id];
		for (var event_pointer in events)
			events[event_pointer](data);
	}
};

PacketHandler.send = function(packet_id, parameters)
{
	var params = parameters||{};
	params.pid = packet_id;

	$.getJSON('packet_handler.php', params, function(data)
	{
		PacketHandler.run(packet_id, data);
	});
};