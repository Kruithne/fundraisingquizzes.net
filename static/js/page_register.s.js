import { createApp } from '/{{cache_bust=static/js/lib/vue.esm.prod.js}}';
import { document_load, query_api } from '/{{cache_bust=static/js/client_global.s.js}}';

const register_app = createApp({
	data() {
		return {
			username: '',
			email: '',
			password: '',
			password_confirm: '',
			form_error: null,
			form_success: null,
			form_pending: false,
			errors: {
				username: null,
				email: null,
				password: null,
				password_confirm: null
			}
		}
	},
	methods: {
		validate_field(field) {
			this.errors[field] = null;
			
			switch (field) {
				case 'username':
					if (this.username.length < 4) {
						this.errors.username = 'Username must be at least 4 characters long';
					} else if (!/^[a-zA-Z0-9_]+$/.test(this.username)) {
						this.errors.username = 'Username can only contain letters, numbers and underscores';
					}
					break;
				case 'email':
					if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email)) {
						this.errors.email = 'Please enter a valid email address';
					}
					break;
				case 'password':
					if (this.password.length < 1) {
						this.errors.password = 'Password is required';
					}
					if (this.password_confirm && this.password !== this.password_confirm) {
						this.errors.password_confirm = 'Passwords do not match';
					}
					break;
				case 'password_confirm':
					if (this.password_confirm !== this.password) {
						this.errors.password_confirm = 'Passwords do not match';
					}
					break;
			}
		},
		validate_form() {
			this.validate_field('username');
			this.validate_field('email');
			this.validate_field('password');
			this.validate_field('password_confirm');
			
			return !Object.values(this.errors).some(error => error !== null);
		},
		async submit_form() {
			if (!this.validate_form()) {
				this.form_error = 'Please correct the errors below';
				return;
			}
			
			this.form_pending = true;
			this.form_error = null;
			this.form_success = null;
			
			const result = await query_api('register', {
				username: this.username,
				email: this.email,
				password: this.password,
				password_confirm: this.password_confirm
			});
			
			this.form_pending = false;
			
			if (result.success) {
				this.form_success = 'Account created successfully! You can now login.';
				this.reset_form();
			} else {
				this.form_error = result.error || 'Registration failed. Please try again.';
			}
		},
		reset_form() {
			this.username = '';
			this.email = '';
			this.password = '';
			this.password_confirm = '';
			this.errors = {
				username: null,
				email: null,
				password: null,
				password_confirm: null
			};
			this.form_error = null;
		}
	},
	template: `
		<table id="register-table">
			<tr>
				<td><label>Username:</label></td>
				<td>
					<input 
						type="text" 
						v-model="username"
						@blur="validate_field('username')"
						class="input-text"
						:class="{ 'form-error': errors.username }"
						required
					/>
					<div v-if="errors.username" class="form-error">{{ errors.username }}</div>
				</td>
			</tr>
			<tr>
				<td><label>Email:</label></td>
				<td>
					<input 
						type="email" 
						v-model="email"
						@blur="validate_field('email')"
						class="input-text"
						:class="{ 'form-error': errors.email }"
						required
					/>
					<div v-if="errors.email" class="form-error">{{ errors.email }}</div>
				</td>
			</tr>
			<tr>
				<td><label>Password:</label></td>
				<td>
					<input 
						type="password" 
						v-model="password"
						@blur="validate_field('password')"
						class="input-text"
						:class="{ 'form-error': errors.password }"
						required
					/>
					<div v-if="errors.password" class="form-error">{{ errors.password }}</div>
				</td>
			</tr>
			<tr>
				<td><label>Confirm Password:</label></td>
				<td>
					<input 
						type="password" 
						v-model="password_confirm"
						@blur="validate_field('password_confirm')"
						class="input-text"
						:class="{ 'form-error': errors.password_confirm }"
						required
					/>
					<div v-if="errors.password_confirm" class="form-error">{{ errors.password_confirm }}</div>
				</td>
			</tr>
			<tr>
				<td colspan="2">
					<div v-if="form_error" class="form-error">{{ form_error }}</div>
					<div v-if="form_success" class="form-success">{{ form_success }}</div>
					<div v-if="form_pending" class="form-pending">Creating account...</div>
				</td>
			</tr>
			<tr>
				<td colspan="2">
					<input 
						type="button" 
						value="Register"
						@click="submit_form"
						class="input-button"
						:disabled="form_pending"
					/>
					<input 
						type="button" 
						value="Reset"
						@click="reset_form"
						class="input-button"
					/>
				</td>
			</tr>
		</table>
		<div style="margin-top: 15px;">
			<a href="/recovery">Forgotten your account details? Click here.</a>
		</div>
	`
});

document_load().then(() => {
	const register_mount = document.getElementById('register-app');
	if (register_mount) {
		register_app.mount(register_mount);
	}
});