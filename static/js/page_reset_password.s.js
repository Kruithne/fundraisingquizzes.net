import { createApp } from '/{{cache_bust=static/js/lib/vue.esm.prod.js}}';
import { document_load } from '/{{cache_bust=static/js/client_global.s.js}}';
import { form_component } from '/{{cache_bust=static/js/lib/flux_client.js}}';

document_load().then(() => {
	const app = createApp({});

	const reset_form = form_component(app, 'password_reset_form');
	const state = app.mount('#reset-container');

	reset_form.on('submit_success', () => {
		location.href = '/login?reset=true';
	});
});