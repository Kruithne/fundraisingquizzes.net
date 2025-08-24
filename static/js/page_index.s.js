import { query_api } from '/{{cache_bust=static/js/client_global.s.js}}';
import { createApp } from '/{{cache_bust=static/js/lib/vue.esm.prod.js}}';

(async () => {
	const state = createApp({
		data() {
			return {
				today_in_history: new Date().toLocaleDateString('en-US', { weekday: 'long' })
			}
		}
	}).mount('#index-container');

	const today = new Date();
	const cache_key = 'fq_today_in_history';
	const date_key = `${today.getDate()}-${today.getMonth()}`;
	
	const cached = localStorage.getItem(cache_key);
	let cached_data = null;
	
	if (cached) {
		try {
			cached_data = JSON.parse(cached);
		} catch (e) {
			localStorage.removeItem(cache_key);
		}
	}
	
	if (cached_data && cached_data.date === date_key) {
		state.today_in_history = cached_data.fact;
	} else {
		const res = await query_api('today_in_history', {
			fields: {
				day: today.getDate(),
				month: today.getMonth()
			}
		});

		if (res.success && res.fact !== null) {
			state.today_in_history = res.fact;
			localStorage.setItem(cache_key, JSON.stringify({
				date: date_key,
				fact: res.fact
			}));
		}
	}
})();