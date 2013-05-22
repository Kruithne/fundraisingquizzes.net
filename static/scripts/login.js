var login = {};

login.attemptLogin = function()
{
	login.setPending('Logging in...');
	PacketHandler.send(Packet.Login, {
		username: login.username_field.val(),
		password: login.password_field.val()
	});
};

login.handleLoginResponse = function(data)
{
	if (data.auth == 1)
		window.location = 'index.php';
	else
		login.setError('Invalid username/password.');
};

login.setError = function(message)
{
	login.status.removeClass('success pending');
	login.status.addClass('error');
	login.showMessage(message);
};

login.setPending = function(message)
{
	login.status.removeClass('error success');
	login.status.addClass('pending');
	login.showMessage(message);
};

login.showMessage = function(message)
{
	login.status.html(message);
	login.status.slideDown();
}

// TODO: Add in keyboard shortcut for quick log-in.

$(document).ready(function()
{
	login.status = $('#login-status-message');
	login.username_field = $('#login-username');
	login.password_field = $('#login-password');

	PacketHandler.hook(Packet.Login, login.handleLoginResponse);
	$(document).on('click', '#login-submit-button', login.attemptLogin);
});