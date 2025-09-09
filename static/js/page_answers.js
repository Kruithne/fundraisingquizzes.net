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
	show_toast_error,
	render_validation_error
} from '/{{cache_bust=static/js/client_global.js}}';

const UNIX_SECOND = 1000;
const UNIX_MINUTE = UNIX_SECOND * 60;
const UNIX_HOUR = UNIX_MINUTE * 60;
const UNIX_DAY = UNIX_HOUR * 24;

const ANSWER_FLAGS = { // 32-bit
	None: 0,
	IsAccepted: 1 << 0,
	IsDeleted: 1 << 1,
};

const app = createApp({
	data() {
		return {
			is_logged_in: false,
			is_admin: false,
			loaded: false,
			is_working: false,

			current_user_id: 0,
			current_username: 'Unknown User',

			ANSWER_FLAGS,

			answers: [],
			is_submitting_answer: false,
			new_answer: null
		}
	},

	computed: {
		answers_sorted() {
			return [...this.answers].sort((a, b) => {
				const a_not_accepted = (a.flags & ANSWER_FLAGS.IsAccepted) === 0;
				const b_not_accepted = (b.flags & ANSWER_FLAGS.IsAccepted) === 0;

				if (a_not_accepted !== b_not_accepted)
					return b_not_accepted - a_not_accepted;
				
				const date_a = new Date(a.closing);
				const date_b = new Date(b.closing);
				return date_b.getTime() - date_a.getTime(); // Most recent first
			});
		}
	},

	methods: {
		format_date_relative,
		format_date,
		create_hyperlinks,

		getTextWidth(text, className) {
			const spanKey = `measure-${className}`;
			
			let span = document.getElementById(spanKey);
			if (!span) {
				span = document.createElement('span');
				span.id = spanKey;
				span.style.visibility = 'hidden';
				span.style.position = 'absolute';
				span.style.whiteSpace = 'pre';
				span.style.pointerEvents = 'none';
				document.body.appendChild(span);
			}
			
			const refElement = document.querySelector(`.${className} input[type="text"]`);
			if (refElement) {
				const styles = window.getComputedStyle(refElement);
				span.style.font = styles.font;
				span.style.fontSize = styles.fontSize;
				span.style.fontWeight = styles.fontWeight;
				span.style.fontFamily = styles.fontFamily;
			}
			
			span.textContent = text || '';
			return span.offsetWidth;
		},

		getInputWidth(value, placeholder, className) {
			const text = value || placeholder || '';
			const measuredWidth = this.getTextWidth(text, className);
			// Add horizontal padding (12px * 2) + cursor space + slight buffer
			return Math.max(measuredWidth + 24 + 10, 150) + 'px';
		},

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

		is_answer_new(answer) {
			const current_ts = Date.now();
			return (current_ts - answer.created_ts) <= (7 * UNIX_DAY);
		},

		is_answer_updated(answer) {
			const current_ts = Date.now();
			return answer.updated_ts !== answer.created_ts && (current_ts - answer.updated_ts) <= (4 * UNIX_DAY);
		},

		format_answer_text(text) {
			if (!text) return '';
			
			// Convert line breaks to HTML and create hyperlinks
			return create_hyperlinks(text.replace(/\n/g, '<br>'));
		},

		async process_answer_action(target, options) {
			if (options.confirm && !window.confirm(options.confirm))
				return;

			this.is_working = true;
			show_toast_pending(options.pending ?? 'Working, please wait...', false);

			const payload = { id: target.id };

			const res = await query_api(options.endpoint, payload);

			if (res.error) {
				if (res.error === 'generic_validation' && res.field_errors) {
					show_toast_error(render_validation_error(res));
				} else {
					show_toast_error(res.error);
				}
			} else {
				if (typeof options.success === 'function')
					show_toast_success(options.success(res));
				else
					show_toast_success(options.success ?? 'Completed successfully!');
			}

			this.is_working = false;
		},

		edit_answer(answer) {
			answer.original = {
				title: answer.title,
				charity: answer.charity,
				closing: answer.closing,
				answers: answer.answers
			};
			
			answer.closing_input = this.date_to_input_format(answer.closing);
			answer.is_editing = true;
		},

		discard_changes(answer) {
			delete answer.closing_input;

			if (answer.original) {
				answer.title = answer.original.title;
				answer.charity = answer.original.charity;
				answer.closing = answer.original.closing;
				answer.answers = answer.original.answers;
			}

			answer.is_editing = false;
		},

		async save_answer(answer) {
			this.is_working = true;
			show_toast_pending(`Saving changes to ${answer.title}...`, false);

			const payload = {
				fields: {
					id: answer.id,
					title: answer.title,
					charity: answer.charity,
					answers: answer.answers,
					closing: answer.closing_input
				}
			};

			const res = await query_api('answer_edit', payload);

			if (res.error) {
				if (res.error === 'generic_validation' && res.field_errors) {
					show_toast_error(render_validation_error(res));
				} else {
					show_toast_error(res.error);
				}
			} else {
				answer.closing = this.input_format_to_date(answer.closing_input);
				answer.updated_ts = Date.now();
				answer.is_editing = false;
				show_toast_success(`Successfully saved changes to ${answer.title}`);
			}

			this.is_working = false;
		},

		async approve_answer(answer) {
			await this.process_answer_action(answer, {
				endpoint: 'answer_approve',
				pending: `Approving answers for ${answer.title}...`,
				success: res => {
					answer.flags |= ANSWER_FLAGS.IsAccepted;
					return `Approved answers for ${answer.title}`;
				}
			});
		},

		async delete_answer(answer) {
			await this.process_answer_action(answer, {
				endpoint: 'answer_delete',
				confirm: `Are you sure you want to delete the answers for ${answer.title}? This action cannot be reversed.`,
				pending: `Deleting answers for ${answer.title}...`,
				success: res => {
					this.answers.splice(this.answers.indexOf(answer), 1);
					return `Deleted answers for ${answer.title}`;
				}
			});
		},

		start_submit_answer() {
			this.new_answer = {
				title: '',
				charity: '',
				answers: '',
				closing_input: ''
			};

			this.is_submitting_answer = true;
		},

		cancel_submit_answer() {
			this.new_answer = null;
			this.is_submitting_answer = false;
		},

		async submit_answer() {
			this.is_working = true;
			show_toast_pending(`Submitting answers for ${this.new_answer.title}...`, false);

			const payload = {
				fields: {
					title: this.new_answer.title,
					charity: this.new_answer.charity,
					answers: this.new_answer.answers,
					closing: this.new_answer.closing_input
				}
			};

			const res = await query_api('answer_submit', payload);

			if (res.error) {
				if (res.error === 'generic_validation' && res.field_errors) {
					show_toast_error(render_validation_error(res));
				} else {
					show_toast_error(res.error);
				}
			} else {
				const submitted_title = this.new_answer.title;
				this.cancel_submit_answer();
				show_toast_success(`Successfully submitted answers for ${submitted_title}! ${this.is_admin ? 'They are now visible.' : 'They will appear once approved.'}`);
				
				// Refresh the list
				const data = await query_api('answer_list');
				this.answers = data.answers;
			}

			this.is_working = false;
		}
	},

	beforeUnmount() {
		const spans = document.querySelectorAll('[id^="measure-"]');
		spans.forEach(span => span.remove());
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

	query_api('answer_list').then(data => {
		state.answers = data.answers;
		state.loaded = true;
	});
});