$(function()
{
	var handler = {
		load: function()
		{
			var doc = $(document);

			var option_selector = '#options li',
				options = $(option_selector),
				minHeight = options.first().outerHeight(true) * options.length;

			$('.settings-panel').css('min-height', minHeight + 'px');

			doc.on('fqLogout', function()
			{
				window.location.href = 'index.php';
			}).on('click', option_selector, function()
			{
				var option = $(this);

				if (!option.hasClass('active'))
				{
					option.parent().children().removeClass('active');
					option.addClass('active');

					handler.switchToPanel(option.attr('panel'));
				}
			});
			handler.switchToPanel('panel-details');
		},

		switchToPanel: function(panelID)
		{
			$('.settings-panel').hide();
			var panel = $('#' + panelID);
			panel.show();
		}
	};
	handler.load();
});
