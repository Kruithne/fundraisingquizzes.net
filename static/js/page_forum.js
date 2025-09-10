import { createApp } from '/{{cache_bust=static/js/lib/vue.esm.prod.js}}';
import { document_load, query_api, get_user_presence, show_toast_success, show_toast_error } from '/{{cache_bust=static/js/client_global.js}}';

const app = createApp({
	data() {
		return {
			loaded: false,
			topics: [],
			pagination: {
				current_page: 1,
				total_pages: 1,
				total_topics: 0,
				has_next: false,
				has_prev: false
			},
			current_page: 1,
			topics_per_page: 30,
			new_topic: {
				title: '',
				message: ''
			},
			creating_topic: false,
			topic_error: null
		}
	},

	computed: {
		can_create_topic() {
			return this.new_topic.title.trim().length >= 3 && 
				   this.new_topic.message.trim().length >= 1 &&
				   !this.creating_topic;
		}
	},

	methods: {
		async load_topics() {
			try {
				const response = await query_api('forum_topics', {
					page: this.current_page,
					limit: this.topics_per_page
				});
				
				if (response.error) {
					show_toast_error(response.error);
					return;
				}
				
				this.topics = response.topics;
				this.pagination = response.pagination;
			} catch (e) {
				console.error('Failed to load topics:', e);
				show_toast_error('Failed to load forum topics');
			}
		},

		async goto_page(page) {
			if (page < 1 || page > this.pagination.total_pages) return;
			if (page === this.current_page) return;

			this.current_page = page;
			await this.load_topics();
			window.scrollTo(0, 0);
		},

		goto_thread(topic_id) {
			window.location.href = `/forum/thread?id=${topic_id}`;
		},

		async create_topic() {
			if (!this.can_create_topic) return;

			this.creating_topic = true;
			this.topic_error = null;

			try {
				const response = await query_api('forum_topic_create', {
					fields: {
						title: this.new_topic.title.trim(),
						message: this.new_topic.message.trim()
					}
				});

				if (response.error) {
					this.topic_error = response.error;
					return;
				}

				if (response.success) {
					show_toast_success('Topic created successfully!');
					this.new_topic.title = '';
					this.new_topic.message = '';
					
					// Go to the new topic
					window.location.href = `/forum/thread?id=${response.topic_id}`;
				} else {
					this.topic_error = 'Failed to create topic';
				}
			} catch (e) {
				console.error('Failed to create topic:', e);
				this.topic_error = 'Network error occurred';
			} finally {
				this.creating_topic = false;
			}
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
		
		// Get page from URL parameters
		const url_params = new URLSearchParams(window.location.search);
		const page_param = url_params.get('page');
		if (page_param) {
			const page_num = parseInt(page_param);
			if (page_num > 0) {
				this.current_page = page_num;
			}
		}

		await this.load_topics();
		this.loaded = true;
	}
});

app.mount('#content-container');