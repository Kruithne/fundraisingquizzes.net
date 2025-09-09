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
} from '/{{cache_bust=static/js/client_global.js}}';

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

			current_user_id: 0,
			current_username: 'Unknown Quizzer',

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

		date_to_input_format(date) {
			if (!date)
				return '';

			const d = new Date(date);
			const year = d.getFullYear();
			const month = String(d.getMonth() + 1).padStart(2, '0');
			const day = String(d.getDate()).padStart(2, '0');
			
			return `${year}/${month}/${day}`;
		},

		input_format_to_date(dateString) {
			if (!dateString) return null;
			const [year, month, day] = dateString.split('/');
			return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
		},

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

		async process_quiz_action(target, options) {
			if (options.confirm && !window.confirm(options.confirm))
				return;

			let response;
			if (options.prompt) {
				response = window.prompt(options.prompt);

				if (response === null)
					return;

				if (options.prompt_max_length && response.length > options.prompt_max_length)
					return show_toast_error(`Please use less than ${options.prompt_max_length} characters`);
			}

			this.is_working = true;
			show_toast_pending(options.pending ?? 'Working, please wait...', false);

			const payload = { id: target.id };

			if (options.prompt)
				payload.text = response;

			const res = await query_api(options.endpoint, payload);

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

		edit_quiz(quiz) {
			// todo: we need to clone the data of this quiz somewhere so if we discard the
			// changes we can substitute them back in (title, charity, closing, description, type, flags)
			quiz.is_editing = true;
		},

		discard_changes(quiz) {
			// Clean up temporary input data
			delete quiz.closing_input;

			// todo: we need to restore the original data of the quiz from whatever
			// we store in edit_quiz() here.

			quiz.is_editing = false;
		},

		async save_quiz(quiz) {
			// Convert the input format back to Date object before saving
			if (quiz.closing_input) {
				quiz.closing = this.input_format_to_date(quiz.closing_input);
				delete quiz.closing_input;
			}

			// todo: we need to submit the changes of the quiz to the server and handle
			// the response from the server.

			quiz.is_editing = false;
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

		async delete_query(quiz, query) {
			await this.process_quiz_action(query, {
				endpoint: 'quiz_delete_query',
				confirm: `Are you sure you want to delete this query by ${query.query_username}? This action cannot be reversed.`,
				pending: `Deleting query...`,
				success: res => {
					quiz.queries.splice(quiz.queries.indexOf(query), 1);
					return `Successfully deleted query by ${query.query_username}`;
				}
			});
		},

		async delete_query_answer(query) {
			await this.process_quiz_action(query, {
				endpoint: 'quiz_delete_query_answer',
				confirm: `Are you sure you want to delete this answer by ${query.answer_username}? This action cannot be reversed.`,
				pending: `Deleting query answer...`,
				success: res => {
					query.answer_text = null;
					query.answer_user_id = null;
					query.answer_username = null;
					return `Successfully deleted query answer by ${query.answer_username}`;
				}
			});
		},

		async toggle_quiz_queries(quiz) {
			quiz.is_showing_queries = !quiz.is_showing_queries

			if (quiz.is_showing_queries && !quiz.queries) {
				const res = await query_api('quiz_queries', { id: quiz.id });
				if (!res.error)
					quiz.queries = res.queries;
			}
		},

		async add_query(quiz) {
			await this.process_quiz_action(quiz, {
				endpoint: 'quiz_add_query',
				prompt: 'Enter your query',
				prompt_max_length: 255,
				pending: `Submitting query for ${quiz.title}...`,
				success: res => {
					(quiz.queries ??= []).push({
						id: res.query_id,
						quiz_id: quiz.id,
						query_user_id: this.current_user_id,
						query_username: this.current_username,
						query_text: res.text,
					});

					quiz.query_count += 1;

					return `Successfully submitted query`
				}
			});
		},

		async add_query_answer(query) {
			await this.process_quiz_action(query, {
				endpoint: 'quiz_add_query_answer',
				prompt: 'Enter your answer',
				prompt_max_length: 255,
				pending: `Submitting query answer...`,
				success: res => {
					query.answer_text = res.text;
					query.answer_user_id = this.current_user_id;
					query.answer_username = this.current_username;

					return `Successfully answered quiz query`;
				}
			});
		},

		async delete_quiz(quiz) {
			await this.process_quiz_action(quiz, {
				endpoint: 'quiz_delete',
				confirm: `Are you sure you want to delete ${quiz.title}? This action cannot be reversed.`,
				pending: `Deleting quiz ${quiz.title}...`,
				success: res => {
					this.quizzes.splice(this.quizzes.indexOf(quiz), 1);
					return `Deleted quiz ${quiz.title}`;
				}
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
					quiz.is_bookmarked = !res.removed;

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
		state.current_user_id = presence.user_id;
		state.current_username = presence.username;

		if (presence.flags & (1 << 2))
			state.is_admin = true;
	});

	query_api('quiz_list').then(data => {
		state.quizzes = data.quizzes;
		state.loaded = true;
	});
});