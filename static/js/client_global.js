export async function query_api(endpoint, payload = {}, params = {}) {
	try {
		const res = await fetch('/api/' + endpoint, Object.assign({
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(payload)
		}, params));

		if (res.status !== 200)
			return { error: 'Server error, please try again later (' + res.status + ')' };

		return res.json();
	} catch (e) {
		if (e.name === 'AbortError')
			return { error: 'Network request aborted', abort: true };

		console.error(e);
		return { error: 'Network error, please check your internet connection' };
	}
}

export async function document_load() {
	if (document.readyState === 'loading')
		await new Promise(resolve => document.addEventListener('DOMContentLoaded', resolve, { once: true }));
}

export function get_cookies() {
	const cookie_map = new Map();

	for (const cookie of document.cookie.split('; ')) {
		const [key, value] = cookie.split('=');
		cookie_map.set(key, value);
	}
	
	return cookie_map;
}

const url_regex = /https?:\/\/(?:[-\w.])+(?:\:[0-9]+)?(?:\/(?:[\w\/_.])*(?:\?(?:[\w&=%.])*)?(?:\#(?:[\w.])*)?)?/gi;
const email_regex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;

export function nl2br(text) {
	if (typeof text !== 'string')
		return text;
	
	return text.replace(/\r?\n/g, '<br>');
}

export function create_hyperlinks(text) {
	return text
		.replace(url_regex, '<a href="$&" target="_blank">$&</a>')
		.replace(email_regex, '<a href="mailto:$&" target="_blank">$&</a>');
}

// region user presence
let user_presence = null;
let user_presence_callbacks = [];

export function on_user_presence(callback) {
	if (user_presence !== null) {
		callback(user_presence);
		return;
	}

	user_presence_callbacks.push(callback);
}

export function set_user_presence(presence) {
	user_presence = presence;

	for (const callback of user_presence_callbacks)
		callback(presence);

	user_presence_callbacks = [];
}

export function get_user_presence() {
	return user_presence;
}
// endregion

// region dates
export function format_date(date) {
	if (!(date instanceof Date))
		date = new Date(date);

	const day = date.getDate();
	const month = date.toLocaleString('en-GB', { month: 'long' });
	const year = date.getFullYear();

	let ordinal;
	if (day >= 11 && day <= 13) {
		ordinal = 'th';
	} else {
		switch (day % 10) {
			case 1: ordinal = 'st'; break;
			case 2: ordinal = 'nd'; break;
			case 3: ordinal = 'rd'; break;
			default: ordinal = 'th'; break;
		}
	}

	return `${day}${ordinal} ${month} ${year}`;
}

export function format_date_relative(date) {
	if (!(date instanceof Date))
		date = new Date(date);

	const now = new Date();
	const diff_ms = date - now;
	const abs_diff_ms = Math.abs(diff_ms);
	const abs_diff_seconds = Math.floor(abs_diff_ms / 1000);
	const is_future = diff_ms > 0;
	
	if (abs_diff_seconds < 60)
		return is_future ? "in a moment" : "just now";
	
	const abs_diff_minutes = Math.floor(abs_diff_seconds / 60);
	if (abs_diff_minutes < 60) {
		if (is_future)
			return abs_diff_minutes === 1 ? "in 1 minute" : `in ${abs_diff_minutes} minutes`;
		return abs_diff_minutes === 1 ? "1 minute ago" : `${abs_diff_minutes} minutes ago`;
	}
	
	const abs_diff_hours = Math.floor(abs_diff_minutes / 60);
	if (abs_diff_hours < 24) {
		if (is_future)
			return abs_diff_hours === 1 ? "in 1 hour" : `in ${abs_diff_hours} hours`;
		return abs_diff_hours === 1 ? "1 hour ago" : `${abs_diff_hours} hours ago`;
	}
	
	const abs_diff_days = Math.floor(abs_diff_hours / 24);
	if (abs_diff_days < 7) {
		if (is_future)
			return abs_diff_days === 1 ? "in 1 day" : `in ${abs_diff_days} days`;
		return abs_diff_days === 1 ? "1 day ago" : `${abs_diff_days} days ago`;
	}
	
	const abs_diff_weeks = Math.floor(abs_diff_days / 7);
	if (abs_diff_weeks < 8) {
		if (is_future)
			return abs_diff_weeks === 1 ? "in 1 week" : `in ${abs_diff_weeks} weeks`;
		return abs_diff_weeks === 1 ? "1 week ago" : `${abs_diff_weeks} weeks ago`;
	}
	
	const abs_diff_months = Math.floor(abs_diff_days / 30);
	if (abs_diff_months < 12) {
		if (is_future)
			return abs_diff_months === 1 ? "in 1 month" : `in ${abs_diff_months} months`;
		return abs_diff_months === 1 ? "1 month ago" : `${abs_diff_months} months ago`;
	}
	
	const abs_diff_years = Math.floor(abs_diff_days / 365);
	if (is_future)
		return abs_diff_years === 1 ? "in 1 year" : `in ${abs_diff_years} years`;
	return abs_diff_years === 1 ? "1 year ago" : `${abs_diff_years} years ago`;
}
// endregion

// region toast
let toast_auto_hide_timeout = -1;

export function show_toast(text, auto_hide = 3000, style_class = null) {
	const $toast = document.getElementById('toast');
	if ($toast) {
		$toast.style.display = 'flex';
		$toast.setAttribute('data-text', text);
		
		const class_list = $toast.classList;
		class_list.remove('error', 'success', 'pending');
		
		if (style_class)
			class_list.add(style_class);
		
		clearTimeout(toast_auto_hide_timeout);
		
		if (auto_hide)
			toast_auto_hide_timeout = setTimeout(() => hide_toast(), auto_hide);
	}
	
	return $toast;
}

export function hide_toast() {
	const $toast = document.getElementById('toast');
	if ($toast) {
		$toast.style.display = 'none';
		$toast.setAttribute('data-text', '');
		
		clearTimeout(toast_auto_hide_timeout);
	}
}

export function show_toast_error(text, auto_hide) {
	show_toast(text, auto_hide, 'error');
}

export function show_toast_success(text, auto_hide) {
	show_toast(text, auto_hide, 'success');
}

export function show_toast_pending(text, auto_hide) {
	show_toast(text, auto_hide, 'pending');
}
// endregion

// region form validation error rendering
export function render_validation_error(validation_result) {
	// If there's a form-level error message, use that
	if (validation_result.form_error_message)
		return validation_result.form_error_message;

	const field_error_messages = [];
	
	if (validation_result.field_errors) {
		for (const [field_id, field_error] of Object.entries(validation_result.field_errors)) {
			let error_message;
			
			if (typeof field_error === 'string') {
				// Handle string error codes
				error_message = render_error_code(field_error, {});
			} else if (typeof field_error === 'object' && field_error.err) {
				// Handle error objects with parameters
				error_message = render_error_code(field_error.err, field_error.params);
			} else {
				error_message = String(field_error);
			}
			
			// Clean up field ID for display (remove schema prefix if present)
			const clean_field_id = field_id.includes('-') ? field_id.split('-').pop() || field_id : field_id;
			field_error_messages.push(`${clean_field_id}: ${error_message}`);
		}
	}
	
	return field_error_messages.length > 0 
		? field_error_messages.join(', ') 
		: 'Validation failed';
}

function render_error_code(error_code, params) {
	switch (error_code) {
		case 'required':
			return 'This field is required';
		case 'invalid_number':
			return 'Please enter a valid number';
		case 'number_too_small':
			return `Value must be at least ${params.min}`;
		case 'number_too_large':
			return `Value must be at most ${params.max}`;
		case 'number_range':
			return `Value must be between ${params.min} and ${params.max}`;
		case 'text_too_small':
			return `Must be at least ${params.min} characters`;
		case 'text_too_large':
			return `Must be at most ${params.max} characters`;
		case 'text_range':
			return `Must be between ${params.min} and ${params.max} characters`;
		case 'regex_validation':
			return 'Invalid format';
		case 'invalid_email':
			return 'Please enter a valid email address';
		case 'field_match_error':
			return 'Fields do not match';
		case 'generic_validation':
		case 'generic_malformed':
		case 'generic_form_error':
		default:
			return 'Invalid input';
	}
}
// endregion