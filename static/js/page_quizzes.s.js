import { createApp } from '/{{cache_bust=static/js/lib/vue.esm.prod.js}}';

import {
	document_load,
	query_api,
	on_user_presence,
	format_date_relative,
	format_date,
	create_hyperlinks,
	show_toast_pending,
	show_toast_success,
	show_toast_error
} from '/{{cache_bust=static/js/client_global.s.js}}';

const UNIX_SECOND = 1000;
const UNIX_MINUTE = UNIX_SECOND * 60;
const UNIX_HOUR = UNIX_MINUTE * 60;
const UNIX_DAY = UNIX_HOUR * 24;

const MAX_QUIZ_VOTES = 3;

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
	QuizOfTheWeek: 1 << 2,
	IsDeleted: 1 << 3,
	IsAccepted: 1 << 4,
};

const app = createApp({
	data() {
		return {
			is_logged_in: false,
			is_admin: false,
			loaded: true,
			is_working: false,

			QUIZ_TYPES,
			QUIZ_FLAGS,

			quizzes: []
		}
	},

	computed: {
		quizzes_sorted() {
			return [...this.quizzes].sort((a, b) => {
				const a_not_accepted = (a.flags & QUIZ_FLAGS.IsAccepted) === 0;
				const b_not_accepted = (b.flags & QUIZ_FLAGS.IsAccepted) === 0;

				if (a_not_accepted !== b_not_accepted)
					return b_not_accepted - a_not_accepted;
				
				if (a.is_bookmarked !== b.is_bookmarked)
					return b.is_bookmarked - a.is_bookmarked;
				
				const date_a = new Date(a.closing);
				const date_b = new Date(b.closing);
				return date_a.getTime() - date_b.getTime();
			});
		},

		user_vote_count() {
			return this.quizzes.filter(e => e.is_voted).length;
		},

		can_vote() {
			return this.user_vote_count < MAX_QUIZ_VOTES;
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
		},

		is_quiz_closed(quiz) {
			return new Date() > new Date(quiz.closing);
		},

		async process_quiz_action(quiz, options) {
			if (options.confirm && !window.confirm(options.confirm))
				return;

			this.is_working = true;
			show_toast_pending(options.pending ?? 'Working, please wait...', false);

			const res = await query_api(options.endpoint, {
				quiz_id: quiz.id
			});

			if (res.error) {
				show_toast_error(res.error);
			} else {
				if (typeof options.success === 'function')
					show_toast_success(options.success(res));
				else
					show_toast_success(options.success ?? 'Completed successfully!');
			}

			this.is_working = false;
		},

		async approve_quiz(quiz) {
			await this.process_quiz_action(quiz, {
				endpoint: 'quiz_approve',
				pending: `Approving quiz ${quiz.title}...`,
				success: res => {
					quiz.flags |= QUIZ_FLAGS.IsAccepted;
					return `Approved quiz ${quiz.title}`;
				}
			});

		},

		async delete_quiz(quiz) {
			await this.process_quiz_action(quiz, {
				endpoint: 'quiz_delete',
				confirm: `Are you sure you want to delete ${quiz.title}? This action cannot be reversed.`,
				pending: `Deleting quiz ${quiz.title}...`,
				success: `Deleted quiz ${quiz.title}`
			});
		},

		async vote_quiz(quiz) {
			await this.process_quiz_action(quiz, {
				endpoint: 'quiz_vote',
				pending: `Voting for ${quiz.title}...`,
				success: res => {
					quiz.is_voted = true;
					return `Voted for ${quiz.title}`;
				}
			});
		},

		async bookmark_quiz(quiz) {
			await this.process_quiz_action(quiz, {
				endpoint: 'quiz_bookmark',
				pending: `Bookmarking ${quiz.title}...`,
				success: res => {
					if (res.removed)
						return `Removed ${quiz.title} from bookmarks`;

					return `Added ${quiz.title} to bookmarks`;
				}
			});
		}
	}
});

document_load().then(async () => {
	const state = app.mount('#content-container');

	on_user_presence(presence => {
		state.is_logged_in = true;

		if (presence.flags & (1 << 2))
			state.is_admin = true;
	});

	query_api('quiz_list').then(data => {
		state.quizzes = data.quizzes;
		state.loaded = true;
	});
});