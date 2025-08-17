import { createApp } from '/{{cache_bust=static/js/lib/vue.esm.prod.js}}';
import { document_load } from '/{{cache_bust=static/js/client_global.s.js}}';

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
			isVerifyEnabled() {
				return this.digits.every(digit => digit !== '') && !this.is_submitting;
			},
			code() {
				return this.digits.join('');
			},
			hasFieldError() {
				return this.message_type === 'error' && this.message.includes('code');
			}
		},
		mounted() {
			this.token = this.getTokenFromURL();

			if (!this.token) {
				this.showMessage('Invalid verification link. Please check your email for the correct link.', 'error');
				return;
			}
		},
		methods: {
			getTokenFromURL() {
				const params = new URLSearchParams(window.location.search);
				return params.get('token');
			},

			handleDigitInput(index, event) {
				const value = event.target.value;
				
				if (!/^[0-9]$/.test(value)) {
					event.target.value = '';
					this.digits[index] = '';
					return;
				}

				this.digits[index] = value;

				if (value && index < this.digits.length - 1) {
					this.$nextTick(() => {
						const nextInput = this.$refs[`digit-${index + 1}`][0];
						if (nextInput) nextInput.focus();
					});
				}

				if (index === this.digits.length - 1 && this.isVerifyEnabled) {
					this.submitVerification();
				}
			},

			handleKeydown(index, event) {
				if (event.key === 'Backspace' || event.key === 'Delete') {
					if (event.target.value) {
						event.target.value = '';
						this.digits[index] = '';
					} else if (index > 0) {
						this.$nextTick(() => {
							const prevInput = this.$refs[`digit-${index - 1}`][0];
							if (prevInput) prevInput.focus();
						});
					}
				}
			},

			handlePaste(event) {
				event.preventDefault();
				const pastedData = event.clipboardData.getData('text').trim();
				
				if (!/^[0-9]{5}$/.test(pastedData)) {
					this.showMessage('Please paste a valid 5-digit code', 'error');
					return;
				}

				for (let i = 0; i < 5; i++) {
					this.digits[i] = pastedData[i];
				}
				
				this.submitVerification();
			},

			handleFocus(index) {
				this.focus_index = index;
				this.$nextTick(() => {
					const input = this.$refs[`digit-${index}`][0];
					if (input) input.select();
				});
			},


			async submitVerification() {
				if (!this.isVerifyEnabled) return;

				this.is_submitting = true;
				this.message = '';

				try {
					const response = await fetch('/api/account_verify', {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json'
						},
						body: JSON.stringify({
							fields: {
								'account_verify_form-code': this.code,
								'account_verify_form-token': this.token
							}
						})
					});

					const result = await response.json();

					if (result.success) {
						this.showMessage('Account verified! Logging you in...', 'success');
						window.location.href = '/';
					} else {
						if (result.field_errors && result.field_errors.code) {
							this.showMessage(result.field_errors.code, 'error');
						} else if (result.form_error) {
							this.showMessage(result.form_error, 'error');
						} else {
							this.showMessage('Verification failed. Please try again.', 'error');
						}

						this.is_submitting = false;
					}
				} catch (error) {
					console.error('Verification error:', error);
					this.showMessage('Network error. Please try again.', 'error');
					this.is_submitting = false;
				}
			},

			showMessage(message, type) {
				this.message = message;
				this.message_type = type;
			}
		}
	});

	app.mount('#verify-container');
});