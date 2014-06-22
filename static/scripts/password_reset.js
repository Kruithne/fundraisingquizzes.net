$(function()
{
	var handler =
	{
		load: function()
		{
			handler.errorField = $('#reset-error');
			window.resetError = handler.handleError;
			window.resetSubmit = handler.handleSubmit;
			window.resetComplete = handler.handleSuccess;

			PacketHandler.hook(Packet.ResetPassword, packetContext(handler, 'handleReset'));
		},

		handleReset: function(data, callback)
		{
			if (data.success != undefined && data.success == true)
			{
				handler.errorField.setSuccess('Password reset! Log-in in the top right-hand corner of the page!');
				callback.form.fadeOut();
			}
			else
			{
				handler.errorField.setError(data.error != undefined ? data.error : 'Server error, try again later!');
			}
		},

		handleError: function(errorList)
		{
			handler.errorField.setError('Make sure both fields are filled in and match!');
			for (var errorIndex in errorList)
			{
				var error = errorList[errorIndex];
				error.field.addClass('error');
			}
		},

		handleSubmit: function(form)
		{
			form.find('.input-text').removeClass('error');
		},

		handleSuccess: function(form)
		{
			handler.errorField.setPending('Resetting password...');
			PacketHandler.send(Packet.ResetPassword, {
				password: $('#reset-password').val().trim(),
				key: $('#reset-key').val()
			},{
				form: form
			})
		}
	};
	handler.load();
});