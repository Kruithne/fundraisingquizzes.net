$(function()
{
	var handler = {
		load: function()
		{
			var doc = $(document);

			doc.on('fqLogout', function()
			{
				window.location.href = 'index.php';
			}).on('click', '#options li', function()
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
