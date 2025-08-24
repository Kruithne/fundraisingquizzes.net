import { createApp } from '/{{cache_bust=static/js/lib/vue.esm.prod.js}}';
import { document_load, query_api, on_user_presence } from '/{{cache_bust=static/js/client_global.s.js}}';

const QUIZ_TYPES = [
	'Miscellaneous',
	'Picture Quiz',
	'Dingbats',
	'Anagrams',
	'Cryptic',
	'Odd Man Out',
	'Homophones',
	'Rhyming',
	'General Knowledge',
	'Story',
	'Ditloids'
];

const app = createApp({
	data() {
		return {
			is_logged_in: false,
			is_admin: false,
			loaded: true,

			QUIZ_TYPES,

			quizzes: []
		}
	}
});

document_load().then(async () => {
	const state = app.mount('#content-container');

	on_user_presence(presence => {
		state.is_logged_in = true;

		if (presence.flags & (3 << 0))
			state.is_admin = true;
	});

	query_api('quiz_list').then(data => {
		state.quizzes = data.quizzes;
		state.loaded = true;
	});
});