$(function()
{
	var handler = {
		load: function()
		{
			this.listing = $('#forum-listing');

			$(document).on('click', '.topic', this.handleTopicClick);

			PacketHandler.hook(Packet.GetForumTopics, packetContext(this, 'renderTopicList'));
			PacketHandler.send(Packet.GetForumTopics);
		},

		renderTopicList: function(data)
		{
			this.listing.empty();
			if (data.topics != undefined)
			{
				for (var topic_index in data.topics)
				{
					var topic = data.topics[topic_index],
						element = $('<div class="module module-padded topic"/>').attr('id', topic.id),
						title = $('<div class="title"/>').html(topic.title).appendTo(element);

					if (topic.sticky)
						title.prepend('<b>[Sticky] </b>');

					$('<div class="author"/>').html(topic.creatorName).appendTo(element);
					$('<div class="posted time-period"/>').html(topic.posted).appendTo(element);

					element.formatPeriods().appendTo(this.listing);
				}
			}
		},

		handleTopicClick: function()
		{
			window.location.href = 'thread.php?id=' + $(this).attr('id');
		}
	};
	handler.load();
});