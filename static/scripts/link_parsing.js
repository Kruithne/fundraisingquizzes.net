$(function()
{
	var parser = {
		load: function()
		{
			$('.linkable').each(function()
			{
				var e = $(this);
				e.html(e.html().replace(/((http(s|):\/\/|(www\.))+(\S+))/, '<a href="http$3://$4$5">$1</a>'));
			})
		}
	};

	parser.load();
});
