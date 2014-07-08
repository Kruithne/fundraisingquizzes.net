$(function()
{
	var handler = {
		changingAvatar: false,
		submittingFact: false,
		load: function()
		{
			var doc = $(document), click = 'click';

			var option_selector = '#options li',
				options = $(option_selector),
				minHeight = options.first().outerHeight(true) * options.length;

			$('.settings-panel').css('min-height', minHeight + 'px');

			doc.on('fqLogout', function()
			{
				window.location.href = 'index.php';
			}).on(click, option_selector, function()
			{
				var option = $(this);

				if (!option.hasClass('active'))
				{
					option.parent().children().removeClass('active');
					option.addClass('active');

					handler.switchToPanel(option.attr('panel'));
				}
			}).on(click, '#panel-graveyard p', function()
			{
				handler.restoreQuiz($(this));
			}).on(click, '#avatar-selector img', this.switchAvatar)
				.on(click, '#broadcast-button', this.broadcastMessage)
				.on(click, '#signature-button', this.changeSignature)
				.on(click, '#new-fact-button', this.addNewFact)
				.on(click, '#fact-list a', this.deleteFact);

			handler.switchToPanel('panel-details');
			PacketHandler.hook(Packet.RestoreQuiz, packetContext(handler, 'handleRestoreQuiz'));

			window.changeEmailError = handler.changeEmailError;
			window.changePasswordError = handler.changePasswordError;
			window.changeEmailSuccess = handler.changeEmailSuccess;
			window.changePasswordSuccess = handler.changePasswordSuccess;

			PacketHandler.hook(Packet.ChangePassword, packetContext(handler, 'handleChangePassword'));
			PacketHandler.hook(Packet.ChangeEmail, packetContext(handler, 'handleChangeEmail'));
			PacketHandler.hook(Packet.ChangeAvatar, packetContext(handler, 'handleAvatarChange'));
			PacketHandler.hook(Packet.AddNewFact, packetContext(handler, 'handleAddNewFact'));
			PacketHandler.hook(Packet.DeleteFact, packetContext(handler, 'handleDeleteFact'));

			var setHandler = packetContext(handler, 'handleBroadcastSet');
			PacketHandler.hook(Packet.SetBroadcast, setHandler);
			PacketHandler.hook(Packet.ChangeForumSignature, setHandler);
		},

		changeSignature: function()
		{
			var button = $(this).val('Changing...');
			PacketHandler.send(Packet.ChangeForumSignature, {
				sig: $('#signature').val().trim()
			},
			{
				button: button
			});
		},

		broadcastMessage: function()
		{
			var button = $(this).val('Processing...');
			PacketHandler.send(Packet.SetBroadcast, {
				message: $('#broadcast-field').val().trim()
			},
			{
				button: button
			});
		},

		handleBroadcastSet: function(data, callback)
		{
			if (data.success !== undefined && data.success == true)
				callback.button.val('Done!');
			else
				callback.button.val('Error!');
		},

		switchToPanel: function(panelID)
		{
			$('.settings-panel').hide();
			var panel = $('#' + panelID);
			panel.show();
		},

		restoreQuiz: function(listing)
		{
			PacketHandler.send(Packet.RestoreQuiz, {
				id: parseInt(listing.attr('id'))
			},
			{
				listing: listing
			});
		},

		handleRestoreQuiz: function(data, callback)
		{
			if (data.success !== undefined && data.success == true)
			{
				callback.listing.fadeOut(400, function()
				{
					$(this).remove();
				});
			}
		},

		changePasswordError: function(e)
		{
			$('#password-error').setError('Make sure you enter your current password and both new passwords match!');
		},

		changeEmailError: function()
		{
			$('#email-error').setError('You must enter your password and a valid e-mail address!');
		},

		changeEmailSuccess: function(form)
		{
			if (!form.hasClass('submitting'))
			{
				form.addClass('submitting');
				var email = form.find('#new-email').val().trim();

				PacketHandler.send(Packet.ChangeEmail, {
					email: email,
					pass: form.find('.current-password').val().trim()
				},
				{
					form: form,
					errorField: form.find('.error-field').setPending('Changing e-mail address...'),
					email: email
				});
			}
		},

		handleChangeEmail: function(data, callback)
		{
			var form = callback.form,
				errorField = callback.errorField;

			if (data.success != undefined && data.success == true)
			{
				errorField.setSuccess('E-mail address changed!');
				form.find('.input-text').val('');
				$('#email-address').text(callback.email);
			}
			else
			{
				if (data.error != undefined)
					errorField.setError(data.error);
				else
					errorField.setError('Unable to change e-mail address, try again later!');
			}
			form.removeClass('submitting');
		},

		changePasswordSuccess: function(form)
		{
			if (!form.hasClass('submitting'))
			{
				form.addClass('submitting');

				PacketHandler.send(Packet.ChangePassword, {
					pass: form.find('#new-pass').val().trim(),
					current: form.find('.current-password').val().trim()
				},
				{
					form: form,
					errorField: form.find('.error-field').setPending('Changing password...')
				});
			}
		},

		handleChangePassword: function(data, callback)
		{
			var form = callback.form,
				errorField = callback.errorField;

			if (data.success != undefined && data.success == true)
			{
				errorField.setSuccess('Password changed!');
				form.find('.input-text').val('');
			}
			else
			{
				if (data.error != undefined)
					errorField.setError(data.error);
				else
					errorField.setError('Unable to change password, try again later!');
			}
			form.removeClass('submitting');
		},

		switchAvatar: function()
		{
			var avatar = $(this);
			if (!handler.changingAvatar && !avatar.hasClass('selected'))
			{
				handler.changingAvatar = true;

				PacketHandler.send(Packet.ChangeAvatar, {
					avatar: parseInt(avatar.addClass('selecting').attr('id'))
				},
				{
					avatar: avatar
				});
			}
		},

		handleAvatarChange: function(data, callback)
		{
			handler.changingAvatar = false;
			var selector = $('#avatar-selector');
			selector.find('.selected,.selecting').removeClass('selected selecting');

			if (data.success != undefined && data.success == true)
			{
				callback.avatar.addClass('selected');
			}
		},

		addNewFact: function()
		{
			if (handler.submittingFact)
				return;

			handler.submittingFact = true;
			var text = $('#new-fact').val().trim();

			if (text.length > 0)
			{
				var data = { text: text };
				PacketHandler.send(Packet.AddNewFact, data, data);
			}
		},

		handleAddNewFact: function(data, callback)
		{
			handler.submittinFact = false;
			if (data.success != undefined && data.success == true)
				$('<p/>').html(callback.text).appendTo($('#fact-list')).append(' <a>[Delete]</a>');
		},

		deleteFact: function()
		{
			var t = $(this).parent();
			var id = parseInt(t.attr('id'));
			PacketHandler.send(Packet.DeleteFact, {
				id: id
			},
			{
				field: t
			});
		},

		handleDeleteFact: function(data, callback)
		{
			if (data.success != undefined && data.success == true)
			{
				callback.field.fadeOut(400, function()
				{
					$(this).remove();
				});
			}
		}
	};
	handler.load();
});
