$(function()
{
	var handler = {
		x: null,
		y: null,
		old: [],
		load: function()
		{
			var d = document, q = '.quiz-listing';
			$(d).on('mousedown', q, function(e)
			{
				var offset = handler.getOffset(e);
				handler.x = offset.x;
				handler.y = offset.y;
			}).on('mouseup', q, function(e)
			{
				var offset = handler.getOffset(e);
				if (handler.x != null && handler.y != null && Math.abs((handler.x - offset.x) + (handler.y - offset.y)) < 10)
				{
					var t = $(this), qo = t.find('.quiz-options'), o = qo.offset();

					if (t.hasClass('editing') || (qo.is(':visible') && e.pageX >= o.left && e.pageY >= o.top))
						return;

					if (t.hasClass('active'))
					{
						t.removeClass('active').find('.quiz-extra').stop().slideUp();
						t.find('.quiz-options').stop().fadeOut();
						t.find('.quiz-arrow').removeClass('quiz-arrow-flip');
					}
					else
					{
						t.addClass('active').find('.quiz-extra').stop().slideDown();
						t.find('.quiz-options').stop().fadeIn();
						t.find('.quiz-arrow').addClass('quiz-arrow-flip');
					}
				}
			}).on('click', '.quiz-options li', function()
			{
				var t = $(this), l = t.parent().parent().parent().parent(), id = l.attr('id').split('-')[1], o = t.attr('class').split('-')[2];

				switch (o)
				{
					case 'edit': handler.editQuiz(l); break;
					case 'cancel': handler.cancelEditing(l); break;
					case 'save': handler.saveEdit(l); break;
				}
			});

			setTimeout(function() {
				$('.quiz-listing').each(function()
				{
					handler.applyQuizFlags($(this));
				});
			}, 10);

			window.quizEditError = handler.handleEditErrors;
			window.quizEditSuccess = handler.handleEditSuccess;
			window.quizEditSubmit = handler.handleEditSubmit;

			PacketHandler.hook(Packet.EditQuiz, packetContext(handler, 'handlePacketReply'));
		},

		handlePacketReply: function(data, callback)
		{
			if (data.success != undefined && data.success == true)
			{
				var id = 'quiz-' + callback.id, listing = $('#' + id);
				delete handler.old[id];

				handler.resetField(listing, 'title-title', callback.title);
				handler.resetField(listing, 'title-charity', callback.charity);
				handler.resetField(listing, 'description', callback.description);
				handler.resetField(listing, 'description-extra', callback.extra);

				var dateField = listing.find('.quiz-closing'), date = callback.closing;
				dateField.html('Closes in <span class="time-period">' + date + '</span> (<span class="time-formal">' + date + '</span>)').formatTime();

				listing.find('.quiz-option-cancel,.quiz-option-save').remove();
				listing.find('.quiz-options ul').prepend('<li class="quiz-option-edit">Edit</li>');

				if (!listing.hasClass('updated'))
					listing.addClass('updated');

				handler.applyQuizFlags(listing.removeClass('editing'));
			}
		},

		handleEditSubmit: function(form)
		{
			form.find('input').removeClass('input-error');
		},

		handleEditErrors: function(errorList)
		{
			for (var errorIndex in errorList)
			{
				var error = errorList[errorIndex];
				error.field.addClass('input-error');
			}
		},

		handleEditSuccess: function(form)
		{
			var data = {
				id: parseInt(form.parent().attr('id').split('-')[1]),
				title: form.find('.quiz-title-title input').val().trim(),
				charity: form.find('.quiz-title-charity input').val().trim(),
				closing: form.find('.quiz-closing div').getDateSelectorValue(),
				description: form.find('.quiz-description input').val().trim(),
				extra: form.find('.quiz-description-extra input').val().trim()
			};

			PacketHandler.send(Packet.EditQuiz, data, data);
		},

		prepareEditField: function(listing, fieldClass, required)
		{
			var field = listing.find('.quiz-' + fieldClass),
				old = field.html();

			field.empty();
			var input = $('<input/>').val(old).appendTo(field);
			if (required)
				input.attr('require', 'true');

			return old;
		},

		saveEdit: function(listing)
		{
			listing.find('form').submit();
		},

		editQuiz: function(listing)
		{
			listing.addClass('editing');
			handler.old[listing.attr('id')] = {
				title: handler.prepareEditField(listing, 'title-title', true),
				charity: handler.prepareEditField(listing, 'title-charity', true),
				description: handler.prepareEditField(listing, 'description', true),
				extra: handler.prepareEditField(listing, 'description-extra', false)
			};

			var dateField = listing.find('.quiz-closing').empty(), selector = $('<div/>').appendTo(dateField), s = '<select/>';

			$(s).attr('range', 'days').attr('type', 'day').appendTo(selector).updateRange();
			$(s).attr('range', 'months').attr('type', 'month').appendTo(selector).updateRange();
			$(s).attr('range', 'year-year+5').attr('type', 'year').appendTo(selector).updateRange();
			$(selector).prepend('Closes: ');

			dateField.setDateSelectorValue(dateField.attr('date'));

			var options = listing.find('.quiz-options ul');
			options.prepend('<li class="quiz-option-cancel">Cancel</li>');
			options.prepend('<li class="quiz-option-save">Save</li>');
			options.find('.quiz-option-edit').remove();
		},

		resetField: function(listing, fieldName, data)
		{
			listing.find('.quiz-' + fieldName).html(data);
		},

		cancelEditing: function(listing)
		{
			var data = handler.old[listing.attr('id')];
			handler.resetField(listing, 'title-title', data.title);
			handler.resetField(listing, 'title-charity', data.charity);
			handler.resetField(listing, 'description', data.description);
			handler.resetField(listing, 'description-extra', data.extra);

			var dateField = listing.find('.quiz-closing'), date = dateField.attr('date');
			dateField.html('Closes in <span class="time-period">' + date + '</span> (<span class="time-formal">' + date + '</span>)').formatTime();

			listing.find('.quiz-option-cancel,.quiz-option-save').remove();
			listing.find('.quiz-options ul').prepend('<li class="quiz-option-edit">Edit</li>');
		},

		getOffset: function(e)
		{
			var offset = {x: e.offsetX, y: e.offsetY};

			if (typeof offset.x == "undefined")
				offset.x = e.pageX - $(e.target).offset().left;

			if (typeof offset.y == "undefined")
				offset.y = e.pageY - $(e.target).offset().top;

			return offset;
		},

		applyQuizFlags: function(listing)
		{
			var closingElement = listing.find('.quiz-closing');

			if (listing.hasClass('new'))
				closingElement.append('<div class="flag_new flag">New!</div>');

			if (listing.hasClass('updated'))
				closingElement.append('<div class="flag_updated flag">Updated!</div>');
		}
	};

	handler.load();
});