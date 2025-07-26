import { createApp } from '/{{cache_bust=static/js/lib/vue.esm.prod.js}}';
import { document_load, query_api } from '/{{cache_bust=static/js/client_global.s.js}}';

const user_presence = createApp({
	data() {
		return {
			logged_in: false,
			username: null,
			is_admin: false,
			show_login_form: false,
			login_username: '',
			login_password: '',
			login_error: null,
			login_pending: false
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
		show_login() {
			this.show_login_form = true;
			this.login_error = null;
		},

		hide_login() {
			this.show_login_form = false;
			this.login_username = '';
			this.login_password = '';
			this.login_error = null;
		},

		async submit_login() {
			if (!this.login_username.trim() || !this.login_password.trim()) {
				this.login_error = 'Please enter both username and password';
				return;
			}

			this.login_pending = true;
			this.login_error = null;

			const result = await query_api('login', {
				username: this.login_username,
				password: this.login_password
			});

			this.login_pending = false;

			if (result.success) {
				this.logged_in = true;
				this.username = result.username;
				this.is_admin = result.is_admin || false;
				this.hide_login();
			} else {
				this.login_error = result.error || 'Login failed';
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
		<div v-if="!logged_in && !show_login_form">
			You are currently not logged in: <a @click="show_login" style="cursor: pointer;">login</a> or <a href="/register">register</a>.
		</div>
		<div v-else-if="logged_in">
			You are logged in as {{ username }}. <a @click="logout" style="cursor: pointer;">Logout</a>.
		</div>
		<template v-else>
			<form @submit.prevent="submit_login">
				<input 
					type="text" 
					placeholder="Username..." 
					v-model="login_username"
					required
				/>
				<input 
					type="password" 
					placeholder="Password..." 
					v-model="login_password"
					required
				/>
				<input 
					type="button" 
					value="Login" 
					:disabled="login_pending"
				/>
				<input 
					type="button" 
					value="Cancel" 
					@click="hide_login"
				/>
				<div v-if="login_error" class="form-error" style="margin-left: 10px;">
					{{ login_error }}
				</div>
			</form>
			<div style="margin-left: 10px;">
				<a href="/recovery">Forgotten your account details? Click here.</a>
			</div>
		</template>
	`
});

document_load().then(() => {
	user_presence.mount('#account-status');
});