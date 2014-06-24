$(function()
{
	var handler = {
		submitting: false,
		load: function()
		{
			this.listing = $('#forum-listing');
			this.commentBox = $('.comment-box textarea');
			this.titleBox = $('.comment-box .title');

			var click = 'click';

			$(document)
				.on(click, '.topic', this.handleTopicClick)
				.on(click, '#comment-button', this.createTopic);

			PacketHandler.hook(Packet.GetForumTopics, packetContext(this, 'renderTopicList'));
			PacketHandler.send(Packet.GetForumTopics);

			PacketHandler.hook(Packet.CreateTopic, packetContext(this, 'handleTopicCreation'));
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
		},

		createTopic: function()
		{
			if (!handler.submitting)
			{
				var message = handler.commentBox.val().trim(),
					title = handler.titleBox.val().trim();

				if (message.length > 0 && title.length > 0)
				{
					$(this).val('Posting...');
					handler.submitting = true;

					PacketHandler.send(Packet.CreateTopic, {
						message: message,
						title: title
					});
				}
			}
		},

		handleTopicCreation: function(data, callback)
		{
			if (data.success != undefined && data.success == true)
			{
				window.location.href = 'thread.php?id=' + data.id;
			}
			else
			{
				callback.button.val('Error!');
			}
		}
	};
	handler.load();
});