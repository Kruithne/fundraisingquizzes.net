import { createApp } from '/{{cache_bust=static/js/lib/vue.esm.prod.js}}';
import { document_load } from '/{{cache_bust=static/js/client_global.js}}';

document_load().then(() => {
	const app = createApp({
		data() {
			return {
				acc_addr: 'Unknown E-mail Address'
			}
		}
	});

	const state = app.mount('#container');

	const params = new URLSearchParams(window.location.search);
	if (params.has('acc'))
		state.acc_addr = decodeURIComponent(params.get('acc'));
});