var register = {};

register.responseMessages = {
	0: 'Your account was created, logging in...',
	1: 'Some of the fields have not been completed',
	2: 'That username has already been registered',
	3: 'Please enter a valid e-mail address',
	4: 'That e-mail address is already registered to an account',
	5: 'Your username cannot exceed twenty characters in length',
	6: 'Your password must be at least five characters in length',
	7: 'There was an internal error registering your account',
	8: 'Both passwords you entered do not match',
	9: 'There was an unknown error registering your account',
	10: 'Registration is currently disabled while the site is developed'
};

register.attemptRegister = function()
{
	var username_value = register.username_field.val(),
		email_value = register.email_field.val(),
		password_value = register.password_field.val(),
		password_confirm_value = register.password_confirm_field.val(),
		error = null;

	// Check if we have any empty fields.
	if (!(username_value.length > 0 && email_value.length > 0 && password_value.length > 0 && password_confirm_value.length > 0))
		error = register.responseMessages[1];

	// If we have no error yet, check the username is within bounds.
	if (username_value.length > 20 && error == null)
		error = register.responseMessages[5];

	// If we have no error yet, make sure their password isn't silly small.
	if (password_value.length < 5 && error == null)
		error = register.responseMessages[6];

	// If we have no error yet, check the passwords match.
	if (password_value !== password_confirm_value && error == null)
		error = register.responseMessages[8];

	if (error === null)
	{
		register.setPending('Registering your account...');
		PacketHandler.send(Packet.Register, {
			username: register.username_field.val(),
			email: register.email_field.val(),
			password: register.password_field.val()
		});
	}
	else
	{
		register.setError(error);
	}
};

register.handleRegisterResponse = function(data)
{
	if (data.response !== undefined)
	{
		if (data.response === 0)
		{
			register.setSuccess(register.responseMessages[0]);
			setTimeout(function(){ window.location = 'index.php'; }, 2000);
		}
		else
		{
			register.setError(register.responseMessages[data.response]);
		}
	}
	else
	{
		register.setError(register.responseMessages[9]);
	}
};

register.setSuccess = function(message)
{
	register.status.removeClass('pending error');
	register.status.addClass('success');
	register.showMessage(message);
};

register.setError = function(message)
{
	register.status.removeClass('success pending');
	register.status.addClass('error');
	register.showMessage(message);
};

register.setPending = function(message)
{
	register.status.removeClass('error success');
	register.status.addClass('pending');
	register.showMessage(message);
};

register.showMessage = function(message)
{
	register.status.html(message);
	register.status.slideDown();
};

$(document).ready(function()
{
	register.status = $('#register-status-message');

	register.username_field = $('#register-username');
	register.email_field = $('#register-email');
	register.password_field = $('#register-password');
	register.password_confirm_field = $('#register-password-confirm');

	$(document).on('click', '#register-submit-button', register.attemptRegister);
	PacketHandler.hook(Packet.Register, register.handleRegisterResponse);
});