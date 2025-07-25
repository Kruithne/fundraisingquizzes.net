import { createApp } from '/{{cache_bust=static/js/lib/vue.esm.prod.js}}';
import { form_component } from '/{{cache_bust=static/js/lib/flux_client.js}}';
import { document_load } from '/{{cache_bust=static/js/client_global.s.js}}';

document_load().then(() => {
	const app = createApp({});
	const register_form = form_component(app, 'register_form');
	const login_form = form_component(app, 'login_form');

	app.mount('#register-container');
});