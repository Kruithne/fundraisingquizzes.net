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