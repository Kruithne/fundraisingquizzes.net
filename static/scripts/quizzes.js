$(function()
{
	var handler = {
		x: null,
		y: null,
		load: function()
		{
			var d = document;
			$(d).on('mousedown', '.quiz-listing', function(e)
			{
				handler.x = e.offsetX;
				handler.y = e.offsetY;
			}).on('mouseup', '.quiz-listing', function(e)
			{
				var h = handler;
				if (h.x != null && h.y != null && Math.abs((h.x - e.offsetX) + (h.y - e.offsetY)) < 10)
				{
					var t = $(this);
					if (t.hasClass('active'))
					{
						t.removeClass('active').children('.quiz-extra').stop().slideUp();
						t.children('.quiz-arrow').removeClass('quiz-arrow-flip');
					}
					else
					{
						t.addClass('active').children('.quiz-extra').stop().slideDown().parent().children('.quiz-arrow').addClass('quiz-arrow-flip');
						t.children('.quiz-arrow').addClas('quiz-arrow-flip');
					}
				}
			});
		}
	};

	handler.load();
});