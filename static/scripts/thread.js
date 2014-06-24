$(function()
{
	var handler = {
		threadLimit: 30,
		submitting: false,
		load: function()
		{
			this.listing = $('#thread-listing');
			this.commentBox = $('.comment-box');
			this.thread = thread;

			PacketHandler.hook(Packet.TopicComment, packetContext(this, 'handleCommentSubmit'));
			PacketHandler.hook(Packet.GetForumReplies, packetContext(this, 'renderThread'));
			this.pageCount = Math.ceil(this.thread.replyCount / this.threadLimit);

			this.selectPage(1, false);

			var click = 'click';

			$(document)
				.on(click, '.page-bar a', this.handlePageBarClick)
				.on(click, '#comment-button', this.handleCommentButtonClick);
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

		handlePageBarClick: function()
		{
			var link = $(this);

			if (link.hasClass('first'))
			{
				handler.selectPage(1, false);
			}
			else if (link.hasClass('next'))
			{
				handler.selectPage(handler.page + 1, false);
			}
			else if (link.hasClass('previous'))
			{
				handler.selectPage(handler.page - 1, false)
			}
			else if (link.hasClass('last'))
			{
				handler.selectPage(handler.pageCount, false);
			}
		},

		selectPage: function(page, bottom)
		{
			this.page = page;
			$('#thread-header .right').text('Page ' + this.page + ' / ' + this.pageCount);

			PacketHandler.send(Packet.GetForumReplies, {
				id: this.thread.id,
				offset: (this.page - 1) * this.threadLimit
			});

			this.updatePageBars();

			if (bottom)
				window.location.hash = 'comment';
		},

		renderThread: function(data)
		{
			this.listing.empty();
			if (data.replies != undefined)
			{
				for (var replyIndex in data.replies)
				{
					var reply = data.replies[replyIndex],
						element = $('<div class="module module-padded reply"/>').attr('id', reply.id),
						user = $('<div class="user-frame"/>'),
						msg = $('<div class="message-frame"/>').html(reply.text).formatText();

					$('<div class="footer"/>').html('Posted <span class="time-period">' + reply.posted + '</span>').formatPeriods().appendTo(msg);
					$('<div class="username"/>').html(reply.posterName).appendTo(user);

					user.css('background-image', 'url(http://static.fundraisingquizzes.net/images/avatars/' + reply.posterAvatar + ')')

					element.append(user, msg);

					this.listing.append(element);
				}
			}
		},

		handleCommentButtonClick: function()
		{
			if (handler.submitting)
				return;

			var message = handler.commentBox.val().trim(),
				button = $(this);

			if (message.length > 0)
			{
				handler.submitting = true;
				button.val('Posting...');

				PacketHandler.send(Packet.TopicComment, {
					id: handler.thread.id,
					message: message
				},
				{
					button: button
				});
			}
		},

		handleCommentSubmit: function(data, callback)
		{
			handler.submitting = false;
			if (data.success != undefined && data.success == true)
			{
				handler.commentBox.val('');
				handler.selectPage(handler.pageCount, true);
				callback.button.val('Post Reply');
			}
			else
			{
				callback.button.val('Error!');
			}
		}
	};
	handler.load();
});