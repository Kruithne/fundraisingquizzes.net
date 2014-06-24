$(function()
{
	var handler = {
		load: function()
		{
			this.listing = $('#thread-listing');
			this.thread = thread;
			this.threadLimit = 30;

			PacketHandler.hook(Packet.GetForumReplies, packetContext(this, 'renderThread'));
			this.pageCount = Math.ceil(this.thread.replyCount / this.threadLimit);

			this.selectPage(1);

			$(document).on('click', '.page-bar a', this.handlePageBarClick);
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
				handler.selectPage(1);
			}
			else if (link.hasClass('next'))
			{
				handler.selectPage(handler.page + 1);
			}
			else if (link.hasClass('previous'))
			{
				handler.selectPage(handler.page - 1)
			}
			else if (link.hasClass('last'))
			{
				handler.selectPage(handler.pageCount);
			}
		},

		selectPage: function(page)
		{
			this.page = page;
			$('#thread-header .right').text('Page ' + this.page + ' / ' + this.pageCount);

			PacketHandler.send(Packet.GetForumReplies, {
				id: this.thread.id,
				offset: (this.page - 1) * this.threadLimit
			});

			this.updatePageBars();
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

					element.append(user, msg);

					this.listing.append(element);
				}
			}
		}
	};
	handler.load();
});