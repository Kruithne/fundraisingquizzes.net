$(function()
{
	$.fn.extend({
		formatText: function()
		{
			var text = this.text();
			text = text.replace(/\n{2,}/g, '</p><p class="break">');
			text = text.replace(/\n/g, '<br/>');

			this.html('<p>' + text + '</p>');
			return this;
		},

		revertFormatting: function()
		{
			var html = this.html();
			html = html.replace(/^<p>|<\/p>$/g, '');
			html = html.replace(/<\/p><p class="break">/g, "\n\n");
			html = html.replace(/<br(\/)?>/g, "\n");

			return this.html(html);
		}
	});

	$('.formatted').each(function()
	{
		$(this).formatText();
	});
});