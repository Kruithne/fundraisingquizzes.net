$(function()
{
	var handler = {
		load: function()
		{
			this.element = $('#account-status');
			this.loggedIn = loggedIn == undefined ? false : loggedIn;

			this.resetLoginForm();

			var d = document, c = 'click';
			$(d).on(c, '#login-button', handler.loginButtonClick);
			$(d).on(c, '#login-cancel', handler.resetLoginForm);
		},

		loginButtonClick: function()
		{
			var element = handler.element;
			element.empty();
			$('<input type="text" placeholder="Username..." id="username-field" class="input-text"/>').appendTo(element);
			$('<input type="password" placeholder="Password..." id="password-field" class="input-text"/>').appendTo(element);
			$('<input type="button" id="login-submit" value="Login" class="input-button"/>').appendTo(element);
			$('<input type="button" id="login-cancel" value="Cancel" class="input-button"/>').appendTo(element);
		},

		resetLoginForm: function()
		{
			if (handler.loggedIn)
				handler.element.html('You are logged in as NOBODY!');
			else
				handler.element.html('You are currently not logged in: <a id="login-button">login</a> or <a>register</a>.');
		}
	};

	handler.load();
});