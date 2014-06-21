$(function()
{
	var handler =
	{
		currentSlide: null,
		submitting: false,
		load: function()
		{
			handler.container = $('#recovery-left');
			var click = 'click';
			$(document)
				.on(click, '.recover-email', handler.recoverEmail)
				.on(click, '.recover-password', handler.recoverPassword)
				.on(click, '.recover-username', handler.recoverUsername)
				.on(click, '.recover-both', handler.recoverBoth)
				.on(click, '.input-button', handler.buttonClick);

			PacketHandler.hook(Packet.RecoverAccount, packetContext(handler, 'handleResponse'));
		},

		buttonClick: function()
		{
			var t = $(this),
				p = t.parent(),
				field = p.find('.input-text'),
				value = field.val().trim();

			if (value.length == 0)
			{
				handler.setError(p, "Don't leave the box blank!");
				return;
			}

			handler.submitting = true;
			handler.setPending(field, 'Processing, please wait...');
			PacketHandler.send(Packet.RecoverAccount, {
				type: field.attr('recover'),
				value: value
			},
			{
				parent: p
			});
		},

		handleResponse: function(data, callback)
		{
			var field = callback.parent;
			if (data.success != undefined && data.success == true)
			{
				handler.setSuccess(field, 'E-mail sent, check your inbox! (Check your spam folder)');
				field.children('input').fadeOut();
			}
			else
			{
				if (data.error != undefined)
					handler.setError(field, data.error);
				else
					handler.setError(field, 'Server error, try again later!');
			}
			handler.submitting = false;
		},

		setMessage: function(field, msg)
		{
			return field.find('.error-text').removeClass('form-error form-success form-pending').text(msg);
		},

		setError: function(field, msg)
		{
			handler.setMessage(field, msg).addClass('form-error');
		},

		setSuccess: function(field, msg)
		{
			handler.setMessage(field, msg).addClass('form-success');
		},

		setPending: function(field, msg)
		{
			handler.setMessage(field, msg).addClass('form-pending');
		},

		switchSlide: function(slide)
		{
			if (slide === handler.currentSlide)
				return;

			handler.currentSlide = slide;
			var container = handler.container;
			container.children().fadeOut(400, function()
			{
				var stuff = $(slide).clone().hide().appendTo(container.empty());
				setTimeout(function()
				{
					stuff.fadeIn();
				}, 1);
			});
		},

		recoverEmail: function()
		{
			handler.switchSlide('#recover-email-slide');
		},

		recoverPassword: function()
		{
			handler.switchSlide('#recover-password-slide');
		},

		recoverUsername: function()
		{
			handler.switchSlide('#recover-username-slide');
		},

		recoverBoth: function()
		{
			handler.switchSlide('#recover-both-slide');
		}
	};
	handler.load();
});