$(function()
{
	var parser = {
		load: function()
		{
			$.fn.extend({
				parseLinks: function()
				{
					this.html(this.html().replace(/(((?:http(s)?:\/\/)|(www\.))(\S+))/, '<a href="http$3://$4$5">$1</a>'));
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
