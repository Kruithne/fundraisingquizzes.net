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
				if (handler.x != null && handler.y != null && Math.abs((handler.x - e.offsetX) + (handler.y - e.offsetY)) < 10)
				{
					var t = $(this);
					if (t.hasClass('active'))
					{
						t.removeClass('active').children('.quiz-extra').stop().slideUp();
						t.children('.quiz-arrow').removeClass('quiz-arrow-flip');
					}
					else
					{
						t.addClass('active').children('.quiz-extra').stop().slideDown();
						t.children('.quiz-arrow').addClas('quiz-arrow-flip');
					}
				}
			});
		}
	};

	handler.load();
});