$(function()
{
	var handler = {
		x: null,
		y: null,
		old: [],
		submitting: false,
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
				var t = $(this), l = t.parent().parent().parent().parent(), eid = l.attr('id'), o = t.attr('class').split(' ')[0].split('-')[2];

				if (eid == 'quiz-submit')
				{
					switch (o)
					{
						case 'cancel': handler.closeSubmitField(); break;
						case 'save': handler.submitQuizField.find('form').submit(); break;
					}
				}
				else
				{
					switch (o)
					{
						case 'edit': handler.editQuiz(l); break;
						case 'cancel': handler.cancelEditing(l); break;
						case 'save': handler.saveEdit(l); break;
						case 'approve': handler.approveQuiz(l); break;
						case 'delete': handler.deleteQuiz(l); break;
						case 'confirm': handler.confirmDelete(l); break;
						case 'nodelete': handler.cancelDelete(l); break;
						case 'vote': handler.vote(l, true); break;
						case 'bookmark': handler.bookmark(l, true); break;
					}
				}
			}).on('click', '#submit-button', function()
			{
				handler.submitQuizField.slideDown().find('.quiz-options').fadeIn('slow');
			}).on('fqLogout', function()
			{
				handler.hideUserOptions();
				$('#submit-button').hide();
				$('.quiz-vote').fadeOut(400, function()
				{
					$(this).remove();
				});

				$('.admin-option').hide();
			}).on('fqLogin', function()
			{
				handler.showUserOptions();
				$('#submit-button').show();

				if (userIsAdmin())
					$('.admin-option').css('display', 'inline');

				PacketHandler.send(Packet.VoteData);
				PacketHandler.send(Packet.BookmarkData);
			});

			setTimeout(function() {
				$('.quiz-listing').each(function()
				{
					handler.applyQuizFlags($(this));
				});
			}, 10);

			var w = window;
			w.quizEditError = handler.handleEditErrors;
			w.quizEditSuccess = handler.handleEditSuccess;
			w.quizEditSubmit = handler.handleEditSubmit;

			w.submitQuizError = handler.handleEditErrors;
			w.submitQuizSubmit = handler.handleEditSubmit;
			w.submitQuizSuccess = handler.handleQuizSuccess;

			function hook(packet, handleFunc)
			{
				PacketHandler.hook(packet, packetContext(handler, handleFunc));
			}

			hook(Packet.EditQuiz, 'handleEditReply');
			hook(Packet.AddQuiz, 'handleAddReply');
			hook(Packet.ApproveQuiz, 'handleApproval');
			hook(Packet.DeleteQuiz, 'handleDelete');
			hook(Packet.VoteData, 'applyVotes');
			hook(Packet.BookmarkData, 'applyBookmarks');

			handler.submitQuizField = $('#quiz-submit');

			var container = $('#listing-container');
			$('.unapproved').each(function()
			{
				var t = $(this);
				t.attr('origindex', t.index()).prependTo(container);
			});
		},

		hideUserOptions: function()
		{
			$('.quiz-options ul').hide();
		},

		showUserOptions: function()
		{
			$('.quiz-options ul').show();
		},

		applyBookmarks: function(data)
		{
			handler.apply(data, 'bookmark');
		},

		applyVotes: function(data)
		{
			handler.apply(data, 'vote');
		},

		apply: function(data, func)
		{
			for (var index in data.data)
			{
				var element = $('#quiz-' + data.data[index]);
				if (element.length > 0)
					handler[func](element, false);
			}
		},

		vote: function(listing, submit)
		{
			$('<div class="quiz-vote" title="You have voted for this quiz!"/>').appendTo(listing.find('form')).fadeIn();
			listing.addClass('voted').find('.quiz-option-vote').hide();

			if (submit)
				handler.sendIDListingPacket(listing, Packet.VoteQuiz);

			if ($('.voted').length == 3)
				$('.quiz-option-vote').hide();
			else
				$('.quiz-option-vote').show();
		},

		closeSubmitField: function()
		{
			handler.submitQuizField.slideUp(400, function()
			{
				var t = $(this);
				t.find('input').val('');
				t.find('.dateSelector').setDateSelectorValue(new Date());
			}).find('.quiz-options').fadeOut('fast');
		},

		handleQuizSuccess: function(form)
		{
			if (handler.submitted)
				return;

			var data =
			{
				title: form.find('#title').val().trim(),
				charity: form.find('#charity').val().trim(),
				closing: form.find('.dateSelector').getDateSelectorValue(),
				description: form.find('#description').val().trim(),
				extra: form.find('#extra').val().trim()
			};

			handler.submitting = true;
			PacketHandler.send(Packet.AddQuiz, data);
		},

		handleAddReply: function(data)
		{
			handler.submitting = false;
			if (data.success != undefined && data.success == true)
			{
				handler.closeSubmitField();
				$('#submit-button').addClass('quiz-submitted').html('Quiz submitted! It will appear on the listing after approval. Click here to submit another!');
			}
		},

		handleEditReply: function(data, callback)
		{
			handler.submitting = false;
			if (data.success != undefined && data.success == true)
			{
				var id = 'quiz-' + callback.id, listing = $('#' + id);
				delete handler.old[id];

				handler.cancelEditing(listing, callback);

				if (!listing.hasClass('updated'))
					listing.addClass('updated');
			}
		},

		handleEditSubmit: function(form)
		{
			form.find('input,select').removeClass('error');
		},

		handleEditErrors: function(errorList)
		{
			for (var errorIndex in errorList)
			{
				var error = errorList[errorIndex],
					field = error.field;

				if (field.hasClass('dateSelector'))
					field = field.find('select');

				field.addClass('error');
			}
		},

		handleEditSuccess: function(form)
		{
			if (handler.submitting)
				return;
			var data = {
				id: parseInt(form.parent().attr('id').split('-')[1]),
				title: form.find('.quiz-title-title input').val().trim(),
				charity: form.find('.quiz-title-charity input').val().trim(),
				closing: form.find('.quiz-closing').getDateSelectorValue(),
				description: form.find('.quiz-description input').val().trim(),
				extra: form.find('.quiz-description-extra input').val().trim()
			};

			handler.submitting = true;
			PacketHandler.send(Packet.EditQuiz, data, data);
		},

		handleApproval: function(data, callback)
		{
			if (data.success != undefined && data.success == true)
			{
				var listing = callback.listing,
					position = parseInt(listing.attr('origindex')) + 1;

				$('#listing-container div:nth-child(' + position + ')').after(listing);
				listing.removeClass('unapproved').find('.quiz-option-approve').remove();
			}
		},

		handleDelete: function(data, callback)
		{
			if (data.success != undefined && data.success == true)
				callback.listing.fadeOut(400, function()
				{
					$(this).remove();
				});
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

		deleteQuiz: function(listing)
		{
			var options = listing.find('.quiz-options ul');
			options.find('li').hide();

			$('<li/>').addClass('quiz-option-confirm').html('Confirm Deletion').appendTo(options);
			$('<li/>').addClass('quiz-option-nodelete').html('No, stop!').appendTo(options);
		},

		cancelDelete: function(listing)
		{
			var options = listing.find('.quiz-options');
			options.find('.quiz-option-confirm, .quiz-option-nodelete').remove();
			options.find('li').show();
		},

		confirmDelete: function(listing)
		{
			handler.sendIDListingPacket(listing, Packet.DeleteQuiz);
		},

		bookmark: function(listing, submit)
		{
			var option = listing.find('.quiz-option-bookmark');

			if (listing.hasClass('bookmarked'))
			{
				listing.removeClass('bookmarked');
				option.html('Bookmark');
			}
			else
			{
				listing.addClass('bookmarked');
				option.html('Unbookmark');

				$('<div class="quiz-bookmark" title="You have bookmarked this quiz."/>').appendTo(listing.find('form')).fadeIn();

				if (submit)
					handler.sendIDListingPacket(listing, Packet.BookmarkQuiz);
			}
		},

		saveEdit: function(listing)
		{
			listing.find('form').submit();
		},

		editQuiz: function(listing)
		{
			listing.addClass('editing').find('.quiz-vote').hide();
			handler.old[listing.attr('id')] = {
				title: handler.prepareEditField(listing, 'title-title', true),
				charity: handler.prepareEditField(listing, 'title-charity', true),
				description: handler.prepareEditField(listing, 'description', true),
				extra: handler.prepareEditField(listing, 'description-extra', false)
			};

			var dateField = listing.find('.quiz-closing').empty(), s = '<select/>';

			var daySelector = $(s).attr('range', 'days').attr('type', 'day').appendTo(dateField);
			$(s).attr('range', 'months').attr('type', 'month').appendTo(dateField).updateRange();
			$(s).attr('range', 'year-year+5').attr('type', 'year').appendTo(dateField).updateRange();
			$(dateField).prepend('Closes: ');

			daySelector.updateRange();

			dateField.setDateSelectorValue(dateField.attr('date'));

			var options = listing.find('.quiz-options ul');
			options.prepend('<li class="quiz-option-cancel">Cancel</li>');
			options.prepend('<li class="quiz-option-save">Save</li>');
			options.find('.quiz-option-edit').remove();
		},

		approveQuiz: function(listing)
		{
			handler.sendIDListingPacket(listing, Packet.ApproveQuiz);
		},

		sendIDListingPacket: function(listing, packet)
		{
			PacketHandler.send(packet, {
				id: listing.attr('id').split('-')[1]
			}, {
				listing: listing
			});
		},

		resetField: function(listing, fieldName, data)
		{
			listing.find('.quiz-' + fieldName).html(data);
		},

		cancelEditing: function(listing, data)
		{
			var dateField = listing.find('.quiz-closing');
			if (data == undefined)
			{
				data = handler.old[listing.attr('id')];
				data.closing = dateField.attr('date');
			}

			handler.resetField(listing, 'title-title', data.title);
			handler.resetField(listing, 'title-charity', data.charity);
			handler.resetField(listing, 'description', data.description);
			handler.resetField(listing, 'description-extra', data.extra);

			dateField.html('Closes in <span class="time-period">' + data.closing + '</span> (<span class="time-formal">' + data.closing + '</span>)').formatTime();

			listing.find('.quiz-option-cancel,.quiz-option-save').remove();
			listing.find('.quiz-options ul').prepend('<li class="quiz-option-edit">Edit</li>');

			handler.applyQuizFlags(listing.removeClass('editing'));
			listing.find('.quiz-vote').fadeIn();
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