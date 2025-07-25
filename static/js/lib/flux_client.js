export function create_event_bus() {
	const listeners = new Map();
	
	return {
		on: (event, callback) => {
			const existing_callbacks = listeners.get(event);
			if (existing_callbacks)
				existing_callbacks.add(callback);
			else
				listeners.set(event, new Set([callback]));
		},
		
		once: (event, callback) => {
			const wrapped_callback = (payload) => {
				callback(payload);
				const callbacks = listeners.get(event);
				if (callbacks) {
					callbacks.delete(wrapped_callback);
					if (callbacks.size === 0)
						listeners.delete(event);
				}
			};
			const existing_callbacks = listeners.get(event);
			if (existing_callbacks)
				existing_callbacks.add(wrapped_callback);
			else
				listeners.set(event, new Set([wrapped_callback]));
		},
		
		emit: (event, payload) => {
			const callbacks = listeners.get(event);
			if (callbacks) {
				for (const callback of callbacks)
					callback(payload);
			}
		}
	};
}

const email_regex = /^(?!\.)(?!.*\.\.)([a-z0-9_'+\-\.]*)[a-z0-9_+-]@([a-z0-9][a-z0-9\-]*\.)+[a-z]{2,}$/i;

const default_error_messages = {
	generic_validation: 'There was an issue with one or more fields',
	generic_malformed: 'Malformed request',
	required: 'This field is required',
	invalid_number: 'Must be a valid number',
	number_too_small: 'Must be at least {min}',
	number_too_large: 'Must be no more than {max}',
	number_range: 'Must be between {min} and {max}',
	text_too_small: 'Must be at least {min} characters',
	text_too_large: 'Must not exceed {max} characters',
	text_range: 'Must be between {min} and {max} characters',
	regex_validation: 'Invalid format',
	invalid_email: 'Please enter a valid email address',
	field_match_error: 'The fields do not match'
};

export function form_component(app, container_id) {
	const container_selector = `#${container_id}.fx-form`;
	const component_id = `component_${container_id}`;
	const $container = document.querySelector(container_selector);
	
	if (!$container) {
		console.error(`failed to add ${component_id}, selector ${container_selector} failed`);
		return;
	}
	
	const events = create_event_bus();
	
	app.component(component_id, {
		template: $container.innerHTML ?? '',
		
		data() {
			const state = {};
			const fields = $container.querySelectorAll('.fx-field');
			
			for (const field of fields) {
				state[field.getAttribute('data-fx-field-id')] = {
					has_error: false,
					error: ''
				};
			}

			return {
				state,
				pending: false
			};
		},
		
		methods: {
			set_flow_state(state) {
				const classes = this.$refs.form.classList;
				classes.remove('fx-state-success', 'fx-state-error', 'fx-state-pending');
				classes.add('fx-state-' + state);
				
				this.pending = state === 'pending';
			},

			emit_error(error_obj) {
				this.set_flow_state('error');
				events.emit('submit_failure', error_obj);
			},

			async submit() {
				this.set_flow_state('pending');
				events.emit('submit_pending');
				
				const state = this.state;
				const field_errors = {};

				for (const [field_id, field] of Object.entries(state)) {
					field.has_error = false;

					const $field = this.$refs.form.querySelector(`[data-fx-field-id='${field_id}']`);
					this.validate_field($field, field_id);

					if (field.has_error)
						field_errors[field_id] = field.error;
				}

				if (Object.keys(field_errors).length > 0) {
					return this.emit_error({
						code: 'client_side_validation_error',
						field_errors
					});
				}

				const $form = this.$refs.form;

				const form_data = {};
				
				const endpoint = $form.getAttribute('data-fx-endpoint');

				const form_data_fields = form_data.fields = {};
				const fields = $form.querySelectorAll(`[data-fx-field-id]`);
				
				for (const field of fields) {
					const field_id = field.getAttribute('data-fx-field-id');
					const $input = field.querySelector('.fx-input');
					
					if ($input)
						form_data_fields[field_id] = $input.value;
				}
				
				const $context = $form.querySelector('#fx-context');
				if ($context)
					form_data.context = $context.value;
				
				try {
					const response = await fetch(endpoint, {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json'
						},
						body: JSON.stringify(form_data)
					});
					
					if (response.status !== 200) {
						return this.emit_error({
							code: 'http_error',
							status_text: response.statusText,
							status_code: response.status
						});
					}
					
					const data = await response.json();
					
					if (data.error) {
						if (data.field_errors) {
							for (const field_id in data.field_errors) {
								const state = this.state[field_id];
								if (state) {
									state.has_error = true;
									state.error = this.resolve_error_message(data.field_errors[field_id], field_id);
								}
							}
						}
						
						return this.emit_error({
							code: 'form_error',
							error: this.resolve_error_message(data.error),
							field_errors: data.field_errors
						});
					} else {
						this.set_flow_state('success');
						events.emit('submit_success', data);
					}
				} catch (error) {
					this.emit_error({
						code: 'generic_error',
						error: error.toString()
					});
				}
			},
			
			handle_field_input(field_id) {
				const $field = this.$refs.form.querySelector(`[data-fx-field-id='${field_id}']`);
				if (!$field.classList.contains('fx-error'))
					return;
				
				this.validate_field($field, field_id);
			},
			
			handle_field_blur(field_id) {
				const $field = this.$refs.form.querySelector(`[data-fx-field-id='${field_id}']`);
				this.validate_field($field, field_id);
			},
			
			resolve_custom_error_message(error_code, field_id) {
				const $form = this.$refs.form;
				
				// per-field custom error
				if (field_id) {
					const $field_cst = $form.querySelector(`[data-fx-c-err='${error_code}'][data-fx-c-err-id='${field_id}']`);
					if ($field_cst)
						return $field_cst.value;
				}
				
				// global custom error
				const $global_cst = $form.querySelector(`[data-fx-c-err='${error_code}']:not([data-fx-c-err-id])`);
				if ($global_cst)
					return $global_cst.value;
				
				return default_error_messages[error_code];
			},
			
			resolve_error_message(message, field_id) {
				if (typeof message === 'string')
					return this.resolve_custom_error_message(message, field_id);
				
				let error_message = this.resolve_custom_error_message(message.err, field_id);
				if (message.params) {
					for (const param in message.params)
						error_message = error_message.replace(`{${param}}`, message.params[param]);
				}
				
				return error_message;
			},

			validation_error(err_code, field_id, params) {
				const state = this.state[field_id];
				state.has_error = true;
				state.error = this.resolve_error_message({ err: err_code, params }, field_id);
			},
			
			validate_field($field, field_id) {
				const $input = $field.querySelector('.fx-input');
				
				if (!$field || !$input)
					return;
				
				const state = this.state[field_id];
				if (!state)
					return;
				
				// clear error state
				state.has_error = false;
				state.error = '';		
				
				const value = $input.value?.trim();
				const input_type = $input.getAttribute('type');
				
				// fields are required if fx-v-required is 'true' or undefined
				const field_required = $field.getAttribute('fx-v-required') !== 'false';
				if (field_required && value.length === 0)
					return this.validation_error('required', field_id);
				
				// skip validation for optional empty fields
				if (!field_required && value.length === 0)
					return;
				
				if (input_type === 'number') {
					const min = $field.getAttribute('fx-v-min');
					const max = $field.getAttribute('fx-v-max');
					
					const num_value = parseFloat(value);

					if (isNaN(num_value) && value !== '')
						return this.validation_error('invalid_number', field_id);

					let min_error = min !== null && num_value < parseFloat(min);
					let max_error = max !== null && num_value > parseFloat(max);

					if (min_error && max_error)
						return this.validation_error('number_range', field_id, { min, max });

					if (min_error)
						return this.validation_error('number_too_small', field_id, { min });

					if (max_error)
						return this.validation_error('number_too_large', field_id, { max });
				} else {
					const min = $field.getAttribute('fx-v-min-length');
					const max = $field.getAttribute('fx-v-max-length');

					let min_error = min !== null && value.length < parseInt(min);
					let max_error = max !== null && value.length > parseInt(max);

					if (min_error && max_error)
						return this.validation_error('text_range', field_id, { min, max });
				
					if (min_error)
						return this.validation_error('text_too_small', field_id, { min });

					if (max_error)
						return this.validation_error('text_too_large', field_id, { max });

					if (input_type === 'email' && !email_regex.test(value))
						return this.validation_error('invalid_email', field_id);

					const regex = $field.getAttribute('fx-v-regex');
					if (regex !== null) {
						const regex_pattern = new RegExp(regex);
						if (!regex_pattern.test(value))
							return this.validation_error('regex_validation', field_id);
					}
				}

				// match_field validation
				const match_field = $field.getAttribute('fx-v-match-field');
				if (match_field !== null) {
					const $match_field = this.$refs.form.querySelector(`[data-fx-field-id='${match_field}']`);
					if ($match_field) {
						const $match_input = $match_field.querySelector('.fx-input');
						if ($match_input && $match_input.value?.trim() !== value) {
							this.validation_error('field_match_error', field_id);
							return this.validation_error('field_match_error', match_field);
						} else if ($match_input && $match_input.value?.trim() === value) {
							// clear error on matched field if it was previously in error state
							const match_state = this.state[match_field];
							if (match_state && match_state.has_error && match_state.error === this.resolve_error_message({ err: 'field_match_error' }, match_field)) {
								match_state.has_error = false;
								match_state.error = '';
							}
						}
					}
				}

				// check if this field is the target of another field's match_field
				for (const other_field_id in this.state) {
					if (other_field_id === field_id)
						continue;

					const $other_field = this.$refs.form.querySelector(`[data-fx-field-id='${other_field_id}']`);
					if ($other_field) {
						const other_match_field = $other_field.getAttribute('fx-v-match-field');
						if (other_match_field === field_id) {
							const $other_input = $other_field.querySelector('.fx-input');
							if ($other_input) {
								const other_value = $other_input.value?.trim();
								if (other_value && other_value !== value) {
									this.validation_error('field_match_error', field_id);
									return this.validation_error('field_match_error', other_field_id);
								} else if (other_value === value) {
									// clear error on the other field if it was previously in error state
									const other_state = this.state[other_field_id];
									if (other_state && other_state.has_error && other_state.error === this.resolve_error_message({ err: 'field_match_error' }, other_field_id)) {
										other_state.has_error = false;
										other_state.error = '';
									}
								}
							}
						}
					}
				}
			}
		}
	});
	
	return events;
}