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

	const params = new URLSearchParams(window.location.search);

	register_form.on('submit_success', data => {
		location.href = '/verify-account?token=' + data.verify_token;
	});

	login_form.on('submit_success', data => {
		if (data.needs_verify)
			return location.href = '/verify-account?token' + data.needs_verify;

		if (data.require_reset)
			return location.href = '/account-migration?acc=' + encodeURIComponent(data.account_addr);

		const referrer = url_params.get('referrer');
		if (referrer !== null)
			return location.href = location.origin + referrer;
		
		if (document.referrer?.startsWith(location.origin))
			return location.href = document.referrer;

		location.href = '/';
	});

	const state = app.mount('#login-container');

	if (params.has('reset'))
		state.password_reset = true;
});