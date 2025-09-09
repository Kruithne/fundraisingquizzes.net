import { createApp } from '/{{cache_bust=static/js/lib/vue.esm.prod.js}}';
import { form_component } from '/{{cache_bust=static/js/lib/flux_client.js}}';
import { document_load, query_api, on_user_presence, get_user_presence, show_toast_success, show_toast_error } from '/{{cache_bust=static/js/client_global.js}}';

const app = createApp({
	data() {
		return {
			loaded: false,
			username: 'Unknown User',
			current_avatar_id: 8,
			available_avatars: [],
			avatar_changing: false,
			avatar_error: null,
			signature_text: '',
			signature_updating: false,
			signature_error: null,
			email_masked: '',
			created_date: null
		}
	},


	methods: {
		async load_user_info() {
			try {
				const response = await query_api('user_get_info');
				if (response.error)
					throw new Error(response.error);
				
				this.username = response.username;
				this.current_avatar_id = response.avatar_id;
				this.email_masked = response.email_masked;
				this.created_date = response.created_date;
				this.signature_text = response.forum_signature || '';
			} catch (e) {
				console.error('Failed to load user info:', e);
				show_toast_error('Failed to load account information');
			}
		},

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
		},

		async update_signature() {
			if (this.signature_updating) return;

			this.signature_updating = true;
			this.signature_error = null;

			try {
				const response = await query_api('user_set_signature', {
					signature: this.signature_text
				});

				if (response.error)
					throw new Error(response.error);

				show_toast_success('Signature updated successfully!');
				
			} catch (e) {
				console.error('Failed to update signature:', e);
				this.signature_error = 'Failed to update signature. Please try again.';
				show_toast_error('Failed to update signature');
			} finally {
				this.signature_updating = false;
			}
		},

		format_date(date_string) {
			if (!date_string) return 'Unknown';
			return new Date(date_string).toLocaleDateString('en-US', {
				year: 'numeric',
				month: 'long', 
				day: 'numeric'
			});
		}
	}
});

document_load().then(async () => {
	const password_change_form = form_component(app, 'password_change_form');

	password_change_form.on('submit_success', data => {
		show_toast_success('Password changed successfully!');
	});

	const state = app.mount('#content-container');

	// Load settings-specific data
	await Promise.all([
		state.load_user_info(),
		state.load_avatars()
	]);
	
	state.loaded = true;
});