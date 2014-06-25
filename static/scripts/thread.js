$(function()
{
	var handler = {
		threadLimit: 30,
		submitting: false,
		editing: null,
		load: function()
		{
			this.listing = $('#thread-listing');
			this.commentBox = $('.comment-box textarea');
			this.thread = thread;

			var context = packetContext(this, 'handleCommentSubmit');
			PacketHandler.hook(Packet.TopicComment, context);
			PacketHandler.hook(Packet.EditMessage, context);

			PacketHandler.hook(Packet.GetForumReplies, packetContext(this, 'renderThread'));
			this.pageCount = Math.ceil(this.thread.replyCount / this.threadLimit);

			this.selectPage(1, false);

			var click = 'click';

			$(document)
				.on(click, '.page-bar a', this.handlePageBarClick)
				.on(click, '#reset-button', this.cancelEdit)
				.on(click, '.edit-button', this.editPost)
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

		editPost: function()
		{
			window.location.hash = '';
			var post = $(this).parent();

			var temp = $('<div/>').html(post.find('.message-frame').html()).revertFormatting();
			handler.commentBox.val(temp.html());

			$('#comment-button').val('Save Edit');
			$('#reset-button').show();

			$('.comment-box h1').text('Edit Post...');
			window.location.hash = 'comment';

			handler.editing = post.attr('id');
		},

		cancelEdit: function()
		{
			$('.comment-box h1').text('Post a Reply...');
			$('#comment-button').val('Post Reply');
			handler.commentBox.val('');
			handler.editing = null;
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
						msg = $('<div class="message-frame"/>').html(reply.text).formatText(),
						anc = $('<a/>').attr('name', reply.id);

					var footer = $('<div class="footer"/>').html('Posted <span class="time-period">' + reply.posted + '</span>');

					if (reply.edited != null)
						footer.append(', last edited <span class="time-period">' + reply.edited + '</span>');

					footer.formatPeriods();

					$('<div class="username"/>').html(reply.posterName).appendTo(user);

					if (reply.posterName == getLoggedInUser())
						$('<div class="edit-button"/>').appendTo(element);

					var title = 'User',
						title_ele = $('<div class="title"/>');

					if (reply.posterIsContributor)
						title = 'Contributor';

					if (reply.posterIsAdmin)
						title = 'Admin';

					if (reply.posterIsBanned)
					{
						title = 'Banned';
						title_ele.css('color', 'red');
					}

					title_ele.html(title).appendTo(user);

					user.css('background-image', 'url(http://static.fundraisingquizzes.net/images/avatars/' + reply.posterAvatar + ')');
					element.append(anc, user, msg, footer);
					if (reply.posterSig != null)
						$('<div class="signature"/>').html(reply.posterSig).appendTo(element);

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

				var data = {message: message},
					packet = 0,
					callback = {button: button};


				if (handler.editing != null)
				{
					button.val('Editing...');
					data.id = handler.editing;
					packet = Packet.EditMessage;
					callback.id = handler.editing;
					callback.message = message;
				}
				else
				{
					button.val('Posting...');
					data.id = handler.thread.id;
					packet = Packet.TopicComment;
				}

				PacketHandler.send(packet, data, callback);
			}
		},

		handleCommentSubmit: function(data, callback)
		{
			handler.submitting = false;
			if (data.success != undefined && data.success == true)
			{
				if (handler.editing == null)
				{
					handler.selectPage(handler.pageCount, true);
				}
				else
				{
					window.location.hash = callback.id;
					$('#' + callback.id).find('.message-frame').html(callback.message).formatText();
				}

				handler.cancelEdit();
			}
			else
			{
				callback.button.val('Error!');
			}
		}
	};
	handler.load();
});