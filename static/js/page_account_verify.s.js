import { createApp } from '/{{cache_bust=static/js/lib/vue.esm.prod.js}}';
import { document_load, query_api } from '/{{cache_bust=static/js/client_global.s.js}}';

document_load().then(() => {
	const app = createApp({
		data() {
			return {
				digits: ['', '', '', '', ''],
				token: null,
				message: '',
				message_type: '',
				is_submitting: false,
				focus_index: 0
			}
		},

		computed: {
			is_verify_enabled() {
				return this.token && this.digits.every(digit => digit !== '') && !this.is_submitting;
			},

			code() {
				return this.digits.join('');
			},

			has_field_error() {
				return this.message_type === 'error' && this.message.includes('code');
			}
		},

		mounted() {
			const params = new URLSearchParams(window.location.search);
			this.token = params.get('token');

			if (!this.token) {
				this.show_message('Invalid verification link. Please check your email for the correct link.', 'error');
				return;
			}
		},

		methods: {
			handle_digit_input(index, event) {
				const value = event.target.value;
				
				if (!/^[0-9]$/.test(value)) {
					event.target.value = '';
					this.digits[index] = '';
					return;
				}

				this.digits[index] = value;

				if (value && index < this.digits.length - 1) {
					this.$nextTick(() => {
						this.$refs[`digit-${index + 1}`][0]?.focus();
					});
				}

				if (index === this.digits.length - 1 && this.is_verify_enabled)
					this.submit();
			},

			handle_keydown(index, event) {
				if (event.key === 'Backspace' || event.key === 'Delete') {
					if (event.target.value) {
						event.target.value = '';
						this.digits[index] = '';
					} else if (index > 0) {
						this.$nextTick(() => {
							this.$refs[`digit-${index - 1}`][0]?.focus();
						});
					}
				}
			},

			handle_paste(event) {
				event.preventDefault();
				const paste_data = event.clipboardData.getData('text').trim();
				
				if (!/^[0-9]{5}$/.test(paste_data)) {
					this.show_message('Please paste a valid 5-digit code', 'error');
					return;
				}

				for (let i = 0; i < 5; i++)
					this.digits[i] = paste_data[i];
				
				this.submit();
			},

			handle_focus(index) {
				this.focus_index = index;
				this.$nextTick(() => {
					this.$refs[`digit-${index}`][0]?.select();
				});
			},

			async resend_code() {
				if (this.is_submitting || !this.token)
					return;

				this.is_submitting = true;

				const response = await query_api('account_resend_verification', {
					'account_resend_verification_code-token': this.token
				});

				if (response.success) {
					this.show_message('Your verification code has been re-sent, check your inbox!', 'success');
				} else {
					this.show_message(response.error ?? 'Unable to re-send verification code', 'error');
				}

				this.is_submitting = false;
			},

			async submit() {
				if (!this.is_verify_enabled)
					return;

				this.is_submitting = true;
				this.message = '';

				try {
					const response = await query_api('account_verify', {
						'account_verify_form-code': this.code,
						'account_verify_form-token': this.token
					});

					if (response.success) {
						this.show_message('Account verified! Logging you in...', 'success');
						window.location.href = '/';
					} else {
						if (response.field_errors && response.field_errors.code) {
							this.show_message(response.field_errors.code, 'error');
						} else if (response.form_error) {
							this.show_message(response.form_error, 'error');
						} else {
							console.log(response);
							this.show_message('Verification failed. Please try again.', 'error');
						}

						this.is_submitting = false;
					}
				} catch (error) {
					console.error('Verification error:', error);
					this.show_message('Network error. Please try again.', 'error');
					this.is_submitting = false;
				}
			},

			show_message(message, type) {
				this.message = message;
				this.message_type = type;
			}
		}
	});

	app.mount('#verify-container');
});