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