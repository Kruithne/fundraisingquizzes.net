import { createApp } from '/{{cache_bust=static/js/lib/vue.esm.prod.js}}';
import { form_component } from '/{{cache_bust=static/js/lib/flux_client.js}}';
import { document_load } from '/{{cache_bust=static/js/client_global.s.js}}';

document_load().then(() => {
	const app = createApp({
		data() {
			return {
				password_reset: false
			}
		}
	});

	const register_form = form_component(app, 'register_form');
	const login_form = form_component(app, 'login_form');

	register_form.on('submit_success', data => {
		location.href = '/verify-account?token=' + data.verify_token;
	});

	login_form.on('submit_success', data => {
		location.href = data.needs_verify ? '/verify-account?token=' + data.needs_verify : '/';
	});

	const state = app.mount('#login-container');

	const params = new URLSearchParams(window.location.search);
	if (params.has('reset'))
		state.password_reset = true;
});