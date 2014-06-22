$(function()
{
	$.fn.extend({
		setFormMessage: function(msg)
		{
			if (!this.is(':visible'))
				this.slideDown();

			return this.removeClass('form-error form-success form-pending').text(msg);
		},

		setPending: function(msg)
		{
			return this.setFormMessage(msg).addClass('form-pending');
		},

		setSuccess: function(msg)
		{
			return this.setFormMessage(msg).addClass('form-success');
		},

		setError: function(msg)
		{
			return this.setFormMessage(msg).addClass('form-error');
		}
	});
});