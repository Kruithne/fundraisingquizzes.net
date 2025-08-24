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
	if (abs_diff_weeks < 4) {
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