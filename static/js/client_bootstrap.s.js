import { createApp } from '/{{cache_bust=static/js/lib/vue.esm.prod.js}}';
import { document_load, query_api } from '/{{cache_bust=static/js/client_global.s.js}}';

const user_presence = createApp({
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
			
			if (result.success) {
				this.logged_in = false;
				this.username = null;
				this.is_admin = false;
			}
		}
	},
	template: `
		<div v-if="!logged_in">
			You are currently not logged in: <a href="/login">login or register</a>.
		</div>
		<div v-else>
			You are logged in as {{ username }}. <a @click="logout" style="cursor: pointer;">Logout</a>.
		</div>
	`
});

document_load().then(() => {
	user_presence.mount('#account-status');
});