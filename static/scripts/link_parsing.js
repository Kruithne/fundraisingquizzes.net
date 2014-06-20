$(function()
{
	var parser = {
		load: function()
		{
			$.fn.extend({
				parseLinks: function()
				{
					this.html(this.html().replace(/(((?:http(s)?:\/\/)|(www\.))(\S+))/, '<a href="http$3://$4$5">$1</a>'));
					this.find('a').each(function()
					{
						var t = $(this),
							text = t.text();

						if (text.length > 30)
							t.text(text.substr(0, 29) + '...');
					});
				}
			});
			$('.linkable').each(function()
			{
				$(this).parseLinks();
			})
		}
	};

	parser.load();
});
