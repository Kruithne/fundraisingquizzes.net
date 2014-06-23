$(function()
{
	var handler = {
		load: function()
		{
			var doc = $(document), click = 'click';

			var option_selector = '#options li',
				options = $(option_selector),
				minHeight = options.first().outerHeight(true) * options.length;

			$('.settings-panel').css('min-height', minHeight + 'px');

			doc.on('fqLogout', function()
			{
				window.location.href = 'index.php';
			}).on(click, option_selector, function()
			{
				var option = $(this);

				if (!option.hasClass('active'))
				{
					option.parent().children().removeClass('active');
					option.addClass('active');

					handler.switchToPanel(option.attr('panel'));
				}
			}).on(click, '#panel-graveyard p', function()
			{
				handler.restoreQuiz($(this));
			});

			handler.switchToPanel('panel-details');
			PacketHandler.hook(Packet.RestoreQuiz, packetContext(handler, 'handleRestoreQuiz'));
		},

		switchToPanel: function(panelID)
		{
			$('.settings-panel').hide();
			var panel = $('#' + panelID);
			panel.show();
		},

		restoreQuiz: function(listing)
		{
			PacketHandler.send(Packet.RestoreQuiz, {
				id: parseInt(listing.attr('id'))
			},
			{
				listing: listing
			});
		},

		handleRestoreQuiz: function(data, callback)
		{
			if (data.success !== undefined && data.success == true)
			{
				callback.listing.fadeOut(400, function()
				{
					$(this).remove();
				});
			}
		}
	};
	handler.load();
});
