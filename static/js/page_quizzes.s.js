import { createApp } from '/{{cache_bust=static/js/lib/vue.esm.prod.js}}';
import { document_load, query_api, on_user_presence, format_date_relative, format_date, create_hyperlinks } from '/{{cache_bust=static/js/client_global.s.js}}';

const UNIX_SECOND = 1000;
const UNIX_MINUTE = UNIX_SECOND * 60;
const UNIX_HOUR = UNIX_MINUTE * 60;
const UNIX_DAY = UNIX_HOUR * 24;

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

const QUIZ_FLAGS = { // 32-bit
	None: 0,
	AnswerPolicyNoAskingAllowed: 1 << 0,
	AnswerPolicyNoAskingBefore: 1 << 1,
	UNUSED_FLAG_1: 1 << 2,
	UNUSED_FLAG_2: 1 << 3,
	IsAccepted: 1 << 4,
};

const app = createApp({
	data() {
		return {
			is_logged_in: false,
			is_admin: false,
			loaded: true,

			QUIZ_TYPES,
			QUIZ_FLAGS,

			quizzes: []
		}
	},

	methods: {
		format_date_relative,
		format_date,
		create_hyperlinks,

		is_quiz_new(quiz) {
			const current_ts = Date.now();
			return (current_ts - quiz.created_ts) <= (7 * UNIX_DAY);
		},

		is_quiz_updated(quiz) {
			const current_ts = Date.now();
			return quiz.updated_ts !== quiz.created_ts && (current_ts - quiz.updated_ts) <= (4 * UNIX_DAY);
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