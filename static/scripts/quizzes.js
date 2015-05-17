$(function()
{
	var handler = {
		x: null,
		y: null,
		old: [],
		submitting: false,
		halt: false,
		load: function()
		{
			var click = 'click', hooks = [
				{
					type: 'mousedown',
					element: '.quiz-listing',
					func: function(e)
					{
						var offset = handler.getOffset(e);
						handler.x = offset.x;
						handler.y = offset.y;
					}
				},
				{
					type: 'mouseup',
					element: '.quiz-listing',
					func: function(e)
					{
						var t = $(this);
						setTimeout(function()
						{
							var offset = handler.getOffset(e);
							if (handler.x != null && handler.y != null && Math.abs((handler.x - offset.x) + (handler.y - offset.y)) < 10)
							{
								if (handler.halt == true || t.hasClass('editing'))
								{
									handler.halt = false;
									return;
								}

								if (t.hasClass('active'))
								{
									t.removeClass('active').find('.quiz-extra').stop().slideUp();
									t.find('.quiz-options').stop().fadeOut();
									t.find('.quiz-arrow').removeClass('quiz-arrow-flip');
									handler.retractQueries(t);
								}
								else
								{
									t.addClass('active').find('.quiz-extra').stop().slideDown();
									t.find('.quiz-options').stop().fadeIn();
									t.find('.quiz-arrow').addClass('quiz-arrow-flip');
								}
								handler.halt = false;
							}
						}, 1);
					}
				},
				{
					type: click,
					element: '.quiz-options li',
					func: function()
					{
						handler.halt = true;
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
								case 'queries': handler.expandQueries(l); break;
							}
						}
					}
				},
				{
					type: click,
					element: '#submit-button',
					func: function()
					{
						handler.submitQuizField.slideDown().find('.quiz-options').fadeIn('slow');
					}
				},
				{
					type: 'fqLogout',
					func: function()
					{
						handler.hideUserOptions();
						$('#submit-button').hide();
						$('.quiz-vote').fadeOut(400, function()
						{
							$(this).remove();
						});
						$('.admin-option').hide();
						$('.quiz-query-question .delete').remove();
						$('.quiz-queries').slideUp();
						$('.bookmarked').removeClass('bookmarked');
					}
				},
				{
					type: 'fqLogin',
					func: function()
					{
						handler.showUserOptions();
						var subButton = $('#submit-button');
						subButton.text(subButton.attr('orig')).removeClass('quiz-submitted').show();

						if (userIsAdmin())
							$('.admin-option').css('display', 'inline');

						$('.quiz-query-question').append('<div class="delete"><div></div></div>');

						if (typeof isAnswerPage == 'undefined')
							PacketHandler.send(Packet.QuizData);
					}
				},
				{
					type: click,
					element: '.flag_query',
					func: function()
					{
						$(this).parent().parent().find('.quiz-option-queries').click();
						handler.halt = false;
					}
				},
				{
					type: click,
					element: '.quiz-query-submit a',
					func: function()
					{
						$(this).parent().html('<b>New Query:</b> <input class="input-text" type="text"/> <input type="button" class="input-button query-submit" value="Submit">').find('.input-text').focus();
					}
				},
				{
					type: click,
					element: '.quiz-query-submit .query-submit',
					func: function()
					{
						var t = $(this),
							p = t.parent(),
							value = p.find('.input-text').val().trim(),
							listing = p.parent().parent().parent();

						if (value.length > 5)
						{
							p.html('<span class="form-pending">Submitting query, please wait...</span>');
							PacketHandler.send(Packet.SubmitQuery, {
									query: value,
									quiz: handler.getListingID(listing)
								},
								{
									listing: listing,
									query: value
								});
						}
						else
						{
							handler.resetQuerySubmission(listing);
						}
					}
				},
				{
					type: click,
					element: '.quiz-query .query-answer',
					func: function()
					{
						var t = $(this),
							form = t.parent(),
							value = form.find('.input-text').val().trim(),
							holder = form.parent();

						if (value.length > 5)
						{
							form.html('<span class="form-pending">Submitting answer, please wait...</span>');
							PacketHandler.send(Packet.SubmitQueryAnswer, {
									answer: value,
									id: handler.getQueryID(holder)
								},
								{
									queryHolder: holder,
									form: form,
									answer: value
								});
						}
						else
						{
							form.fadeOut(400, function()
							{
								$(this).remove();
							});
						}
					}
				},
				{
					type: click,
					element: '.quiz-query-answer a',
					func: function()
					{
						handler.halt = true;
						var t = $(this),
							q = t.parent().parent();

						q.append('<p class="query-answer-form"><b>Your Answer:</b> <input class="input-text" type="text"/> <input type="button" class="input-button query-answer" value="Answer"></p>').find('.input-text').focus();
					}
				},
				{
					type: click,
					element: '.quiz-query-submit,.query-answer-form',
					func: function()
					{
						handler.halt = true;
					}
				},
				{
					type: click,
					element: '.quiz-query-question .delete div',
					func: function()
					{
						handler.halt = true;
						var holder = $(this).parent().parent().parent();

						PacketHandler.send(Packet.DeleteQuery, {
								id: handler.getQueryID(holder)
							},
							{
								holder: holder
							});
					}
				},
				{
					type: click,
					element: '.quiz-type-image',
					func: function()
					{
						var quizType = $(this);
						if (userIsAdmin() && quizType.parent().parent().parent().hasClass('editing'))
						{
							var currentType = parseInt(quizType.attr('currentType'));
							quizType.removeClass('quiz-type-' + currentType);

							currentType++;
							if (currentType == quizTypeCount)
								currentType = 0;

							quizType.addClass('quiz-type-' + currentType).attr('currentType', currentType);
							quizType.attr('title', quizTypes[currentType]);
						}
					}
				}
			];

			$.fn.extend({
				isAnswer: function()
				{
					return this.hasClass('answer');
				}
			});

			for (var hookIndex in hooks)
			{
				var hookObj = hooks[hookIndex];

				if (hookObj.element != undefined)
					$(document).on(hookObj.type, hookObj.element, hookObj.func);
				else
					$(document).on(hookObj.type, hookObj.func);
			}

			setTimeout(function() {
				$('.quiz-listing').each(function()
				{
					var t = $(this);
					handler.applyQuizFlags(t);
					handler.updateQueryCounter(t);
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
			hook(Packet.EditAnswers, 'handleEditReply');
			hook(Packet.AddQuiz, 'handleAddReply');
			hook(Packet.AddAnswers, 'handleAddReply');
			hook(Packet.ApproveQuiz, 'handleApproval');
			hook(Packet.ApproveAnswers, 'handleApproval');
			hook(Packet.DeleteQuiz, 'handleDelete');
			hook(Packet.DeleteAnswers, 'handleDelete');
			hook(Packet.QuizData, 'applyData');
			hook(Packet.SubmitQuery, 'handleQuerySubmit');
			hook(Packet.SubmitQueryAnswer, 'handleQueryAnswerSubmit');
			hook(Packet.DeleteQuery, 'handleDeleteQuery');

			handler.submitQuizField = $('#quiz-submit');

			$('.quiz-listing').each(function()
			{
				var t = $(this);
				t.attr('origindex', t.index());
			});

			var container = $('#listing-container');
			$('.unapproved').each(function()
			{
				$(this).prependTo(container);
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

		applyData: function(data)
		{
			handler.apply(data.votes, 'vote');
			handler.apply(data.bookmarks, 'bookmark');

			if (data.votes.length >= 3)
				$('.quiz-option-vote').hide();
		},

		apply: function(data, func)
		{
			for (var index in data)
			{
				var element = $('#quiz-' + data[index]);
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
				t.find('input,textarea,select').val('').removeClass('error');
				t.find('.dateSelector').setDateSelectorValue(new Date());
			}).find('.quiz-options').fadeOut('fast');
		},

		handleQuizSuccess: function(form)
		{
			if (handler.submitting)
				return;

			var data =
			{
				title: form.find('#title').val().trim(),
				charity: form.find('#charity').val().trim(),
				closing: form.find('.dateSelector').getDateSelectorValue(),
				quizType: form.find('#quiz-type-field').val()
			};

			var isAnswer = typeof isAnswerPage !== "undefined";
			if (isAnswer)
			{
				data.answers = form.find('#answers').val().trim();
			}
			else
			{
				data.answerPolicy = form.find('.quiz-answer-policy-field').val();
				data.description = form.find('#description').val().trim();
				data.extra = form.find('#extra').val().trim();
			}

			handler.submitting = true;
			PacketHandler.send(isAnswer ? Packet.AddAnswers : Packet.AddQuiz, data);
		},

		handleAddReply: function(data)
		{
			handler.submitting = false;
			if (data.success != undefined && data.success == true)
			{
				handler.closeSubmitField();
				$('#submit-button').addClass('quiz-submitted').html(
					typeof isAnswerPage !== "undefined" ? 'Answers submitted! They\'ll appear on the listing after approval. Click here to submit another!' : 'Quiz submitted! It will appear on the listing after approval. Click here to submit another!'
				);
			}
		},

		handleEditReply: function(data, callback)
		{
			handler.submitting = false;
			if (data.success != undefined && data.success == true)
			{
				var listing = callback.listing;
				delete handler.old[listing.attr('id')];

				listing.find('.quiz-answer-policy').attr('policyValue', listing.find('.quiz-answer-policy-field').val());
				handler.cancelEditing(listing, callback);

				if (!listing.hasClass('updated'))
					listing.addClass('updated');
			}
		},

		handleEditSubmit: function(form)
		{
			form.find('input,select,textarea').removeClass('error');
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

			var listing = form.parent(), data = {
				id: handler.getListingID(form.parent()),
				title: form.find('.quiz-title-title input').val().trim(),
				charity: form.find('.quiz-title-charity input').val().trim(),
				closing: form.find('.quiz-closing').getDateSelectorValue(),
				quizType: parseInt(form.find('.quiz-type-image').attr('currentType'))
			};

			if (listing.isAnswer())
			{
				data.answers = form.find('.quiz-answers textarea').val().trim();
			}
			else
			{
				data.answerPolicy = form.find('#quiz-answer-policy-field').val();
				data.description = form.find('.quiz-description input').val().trim();
				data.extra = form.find('.quiz-description-extra input').val().trim();
			}

			var callback = $.extend({}, data);
			callback.listing = listing;

			var dateSplit = data.closing.split('-');
			callback.closing = new Date(dateSplit[0], dateSplit[1] - 1, dateSplit[2]).getTime() / 1000;

			handler.submitting = true;
			PacketHandler.send(listing.isAnswer() ? Packet.EditAnswers : Packet.EditQuiz, data, callback);
		},

		handleApproval: function(data, callback)
		{
			if (data.success != undefined && data.success == true)
			{
				var listing = callback.listing;

				handler.moveToOrigPosition(listing);
				listing.removeClass('unapproved').find('.quiz-option-approve').remove();
			}
		},

		moveToOrigPosition: function(listing)
		{
			var topElements = $('.unapproved,.bookmarked').length;
			$('#listing-container .quiz-listing:nth-child(' + (parseInt(listing.attr('origindex')) + 1 + topElements) + ')').after(listing);
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
				isLarge = field.hasClass('large');

			if (isLarge)
				field.revertFormatting();

			var old = field.text();

			field.empty();
			var input = $(isLarge ? '<textarea/>' : '<input/>').val(old).appendTo(field);
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
			handler.sendIDListingPacket(listing, listing.isAnswer() ? Packet.DeleteAnswers : Packet.DeleteQuiz);
		},

		bookmark: function(listing, submit)
		{
			var option = listing.find('.quiz-option-bookmark'), list = $('#listing-container');

			if (listing.hasClass('bookmarked'))
			{
				listing.removeClass('bookmarked');
				option.html('Bookmark');
				handler.moveToOrigPosition(listing);
			}
			else
			{
				listing.addClass('bookmarked').prependTo(list);
				option.html('Unbookmark');
			}

			if (submit)
				handler.sendIDListingPacket(listing, Packet.BookmarkQuiz);
		},

		saveEdit: function(listing)
		{
			listing.find('form').submit();
		},

		editQuiz: function(listing)
		{
			listing.addClass('editing').find('.quiz-vote').hide();


			var data = {
				title: handler.prepareEditField(listing, 'title-title', true),
				charity: handler.prepareEditField(listing, 'title-charity', true)
			};

			if (listing.isAnswer())
			{
				data.answers = handler.prepareEditField(listing, 'answers', true);
			}
			else
			{
				data.description = handler.prepareEditField(listing, 'description', true);
				data.extra = handler.prepareEditField(listing, 'description-extra', false)
			}

			var answerPolicyField = listing.find('.quiz-answer-policy').empty();

			var selector = $('<select class="quiz-answer-policy-field"/>').appendTo(answerPolicyField);
			$('<option value="0"/>').text('No answer policy specified').appendTo(selector);
			$('<option value="1"/>').text('No asking allowed').appendTo(selector);
			$('<option value="2"/>').text('No asking before').appendTo(selector);
			selector.val(answerPolicyField.attr('policyValue'));

			handler.old[listing.attr('id')] = data;

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
			handler.sendIDListingPacket(listing, listing.isAnswer() ? Packet.ApproveAnswers : Packet.ApproveQuiz);
		},

		sendIDListingPacket: function(listing, packet)
		{
			PacketHandler.send(packet, {
				id: handler.getListingID(listing)
			}, {
				listing: listing
			});
		},

		resetField: function(listing, fieldName, data)
		{
			var field = listing.find('.quiz-' + fieldName).html(data);
			if (field.hasClass('large'))
				field.formatText();

			return field;
		},

		cancelEditing: function(listing, data)
		{
			var dateField = listing.find('.quiz-closing');
			if (data == undefined)
			{
				data = handler.old[listing.attr('id')];
				data.closing = dateField.attr('timestamp');
			}

			handler.resetField(listing, 'title-title', data.title);
			handler.resetField(listing, 'title-charity', data.charity);

			if (listing.isAnswer())
			{
				handler.resetField(listing, 'answers', data.answers);
			}
			else
			{
				handler.resetField(listing, 'description', data.description).parseLinks();
				handler.resetField(listing, 'description-extra', data.extra).parseLinks();
			}

			dateField.html((listing.isAnswer() ? 'Closed' : 'Closes in') + ' <span class="time-period">' + data.closing + '</span> (<span class="time-formal">' + data.closing + '</span>)').formatTime();

			listing.find('.quiz-option-cancel,.quiz-option-save').remove();
			listing.find('.quiz-options ul').prepend('<li class="quiz-option-edit">Edit</li>');

			listing.find('.quiz-answer-policy').attr('policyValue', data.answerPolicy).html('<b>Answer Policy: </b>' + data.answerPolicyText);

			var answerPolicy = listing.find('.quiz-answer-policy');
			var policyText = "No answer policy specified";

			switch (answerPolicy.attr('policyValue'))
			{
				case "1": policyText = "No asking allowed"; break;
				case "2": policyText = "No asking before"; break;
			}

			answerPolicy.html('<b>Answer Policy: </b>' + policyText);

			handler.applyQuizFlags(listing.removeClass('editing'));
			listing.find('.quiz-vote').fadeIn();

			var quizTypeField = listing.find('.quiz-type-image');
			if (data != undefined)
				quizTypeField.attr('baseType', data.quizType);

			quizTypeField.removeClass('quiz-type-' + quizTypeField.attr('currentType')).addClass('quiz-type-' + quizTypeField.attr('baseType'));
			quizTypeField.attr('title', quizTypes[parseInt(quizTypeField.attr('baseType'))]);
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
		},

		expandQueries: function(listing)
		{
			listing.find('.quiz-queries').slideDown();
		},

		retractQueries: function(listing)
		{
			listing.find('.quiz-queries').slideUp();
			handler.resetQuerySubmission(listing);
		},

		resetQuerySubmission: function(listing)
		{
			listing.find('.quiz-query-submit').html('<a>&raquo; Submit a query for this quiz</a>');
		},

		updateQueryCounter: function(listing)
		{
			var queryCount = listing.find('.quiz-query').length;
			listing.find('.quiz-option-queries').text('Queries' + (queryCount > 0 ? ' (' + queryCount + ')' : ''));

			var queryFlag = listing.find('.flag_query');

			if (queryCount > 0 && queryFlag.length === 0)
				listing.find('.quiz-closing').append('<div class="flag_query flag ">Queries!</div>');
			else if (queryCount === 0 && queryFlag.length > 0)
				queryFlag.remove();
		},

		handleQuerySubmit: function(data, callback)
		{
			var listing = callback.listing;
			handler.resetQuerySubmission(listing);
			if (data.success != undefined && data.success === true)
			{
				var container = $('<div/>').addClass('quiz-query').attr('id', 'query-' + data.queryID).insertBefore(listing.find('.quiz-query-submit')),
					p = '<p/>',
					q = $(p).addClass('quiz-query-question').html('<b>Q:</b> ' + callback.query + ' <span>(Queried by ' + getLoggedInUser() + ')</span>').appendTo(container);

				$(p).addClass('quiz-query-answer').html('<b>A:</b> This query has not been answered yet. <a>[Submit Answer]</a>').appendTo(container);

				if (userIsAdmin())
					q.append('<div class="delete"><div></div></div>');

				handler.updateQueryCounter(listing);
			}
		},

		handleQueryAnswerSubmit: function(data, callback)
		{
			callback.form.fadeOut(400, function()
			{
				$(this).remove();
			});

			if (data.success != undefined && data.success === true)
				callback.queryHolder.find('.quiz-query-answer').html('<b>A:</b> ' + callback.answer + ' <span>(Answered by ' + getLoggedInUser() + ')</span>');
		},

		handleDeleteQuery: function(data, callback)
		{
			if (data.success != undefined && data.success === true)
			{
				callback.holder.fadeOut(400, function()
				{
					var t = $(this), listing = t.parent().parent().parent();
					t.remove();
					handler.updateQueryCounter(listing);
				});
			}
		},

		getQueryID: function(queryHolder)
		{
			return parseInt(queryHolder.attr('id').split('-')[1]);
		},

		getListingID: function(listing)
		{
			return parseInt(listing.attr('id').split('-')[1]);
		}
	};

	handler.load();
});