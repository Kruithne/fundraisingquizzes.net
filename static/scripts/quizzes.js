$(function()
{
	var handler = {
		x: null,
		y: null,
		load: function()
		{
			var d = document, q = '.quiz-listing';
			$(d).on('mousedown', q, function(e)
			{
				handler.x = e.offsetX;
				handler.y = e.offsetY;
			}).on('mouseup', q, function(e)
			{
				if (handler.x != null && handler.y != null && Math.abs((handler.x - e.offsetX) + (handler.y - e.offsetY)) < 10)
				{
					var t = $(this), qo = t.children('.quiz-options'), o = qo.offset();

					if (qo.is(':visible') && e.clientX >= o.left && e.clientY >= o.top)
						return;

					if (t.hasClass('active'))
					{
						t.removeClass('active').children('.quiz-extra').stop().slideUp();
						t.children('.quiz-options').stop().fadeOut();
						t.children('.quiz-arrow').removeClass('quiz-arrow-flip');
					}
					else
					{
						t.addClass('active').children('.quiz-extra').stop().slideDown();
						t.children('.quiz-options').stop().fadeIn();
						t.children('.quiz-arrow').addClass('quiz-arrow-flip');
					}
				}
			}).on('click', '.quiz-options li', function()
			{
				var id = $(this).parent().parent().parent().attr('id');
			});
		}
	};

	handler.load();
});