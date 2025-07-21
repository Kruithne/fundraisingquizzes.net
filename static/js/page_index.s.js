import { query_api } from '/{{cache_bust=static/js/client_global.s.js}}';
import { createApp } from '/{{cache_bust=static/js/lib/vue.esm.prod.js}}';

(async () => {
	const state = createApp({
		data() {
			return {
				today_in_history: 'Placeholder'
			}
		}
	}).mount('#container');

	const today = new Date();
	const res = await query_api('today_in_history', {
		day: today.getDate(),
		month: today.getMonth()
	});

	if (res.success && res.fact !== null)
		state.today_in_history = res.fact;
})();