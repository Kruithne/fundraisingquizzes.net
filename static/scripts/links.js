$(function()
{
	var handler = {
		halt: false,
		old: [],
		submitting: false,
		load: function()
		{
			var doc = document, click = 'click';

			$(doc)
				.on(click, '.site-link', handler.handleLinkClick)
				.on('fqLogin', function()
				{
					$('.site-link').each(function()
					{
						handler.applyOptions($(this));
					});

					$(doc).on(click, '.site-link li', handler.handleOptionClick);
					$(doc).on(click, '#new-link-button', handler.handleCreateClick);
					$('#new-link-button').show();
				})
				.on('fqLogout', function(){
					$('.site-link .options, #link-new').remove();
					$('#new-link-button').hide();
				});

			PacketHandler.hook(Packet.DeleteSiteLink, packetContext(handler, 'handleDeleteLink'));
			PacketHandler.hook(Packet.EditSiteLink, packetContext(handler, 'handleSave'));
		},

		applyOptions: function(link)
		{
			var options_list = link.find('.options ul');
			if (options_list.length == 0)
			{
				options_list = $('<ul/>');
				options_list.appendTo($('<div class="options"/>"').appendTo(link));
			}

			$('<li class="option-edit"/>').text('Edit').appendTo(options_list);
			$('<li class="option-delete"/>').text('Delete').appendTo(options_list);
		},

		handleOptionClick: function()
		{
			handler.halt = true;
			var t = $(this),
				link = t.parent().parent().parent(),
				type = t.attr('class').split('-')[1],
				id = link.attr('id').split('-')[1];

			console.info(link);

			switch (type)
			{
				case 'edit': handler.editLink(link, id); break;
				case 'delete': handler.deleteLink(link, id); break;
				case 'cancel': handler.cancelEdit(link, id); break;
				case 'save': handler.saveEdit(t, link, id); break;
			}
		},

		handleLinkClick: function()
		{
			var link = $(this);
			if (!handler.halt && !link.hasClass('editing'))
				window.location.href = link.attr('url');
			else
				handler.halt = false;
		},

		editLink: function(link, id)
		{
			link.addClass('editing');

			var header = link.find('h1'),
				header_text = header.text();

			header.html($('<input type="text" class="input-text edit-title" placeholder="Title..."/>').val(header_text));

			var desc = link.find('p'),
				desc_text = desc.text();

			desc.html($('<input type="text" class="input-text edit-desc" placeholder="Description..."/>').val(desc_text));

			$('<input type="text" class="input-text edit-url" placeholder="Website URL..."/>').val(link.attr('url')).insertAfter(header);

			var options = link.find('.options ul').empty();

			$('<li class="option-save">Save Changes</li>').appendTo(options);
			$('<li class="option-cancel">Cancel</li>').appendTo(options);

			handler.old[id] = {
				header: header_text,
				desc: desc_text
			};
		},

		cancelEdit: function(link, id)
		{
			if (handler.submitting)
				return;

			if (id == 'new')
			{
				link.fadeOut(400, function()
				{
					$(this).remove();
				});
				return;
			}

			var old = handler.old[id];
			link.empty().removeClass('editing');

			$('<h1/>').text(old.header).appendTo(link);
			$('<p/>').text(old.desc).appendTo(link);

			handler.applyOptions(link);

			delete old[id];
		},

		saveEdit: function(button, link, id)
		{
			if (handler.submitting)
				return;

			handler.submitting = true;
			button.text('Saving...');

			var data = {
				title: link.find('.edit-title').val().trim(),
				desc: link.find('.edit-desc').val().trim(),
				url: handler.processUrl(link.find('.edit-url').val().trim())
			};

			if (id != 'new')
				data.id = id;

			var callback = $.extend({}, data);
			callback.link = link;
			callback.id = id;

			PacketHandler.send(Packet.EditSiteLink, data, callback);
		},

		handleSave: function(data, callback)
		{
			if (data.success != undefined && data.success == true)
			{
				handler.submitting = false;
				var id = callback.id == 'new' ? data.id : callback.id;

				handler.old[id] = {
					header: callback.title,
					desc: callback.desc
				};

				var link = callback.link;
				link.attr('url', callback.url).attr('id', 'link-' + id);

				handler.cancelEdit(link, id);
			}
		},

		processUrl: function(url)
		{
			return url.match(/^http(s)?:\/\//) ? url : 'http://' + url;
		},

		deleteLink: function(link, id)
		{
			PacketHandler.send(Packet.DeleteSiteLink, {
				id: id
			}, {
				link: link
			})
		},

		handleDeleteLink: function(data, callback)
		{
			if (data.success != undefined && data.success == true)
			{
				callback.link.fadeOut(400, function()
				{
					$(this).remove();
				});
			}
		},

		handleCreateClick: function()
		{
			if ($('#link-new').length == 0)
			{
				var link = $('<div class="module module-padded site-link" id="link-new" url=""><h1></h1><p></p></div>').prependTo($('#link-listing'));
				handler.applyOptions(link);
				handler.editLink(link, 'new');
				link.find('.edit-title').focus();
			}
		}
	};
	handler.load();
});