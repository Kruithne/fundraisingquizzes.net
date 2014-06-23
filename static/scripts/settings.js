$(function()
{
	var handler = {
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
			});

			handler.switchToPanel('panel-details');
			PacketHandler.hook(Packet.RestoreQuiz, packetContext(handler, 'handleRestoreQuiz'));

			window.changeEmailError = handler.changeEmailError;
			window.changePasswordError = handler.changePasswordError;
			window.changeEmailSuccess = handler.changeEmailSuccess;
			window.changePasswordSuccess = handler.changePasswordSuccess;

			PacketHandler.hook(Packet.ChangePassword, packetContext(handler, 'handleChangePassword'));
			PacketHandler.hook(Packet.ChangeEmail, packetContext(handler, 'handleChangeEmail'));
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
			$('#password-error').setError('Make sure both passwords match!');
		},

		changeEmailError: function()
		{
			$('#email-error').setError('You must enter a valid e-mail address!');
		},

		changeEmailSuccess: function(form)
		{
			if (!form.hasClass('submitting'))
			{
				form.addClass('submitting');

				PacketHandler.send(Packet.ChangeEmail, {
					email: form.find('#new-email').val().trim()
				},
				{
					form: form,
					errorField: form.find('.error-field').setPending('Changing e-mail address...')
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
			}
			else
			{
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
					pass: form.find('#new-pass').val().trim()
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
				errorField.setError('Unable to change password, try again later!');
			}
			form.removeClass('submitting');
		}
	};
	handler.load();
});
