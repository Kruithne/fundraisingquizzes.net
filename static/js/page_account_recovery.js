import { createApp } from '/{{cache_bust=static/js/lib/vue.esm.prod.js}}';
import { document_load } from '/{{cache_bust=static/js/client_global.js}}';
import { form_component } from '/{{cache_bust=static/js/lib/flux_client.js}}';

document_load().then(() => {
	const app = createApp({
		data() {
			return {
				recovery_sent: false,
				recovery_address: ''
			}
		}
	});

	const recover_form = form_component(app, 'recover_form');
	const state = app.mount('#recovery-container');

	recover_form.on('submit_success', data=> {
		state.recovery_sent = true;
		state.recovery_address = data.recovery_address;
	});

});