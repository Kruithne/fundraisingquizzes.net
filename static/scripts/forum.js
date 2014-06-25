$(function()
{
	var handler = {
		submitting: false,
		threadLimit: 30,
		load: function()
		{
			this.listing = $('#forum-listing');
			this.commentBox = $('.comment-box textarea');
			this.titleBox = $('.comment-box .title');
			this.postCount = typeof postCount == "undefined" ? 0 : postCount;

			this.pageCount = Math.ceil(this.postCount / this.threadLimit);

			var click = 'click';

			$(document)
				.on(click, '.topic', this.handleTopicClick)
				.on(click, '#comment-button', this.createTopic);

			PacketHandler.hook(Packet.GetForumTopics, packetContext(this, 'renderTopicList'));
			PacketHandler.hook(Packet.CreateTopic, packetContext(this, 'handleTopicCreation'));

			this.selectPage(1);
		},

		selectPage: function(page)
		{
			this.page = page;
			PacketHandler.send(Packet.GetForumTopics, {
				offset: (this.page - 1) * this.threadLimit
			});

			this.updatePageBars();
		},

		updatePageBars: function()
		{
			var bars = $('.page-bar');

			bars.find('a').addClass('disabled');

			if (this.page > 1)
				bars.find('.first, .previous').removeClass('disabled');

			if (this.page < this.pageCount)
				bars.find('.last, .next').removeClass('disabled');
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

					if (topic.unread)
						element.addClass('unread').css('background-image', 'url(http://static.fundraisingquizzes.net/images/bubble2_16.png)');

					$('<div class="author"/>').html(topic.creatorName).appendTo(element);
					$('<div class="posted time-period"/>').html(topic.posted).appendTo(element);
					$('<div class="reply-count"/>').html(topic.replyCount - 1).appendTo(element);
					$('<div class="view-count"/>').html(topic.views).appendTo(element);

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