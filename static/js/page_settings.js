import { createApp } from '/{{cache_bust=static/js/lib/vue.esm.prod.js}}';
import { document_load, query_api, on_user_presence, get_user_presence, show_toast_success, show_toast_error } from '/{{cache_bust=static/js/client_global.js}}';

const app = createApp({
	data() {
		return {
			loaded: false,
			username: 'Unknown User',
			current_avatar_id: 8,
			available_avatars: [],
			avatar_changing: false,
			avatar_error: null
		}
	},

	methods: {
		async load_avatars() {
			try {
				const response = await query_api('query_avatars');
				if (response.error) {
					throw new Error(response.error);
				}
				this.available_avatars = response.avatars;
			} catch (e) {
				console.error('Failed to load avatars:', e);
				show_toast_error('Failed to load avatars');
			}
		},

		async select_avatar(avatar_id) {
			if (this.avatar_changing || avatar_id === this.current_avatar_id) {
				return;
			}

			this.avatar_changing = true;
			this.avatar_error = null;

			try {
				const response = await query_api('user_set_avatar', {
					avatar_id: avatar_id
				});

				if (response.error)
					throw new Error(response.error);

				this.current_avatar_id = avatar_id;
				show_toast_success('Avatar changed successfully!');
				
			} catch (e) {
				console.error('Failed to change avatar:', e);
				this.avatar_error = 'Failed to change avatar. Please try again.';
				show_toast_error('Failed to change avatar');
			} finally {
				this.avatar_changing = false;
			}
		}
	}
});

document_load().then(async () => {
	const state = app.mount('#content-container');

	on_user_presence(presence => {
		state.username = presence.username;
		state.current_avatar_id = presence.avatar_id;
	});

	const current_presence = get_user_presence();
	if (current_presence) {
		state.username = current_presence.username;
		state.current_avatar_id = current_presence.avatar_id;
	}

	await state.load_avatars();
	state.loaded = true;
});