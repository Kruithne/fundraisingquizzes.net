import { createApp } from '/{{cache_bust=static/js/lib/vue.esm.prod.js}}';
import { document_load, query_api, get_user_presence, show_toast_success, show_toast_error, create_hyperlinks, nl2br } from '/{{cache_bust=static/js/client_global.js}}';

const app = createApp({
	data() {
		return {
			loaded: false,
			topic: null,
			replies: [],
			pagination: {
				current_page: 1,
				total_pages: 1,
				total_replies: 0,
				has_next: false,
				has_prev: false
			},
			current_page: 1,
			replies_per_page: 30,
			topic_id: null,
			reply_form: {
				message: ''
			},
			editing_reply: null,
			submitting_reply: false,
			reply_error: null,
			admin_processing: false,
			user_presence: null
		}
	},

	computed: {
		can_submit_reply() {
			return this.reply_form.message.trim().length >= 1 && !this.submitting_reply;
		},

		submit_button_text() {
			if (this.submitting_reply) {
				return this.editing_reply ? 'Saving...' : 'Posting...';
			}
			return this.editing_reply ? 'Save Edit' : 'Post Reply';
		},

		can_admin() {
			return this.user_presence && (this.user_presence.flags & 4) !== 0; // AdminAccount flag
		}
	},

	methods: {
		async load_replies() {
			if (!this.topic_id) return;

			try {
				const response = await query_api('forum_replies', {
					topic_id: this.topic_id,
					page: this.current_page,
					limit: this.replies_per_page
				});
				
				if (response.error) {
					show_toast_error(response.error);
					return;
				}
				
				this.topic = response.topic;
				this.replies = response.replies.map(reply => ({
					...reply,
					original_text: reply.text,
					text: create_hyperlinks(nl2br(reply.text)),
					like_processing: false,
					delete_processing: false
				}));
				this.pagination = response.pagination;
			} catch (e) {
				console.error('Failed to load replies:', e);
				show_toast_error('Failed to load forum thread');
			}
		},

		async goto_page(page) {
			if (page < 1 || page > this.pagination.total_pages) return;
			if (page === this.current_page) return;

			this.current_page = page;
			await this.load_replies();
			window.scrollTo(0, 0);
		},

		async submit_reply() {
			if (!this.can_submit_reply) return;

			this.submitting_reply = true;
			this.reply_error = null;

			try {
				let response;
				
				if (this.editing_reply) {
					// Edit existing reply
					response = await query_api('forum_reply_edit', {
						fields: {
							reply_id: this.editing_reply.id,
							message: this.reply_form.message.trim()
						}
					});
				} else {
					// Create new reply
					response = await query_api('forum_reply_create', {
						fields: {
							topic_id: this.topic_id,
							message: this.reply_form.message.trim()
						}
					});
				}

				if (response.error) {
					this.reply_error = response.error;
					return;
				}

				if (response.success) {
					show_toast_success(this.editing_reply ? 'Reply updated!' : 'Reply posted!');
					
					if (this.editing_reply) {
						// Update the reply in place
						this.editing_reply.original_text = this.reply_form.message.trim();
						this.editing_reply.text = create_hyperlinks(nl2br(this.reply_form.message.trim()));
						this.editing_reply.updated = new Date().toISOString();
						this.cancel_edit();
					} else {
						this.reply_form.message = '';
						// Go to last page to see new reply
						const last_page = Math.ceil((this.pagination.total_replies + 1) / this.replies_per_page);
						if (last_page !== this.current_page) {
							this.current_page = last_page;
							await this.load_replies();
						} else {
							await this.load_replies();
						}
					}
				} else {
					this.reply_error = 'Failed to submit reply';
				}
			} catch (e) {
				console.error('Failed to submit reply:', e);
				this.reply_error = 'Network error occurred';
			} finally {
				this.submitting_reply = false;
			}
		},

		edit_reply(reply) {
			this.editing_reply = reply;
			this.reply_form.message = reply.original_text;
			this.reply_error = null;
			
			// Scroll to form
			document.querySelector('.reply-form').scrollIntoView({ behavior: 'smooth' });
		},

		cancel_edit() {
			this.editing_reply = null;
			this.reply_form.message = '';
			this.reply_error = null;
		},

		async toggle_like(reply) {
			if (reply.like_processing) return;
			
			reply.like_processing = true;

			try {
				const response = await query_api('forum_reply_like', {
					reply_id: reply.id
				});

				if (response.error) {
					show_toast_error(response.error);
					return;
				}

				if (response.success) {
					reply.user_has_liked = response.liked;
					reply.like_count = response.like_count;
				}
			} catch (e) {
				console.error('Failed to toggle like:', e);
				show_toast_error('Failed to update like');
			} finally {
				reply.like_processing = false;
			}
		},

		async delete_reply(reply) {
			if (reply.delete_processing) return;
			
			if (!confirm('Are you sure you want to delete this reply?')) return;

			reply.delete_processing = true;

			try {
				const response = await query_api('forum_reply_delete', {
					reply_id: reply.id
				});

				if (response.error) {
					show_toast_error(response.error);
					return;
				}

				if (response.success) {
					show_toast_success('Reply deleted');
					await this.load_replies();
				}
			} catch (e) {
				console.error('Failed to delete reply:', e);
				show_toast_error('Failed to delete reply');
			} finally {
				reply.delete_processing = false;
			}
		},

		async toggle_sticky() {
			if (this.admin_processing || !this.topic) return;
			
			this.admin_processing = true;
			const new_sticky = !this.topic.sticky;

			try {
				const response = await query_api('forum_topic_toggle_sticky', {
					topic_id: this.topic.id,
					sticky: new_sticky
				});

				if (response.error) {
					show_toast_error(response.error);
					return;
				}

				if (response.success) {
					this.topic.sticky = response.sticky;
					show_toast_success(response.sticky ? 'Topic pinned' : 'Topic unpinned');
				}
			} catch (e) {
				console.error('Failed to toggle sticky:', e);
				show_toast_error('Failed to update topic');
			} finally {
				this.admin_processing = false;
			}
		},

		async delete_topic() {
			if (this.admin_processing || !this.topic) return;
			
			if (!confirm('Are you sure you want to delete this entire topic and all its replies?')) return;

			this.admin_processing = true;

			try {
				const response = await query_api('forum_topic_delete', {
					topic_id: this.topic.id
				});

				if (response.error) {
					show_toast_error(response.error);
					return;
				}

				if (response.success) {
					show_toast_success('Topic deleted');
					window.location.href = '/forum';
				}
			} catch (e) {
				console.error('Failed to delete topic:', e);
				show_toast_error('Failed to delete topic');
			} finally {
				this.admin_processing = false;
			}
		},

		can_like_reply(reply) {
			return this.user_presence && 
				   reply.poster_id !== this.user_presence.user_id &&
				   !reply.like_processing;
		},

		user_title(flags) {
			if (flags & 2) return 'Banned'; // AccountDisabled flag
			if (flags & 4) return 'Admin';  // Admin flag
			return 'User';
		},

		user_title_class(flags) {
			if (flags & 2) return 'user-title banned';
			if (flags & 4) return 'user-title admin';
			return 'user-title';
		},

		format_date(date_string) {
			const date = new Date(date_string);
			const now = new Date();
			const diff = now - date;

			// Less than a minute
			if (diff < 60000) {
				return 'just now';
			}
			
			// Less than an hour
			if (diff < 3600000) {
				const minutes = Math.floor(diff / 60000);
				return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
			}
			
			// Less than a day
			if (diff < 86400000) {
				const hours = Math.floor(diff / 3600000);
				return `${hours} hour${hours === 1 ? '' : 's'} ago`;
			}
			
			// Less than a week
			if (diff < 604800000) {
				const days = Math.floor(diff / 86400000);
				return `${days} day${days === 1 ? '' : 's'} ago`;
			}
			
			// Format as date
			return date.toLocaleDateString();
		}
	},

	async mounted() {
		await document_load();
		
		// Get user presence for admin checks
		this.user_presence = get_user_presence();
		
		// Get topic ID from URL parameters
		const url_params = new URLSearchParams(window.location.search);
		const topic_id_param = url_params.get('id');
		if (!topic_id_param) {
			show_toast_error('No topic ID provided');
			window.location.href = '/forum';
			return;
		}

		this.topic_id = parseInt(topic_id_param);
		if (isNaN(this.topic_id) || this.topic_id <= 0) {
			show_toast_error('Invalid topic ID');
			window.location.href = '/forum';
			return;
		}

		// Get page from URL parameters
		const page_param = url_params.get('page');
		if (page_param) {
			const page_num = parseInt(page_param);
			if (page_num > 0) {
				this.current_page = page_num;
			}
		}

		await this.load_replies();
		this.loaded = true;
	}
});

app.mount('#content-container');