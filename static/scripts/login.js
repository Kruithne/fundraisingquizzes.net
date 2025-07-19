$(function()
{
	var handler = {
		load: function()
		{
			this.element = $('#account-status');
			this.loggedIn = (typeof loggedIn == 'undefined' ? null : loggedIn);
			this.isAdmin = (typeof isAdmin == 'undefined' ? false : isAdmin);
			this.btt_button = $('#btt_button');

			this.resetLoginForm();

			var d = document, c = 'click', e = '#account-status-error', f = '#login .input-text';
			$(d).on(c, '#login-button', handler.loginButtonClick);
			$(d).on(c, '#login-cancel', handler.resetLoginForm);
			$(d).on(c, '#logout-button', handler.logoutButtonClick);
			$(d).on(c, '#btt_button', function()
			{
				window.scrollTo(0, 0);
			});

			PacketHandler.hook(Packet.Login, packetContext(this, 'loginResult'));

			if (handler.loggedIn != null)
				setTimeout(function() { $(d).trigger('fqLogin'); }, 1);

			window.getLoggedInUser = function()
			{
				return handler.loggedIn;
			};

			window.userIsAdmin = function()
			{
				return handler.isAdmin;
			};

			window.loginFormReset = function()
			{
				$(f).css('border', '1px solid #999').css('background-color', 'white');
				$(e).fadeOut();
			};

			window.loginFormFail = function()
			{
				$(e).setError('Enter both your username and password.').fadeIn();
				$(f).css('border', '1px solid red').css('background-color', '#EDD3D3');
			};

			window.loginFormComplete = function()
			{
				$(e).setPending('Authenticating...').fadeIn();
				PacketHandler.post(Packet.Login, {
					user: $('#username-field').val().trim(),
					pass: $('#password-field').val().trim()
				});
			};

			$(window).scroll(function()
			{
				if (this.scrollY >= 135 && !handler.btt_button.is(':visible'))
					handler.btt_button.stop().fadeIn();
				else if (this.scrollY < 135 && handler.btt_button.is(':visible'))
					handler.btt_button.stop().fadeOut();
			});
		},

		loginButtonClick: function()
		{
			var form = $('<form id="login" class="validatable preventDefault" complete="loginFormComplete" error="loginFormFail" submit="loginFormReset"/>').appendTo(handler.element.empty());

			$('<input type="text" placeholder="Username..." id="username-field" class="input-text" require="true"/>').appendTo(form);
			$('<input type="password" placeholder="Password..." id="password-field" class="input-text" require="true"/>').appendTo(form);
			$('<input type="submit" id="login-submit" value="Login" class="input-button"/>').appendTo(form);
			$('<input type="button" id="login-cancel" value="Cancel" class="input-button"/>').appendTo(form);
			$('<div id="account-status-error"/>').appendTo(form);
			$('<div id="account-recover-link"><a href="recovery.php">Forgotten your account details? Click here.</a></div>').appendTo(form);
		},

		logoutButtonClick: function()
		{
			PacketHandler.post(Packet.Login);
		},

		resetLoginForm: function()
		{
			var option = $('#navigation-settings').hide();

			if (handler.loggedIn != null)
			{
				handler.element.html('You are logged in as ' + handler.loggedIn + '. <a id="logout-button">Logout</a>.');
				option.show();
			}
			else
			{
				handler.element.html('You are currently not logged in: <a id="login-button">login</a> or <a href="register.php">register</a>.');
			}
		},

		loginResult: function(response)
		{
			if (response.success != undefined && response.success == true)
			{
				handler.loggedIn = response.username;
				handler.isAdmin = response.admin;
				handler.resetLoginForm();
				$(document).trigger('fqLogin');
			}
			else
			{
				if (response.logout == undefined)
				{
					var error = response.isBanned == undefined ? 'Invalid username and/or password.' : 'Your account has been banned.';
					$('#login .input-text').css('border', '1px solid red').css('background-color', '#EDD3D3');
					$('#account-status-error').setError(error).fadeIn();
				}
				else
				{
					$(document).trigger('fqLogout');
					handler.loggedIn = null;
					handler.isAdmin = false;
					handler.resetLoginForm();
				}
			}
		}
	};

	handler.load();
});