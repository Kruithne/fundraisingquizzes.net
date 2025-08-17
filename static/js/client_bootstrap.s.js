import { createApp } from '/{{cache_bust=static/js/lib/vue.esm.prod.js}}';
import { document_load, query_api, get_cookies, set_user_presence, on_user_presence } from '/{{cache_bust=static/js/client_global.s.js}}';

const app = createApp({
	data() {
		return {
			logged_in: false,
			username: null,
			is_admin: false
		}
	},

	mounted() {
		this.handle_resize();
		window.addEventListener('resize', this.handle_resize);
	},

	beforeUnmount() {
		window.removeEventListener('resize', this.handle_resize);
	},

	methods: {
		handle_resize() {
			const is_mobile = window.innerWidth < 880;
			const current_parent = this.$el.parentNode;
			const desktop_container = document.getElementById('account-status');
			const mobile_container = document.getElementById('account-status-mobile');
			
			if (is_mobile && current_parent !== mobile_container) {
				mobile_container.appendChild(this.$el);
			} else if (!is_mobile && current_parent !== desktop_container) {
				desktop_container.appendChild(this.$el);
			}
		},

		async logout() {
			const result = await query_api('logout');

			if (result.success)
				location.href = '/';
		}
	},
	template: `
		<div v-if="!logged_in">
			You are currently not logged in: <a href="/login">login or register</a>.
		</div>
		<div v-else>
			You are logged in as {{ username }}  <a @click="logout" style="cursor: pointer;">[Logout]</a>
		</div>
	`
});

function clear_local_session() {
	const session_keys = Object.keys(localStorage).filter(key => key.startsWith('_session'));
	for (const key of session_keys)
		localStorage.removeItem(key);
}

document_load().then(async () => {
	const state = app.mount('#account-status');

	on_user_presence(presence => {
		state.logged_in = true;
		state.username = presence.username;
	});

	try {
		const session_updated = get_cookies().get('session_updated');
		if (typeof session_updated === 'string') {
			if (session_updated === 'EXPIRED') {
				clear_local_session();
				return;
			}

			const session_updated_timestamp = BigInt(session_updated);
			const local_storage_session_updated = localStorage.getItem('_session_updated');
			const local_storage_user_presence = localStorage.getItem('_session_presence');
			
			if (local_storage_session_updated === null || local_storage_user_presence === null || local_storage_session_updated < session_updated_timestamp) {
				const res = await query_api('query_user_presence');

				if (res.error)
					throw new Error(res.error);

				localStorage.setItem('_session_updated', res.session_updated);
				localStorage.setItem('_session_presence', JSON.stringify(res.user_presence));

				set_user_presence(res.user_presence);
			} else if (local_storage_user_presence !== null) {
				set_user_presence(JSON.parse(local_storage_user_presence));
			}
		}
	} catch (e) {
		console.error('failed to start user presence');
		console.error(e);
	}
});