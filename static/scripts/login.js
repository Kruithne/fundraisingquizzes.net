$(function()
{
	var handler = {
		load: function()
		{
			this.element = $('#account-status');
			this.loggedIn = (typeof loggedIn == 'undefined' ? null : loggedIn);

			this.resetLoginForm();

			var d = document, c = 'click', e = '#account-status-error', f = '#login .input-text';
			$(d).on(c, '#login-button', handler.loginButtonClick);
			$(d).on(c, '#login-cancel', handler.resetLoginForm);
			$(d).on(c, '#logout-button', handler.logoutButtonClick);

			PacketHandler.hook(Packet.Login, packetContext(this, 'loginResult'));

			window.loginFormReset = function()
			{
				$(f).css('border', '1px solid #999').css('background-color', 'white');
				$(e).removeClass('form-error form-success form-pending').fadeOut();
			};

			window.loginFormFail = function()
			{
				$(e).addClass('form-error').html('Enter both your username and password.').fadeIn();
				$(f).css('border', '1px solid red').css('background-color', '#EDD3D3');
			};

			window.loginFormComplete = function()
			{
				$(e).addClass('form-pending').html('Authenticating...').fadeIn();
				PacketHandler.send(Packet.Login, {
					user: $('#username-field').val().trim(),
					pass: $('#password-field').val().trim()
				});
			};
		},

		loginButtonClick: function()
		{
			var form = $('<form id="login" class="validatable preventDefault" complete="loginFormComplete" error="loginFormFail" submit="loginFormReset"/>').appendTo(handler.element.empty());

			$('<input type="text" placeholder="Username..." id="username-field" class="input-text" require="true"/>').appendTo(form);
			$('<input type="password" placeholder="Password..." id="password-field" class="input-text" require="true"/>').appendTo(form);
			$('<input type="submit" id="login-submit" value="Login" class="input-button"/>').appendTo(form);
			$('<input type="button" id="login-cancel" value="Cancel" class="input-button"/>').appendTo(form);
			$('<div id="account-status-error"/>').appendTo(form);
		},

		logoutButtonClick: function()
		{
			PacketHandler.send(Packet.Login);
		},

		resetLoginForm: function()
		{
			if (handler.loggedIn != null)
				handler.element.html('You are logged in as ' + handler.loggedIn + '. <a id="logout-button">Logout</a>.');
			else
				handler.element.html('You are currently not logged in: <a id="login-button">login</a> or <a>register</a>.');
		},

		loginResult: function(response)
		{
			if (response.success != undefined && response.success == true)
			{
				handler.loggedIn = response.username;
				handler.resetLoginForm();
			}
			else
			{
				if (response.logout == undefined)
				{
					$('#login .input-text').css('border', '1px solid red').css('background-color', '#EDD3D3');
					$('#account-status-error').removeClass('form-pending').addClass('form-error').html('Invalid username and/or password.').fadeIn();
				}
				else
				{
					handler.loggedIn = null;
					handler.resetLoginForm();
				}
			}
		}
	};

	handler.load();
});