$(function()
{
	var handler = {
		load: function()
		{
			this.element = $('#account-status');
			this.loggedIn = loggedIn == undefined ? false : loggedIn;

			if (this.loggedIn)
				this.setContent('You are logged in as NOBODY!');
			else
				this.setContent('You are currently not logged in: login or register.');
		},

		setContent: function(content)
		{
			this.element.html(content);
		}
	};

	handler.load();
});