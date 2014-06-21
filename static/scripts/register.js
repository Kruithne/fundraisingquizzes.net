$(function()
{
	var handler =
	{
		submitting: false,
		load: function()
		{
			handler.errorStatus = $('#status');
			handler.form = $('#register-form');

			window.regFormSubmit = handler.handleFormSubmit;
			window.regFormSuccess = handler.handleFormSuccess;
			window.regFormErrors = handler.handleFormErrors;

			PacketHandler.hook(Packet.RegisterAccount, packetContext(handler, 'handleRegister'));

			$(document).on('click', '#register-button', handler.buttonSubmit)
				.on('click', '#reset-button', handler.buttonReset)
				.on('fqLogin', handler.login);
		},

		login: function()
		{
			window.location.href = 'index.php';
		},

		buttonSubmit: function()
		{
			if (!handler.submitting)
				handler.form.submit();
		},

		buttonReset: function()
		{
			if (!handler.submitting)
				handler.form.find('.input-text').val('');
		},

		handleFormSubmit: function(form)
		{
			form.find('.input-text').removeClass('error');
		},

		handleFormSuccess: function(form)
		{
			handler.submitting = true;
			handler.errorStatus.setPending('Verifying your details, hang tight! ...');
			setTimeout(function()
			{
				var username = handler.grabFormValue(form, '#reg-username'),
					password = handler.grabFormValue(form, '#reg-password');

				PacketHandler.send(Packet.RegisterAccount, {
					username: username,
					email: handler.grabFormValue(form, '#reg-email'),
					password: password
				},
				{
					username: username,
					password: password
				})
			}, 2000);
		},

		handleFormErrors: function(error_list)
		{
			var errorMessage = null;
			for (var errorIndex in error_list)
			{
				var error = error_list[errorIndex];
				error.field.addClass('error');

				if (errorMessage == null)
				{
					switch (error.error)
					{
						case 'required': errorMessage = 'You need to fill out all the fields below!'; break;
						case 'invalid_email': errorMessage = 'You must enter a valid e-mail address!'; break;
						case 'password_mismatch': errorMessage = 'The passwords you enter do not match!'; break;
						case 'invalid': errorMessage = 'Your username must be 4+ characters and can only consist of a-z, A-Z, 0-9 and _'; break;
					}
				}
			}

			if (errorMessage == null)
				errorMessage = 'There was an error with your registration!';

			handler.errorStatus.setError(errorMessage);
		},

		handleRegister: function(data, callback)
		{
			if (data.success != undefined && data.success == true)
			{
				handler.errorStatus.setSuccess('Account created! Logging you in now...');
				PacketHandler.send(Packet.Login, {
					user: callback.username,
					pass: callback.password
				});
			}
			else
			{
				if (data.error != undefined)
					handler.errorStatus.setError(data.error);
				else
					handler.errorStatus.setError('Something went wrong, try again later!');
			}
			handler.submitting = false;
		},

		grabFormValue: function(form, value)
		{
			return form.find(value).val().trim();
		}
	};
	handler.load();
});