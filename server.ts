import { http_serve, caution, cache_bust, log, HTTP_STATUS_CODE, cache_http, parse_template, HTTP_STATUS_TEXT, http_apply_range } from 'spooder';
import { form_validate_req, form_create_schema, form_render_html } from './server/flux';
import { post_worker_message } from './server/worker_base';
import path from 'node:path';
import { db } from './server/db';

type BunFile = ReturnType<typeof Bun.file>;

// region bootstrap
const server = http_serve(Number(process.env.SERVER_PORT), process.env.SERVER_LISTEN_HOST);
// endregion

// region form schema
const schema_today_in_history = form_create_schema({
	fields: {
		month: { type: 'number', min: 0, max: 11 },
		day: { type: 'number', min: 1, max: 31 }
	}
});

const schema_register = form_create_schema({
	id: 'register_form',
	endpoint: '/api/register',
	fields: {
		username: {
			type: 'text',
			label: 'Choose a username:',
			max_length: 20,
			min_length: 3,
			regex: '^[a-zA-Z0-9]+$'
		},
		
		email: {
			type: 'email',
			label: 'Enter your e-mail address:'
		},
		
		password: {
			type: 'password',
			label: 'Choose a strong password:'
		},
		
		password_confirm: {
			type: 'password',
			match_field: 'password',
			label: 'Re-type your password again:'
		}
	},
	
	buttons: {
		submit: {
			text: 'Register',
			pending_text: 'Registering...'
		}
	}
});

const schema_login = form_create_schema({
	id: 'login_form',
	endpoint: '/api/login',
	fields: {
		username: {
			type: 'text',
			label: 'Username or E-mail:',
			max_length: 254
		},
		
		password: {
			type: 'password',
			label: 'Password:'
		}
	},
	
	buttons: {
		submit: {
			text: 'Login',
			pending_text: 'Logging in...'
		}
	}
});

const schema_account_verify = form_create_schema({
	fields: {
		code: {
			type: 'text',
			label: 'Verification Code:',
			max_length: 5,
			min_length: 5,
			regex: '^[0-9]{5}$'
		},
		token: {
			type: 'text',
			max_length: 16,
			min_length: 16,
			regex: '^[a-f0-9]{16}$'
		}
	}
});

const schema_account_resend_verification_code = form_create_schema({
	fields: {
		token: {
			type: 'text',
			regex: '^[a-f0-9]{16}$'
		}
	}
});
// endregion

// region mail
const mail_worker_outgoing = new Worker('./server/worker_mail_outgoing.ts');

export function mail_queue_template(template_id: string, recipients: string[], replacements?: Record<string, string>, sender_id?: number) {
	post_worker_message(mail_worker_outgoing, 'queue_mail', {
		template_id, recipients, replacements, sender_id
	});
}
// endregion

// region cookies
type CookieOptions = {
	same_site?: 'Strict' | 'Lax' | 'None',
	secure?: boolean,
	http_only?: boolean,
	path?: string,
	expires?: number,
	encode?: boolean,
	max_age?: number
};

function set_cookie(res: Response, name: string, value: string, options?: CookieOptions): void {
	let cookie = name + '=';
	if (options !== undefined) {
		cookie += options.encode ? encodeURIComponent(value) : value;
		
		if (options.same_site !== undefined)
			cookie += '; SameSite=' + options.same_site;
		
		if (options.secure)
			cookie += '; Secure';
		
		if (options.http_only)
			cookie += '; HttpOnly';
		
		if (options.path !== undefined)
			cookie += '; Path=' + options.path;
		
		if (options.expires !== undefined) {
			const date = new Date(Date.now() + options.expires);
			cookie += '; Expires=' + date.toUTCString();
		}
		
		if (options.max_age !== undefined)
			cookie += '; Max-Age=' + options.max_age;
	} else {
		cookie += value;
	}
	
	res.headers.append('Set-Cookie', cookie);
}

function get_cookies(source: Request | Response, decode: boolean = false): Record<string, string> {
	const parsed_cookies: Record<string, string> = {};
	const cookie_header = source.headers.get('cookie');

	if (cookie_header !== null) {
		const cookies = cookie_header.split('; ');
		for (const cookie of cookies) {
			const [name, value] = cookie.split('=');
			parsed_cookies[name] = decode ? decodeURIComponent(value) : value;
		}
	}

	return parsed_cookies;
}

function set_response_cookie(response: Response, name: string, value: any, http_only = true, max_age = 315360000000) {
	set_cookie(response, name, value, {
		path: '/',
		http_only,
		max_age,
		secure: true
	});
	
	return response;
}

function delete_response_cookie(response: Response, name: string, http_only = true) {
	set_response_cookie(response, name, '', http_only, 0);
	return response;
}
// endregion

// region users
enum UserAccountFlags { // 32-bit
	None = 0,
	AccountVerified = 1 << 0,
	AccountDisabled = 2 << 0,
	AdminAccount = 3 << 0
};

enum SendVerificationCodeResponse {
	Success,
	Error,
	Throttled
};

export type user_session = {
	session_id: string;
	last_access: number;
	user_id: number;
	flags: number;
	user_updated_timestamp: number;
};

export const user_session_cache = new Map<string, user_session>();

async function user_session_id_exists(session_id: string): Promise<boolean> {
	if (user_session_cache.has(session_id))
		return true;
	
	return db.exists('SELECT 1 FROM `user_sessions` WHERE `session_id` = ?', session_id);
}

async function user_generate_session_id(): Promise<string> {
	const new_session_id = crypto.randomUUID();
	
	if (await user_session_id_exists(new_session_id))
		return crypto.randomUUID();
	
	return new_session_id;
}

async function user_end_session(session_id: string): Promise<void> {
	user_session_cache.delete(session_id);
	await db.execute('DELETE FROM `user_sessions` WHERE `session_id` = ?', session_id);
}

export async function user_start_session(user_id: number): Promise<user_session> {
	const session_id = await user_generate_session_id();
	const current_timestamp = Date.now();
	
	await db.insert_object('user_sessions', {
		session_id,
		user_id,
		user_updated_timestamp: current_timestamp
	});
	
	const user_row = await db.get_single('SELECT `flags` FROM `users` WHERE `id` = ? LIMIT 1', user_id);
	
	const session = {
		session_id,
		user_id,
		flags: user_row?.flags ?? 0,
		last_access: current_timestamp,
		user_updated_timestamp: current_timestamp
	};
	
	user_session_cache.set(session_id, session);
	
	log('started session {%s} for user {%s}', session_id, user_id);
	
	return session;
}

async function user_get_session(session_id: string): Promise<user_session|null> {
	if (session_id === null)
		return null;
	
	const session = user_session_cache.get(session_id);
	if (session !== undefined) {
		session.last_access = Date.now();
		return session;
	}
	
	const session_row = await db.get_single('SELECT `user_id`, `user_updated_timestamp` FROM `user_sessions` WHERE `session_id` = ? LIMIT 1', session_id);
	if (session_row) {
		const user_row = await db.get_single('SELECT `flags` FROM `users` WHERE `id` = ? LIMIT 1', session_row.user_id);
		
		log('restored session {%s} for user {%s}', session_id, session_row.user_id);
		const db_session: user_session = {
			session_id,
			user_id: session_row.user_id,
			flags: user_row?.flags ?? 0,
			user_updated_timestamp: session_row.user_updated_timestamp,
			last_access: Date.now()
		};
		
		user_session_cache.set(session_id, db_session);
		return db_session;
	}
	
	return null;
}

async function user_is_username_registered(username: string): Promise<boolean> {
	return await db.exists('SELECT 1 FROM `users` WHERE LOWER(`username`) = ? LIMIT 1', username.toLowerCase());
}

async function user_is_email_registered(email: string): Promise<boolean> {
	return await db.exists('SELECT 1 FROM `users` WHERE `email` = ? LIMIT 1', email.toLowerCase());
}

async function user_create(username: string, email: string, password: string): Promise<number> {
	const user_id = await db.insert_object('users', {
		username,
		email,
		password: await Bun.password.hash(password)
	});
	
	return user_id;
}

async function user_is_verification_token_used(token: string): Promise<boolean> {
	return await db.exists('SELECT 1 FROM `user_verify_codes` WHERE `token` = ?', token);
}

async function user_get_verification_token(token: string) {
	return await db.get_single('SELECT * FROM `user_verify_codes` WHERE `token` = ? LIMIT 1', token) ;
}

async function user_send_verification_code(verify_token: string, force = false): Promise<SendVerificationCodeResponse> {
	const token = await user_get_verification_token(verify_token);
	if (!token) {
		caution('send_verification_code cannot find token', { verify_token });
		return SendVerificationCodeResponse.Error;
	}
	
	// verification codes can only be sent every 5 minutes.
	const timestamp = Date.now();
	if (!force && timestamp - token.last_sent < 300000)
		return SendVerificationCodeResponse.Throttled;
	
	await db.execute('UPDATE `user_verify_codes` SET `last_sent` = ? WHERE `token` = ? LIMIT 1', timestamp, verify_token);
	
	const user_row = await db.get_single('SELECT `email` FROM `users` WHERE `id` = ? LIMIT 1', token.user_id);
	if (user_row === null)
		return SendVerificationCodeResponse.Error;
	
	mail_queue_template('account_verify_code', [user_row.email], {
		verify_code: token.code,
		verify_token: token.token
	});
	
	return SendVerificationCodeResponse.Success;
}

function generate_verification_token(): string {
	return [...Array(16)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
}

function generate_verification_code(): string {
	return (Math.floor(Math.random() * 55565) + 10000).toString();
}
// endregion

// region api factory
type JSONRequestHandler = Parameters<typeof server.json>[1];

type SessionRequestHandler<RequireSession extends boolean> = RequireSession extends true
? (...args: [...Parameters<JSONRequestHandler>, session: user_session]) => ReturnType<JSONRequestHandler>
: (...args: [...Parameters<JSONRequestHandler>, session: user_session | null]) => ReturnType<JSONRequestHandler>;

function register_session_endpoint(
	id: string, 
	handler: SessionRequestHandler<true>, 
	require_session: true
): void;

function register_session_endpoint(
	id: string, 
	handler: SessionRequestHandler<false>, 
	require_session?: false
): void;

function register_session_endpoint(id: string, handler: SessionRequestHandler<boolean>, require_session = false): void{
	server.json(id, async (req, url, json) => {
		const user_session_id = get_cookies(req).session_id ?? null;
		const user_session = await user_get_session(user_session_id);

		if (require_session && user_session === null)
			return HTTP_STATUS_CODE.Unauthorized_401;

		return handler(req, url, json, user_session as any);
	});
}

function register_throttled_endpoint(id: string, handler: JSONRequestHandler) {
	server.json(id, async (req, url, json) => {
		await new Promise(resolve => setTimeout(resolve, 1000));
		server.allow_slow_request(req);

		return await handler(req, url, json);
	});
}
// endregion

// region api
server.json('/api/today_in_history', async (req, url, json) => {
	const validate = form_validate_req(schema_today_in_history, json);
	if (validate.error)
		return validate;
	
	const result = await db.get_single(
		'SELECT `text` FROM `today_in_history` WHERE `month` = ? AND `day` = ?',
		validate.fields.month, validate.fields.day
	);
	
	return {
		success: true,
		fact: result?.text ?? null
	};
});

register_session_endpoint('/api/query_user_presence', async (req, url, json, session) => {
	const user_info = await db.get_single('SELECT `username` FROM `users` WHERE `id` = ? LIMIT 1', session.user_id);
	if (user_info === null)
		caution('query_user_presence called on unknown user', { json, session });

	return {
		user_presence: {
			username: user_info?.username,
			user_id: session.user_id,
			flags: session.flags
		},
		session_updated: session.user_updated_timestamp
	};
}, true);

register_throttled_endpoint('/api/register', async (req, url, json) => {
	const form = form_validate_req(schema_register, json);
	if (form.error)
		return form;
	
	if (await user_is_username_registered(form.fields.username))
		return form.raise_field_error('username', 'That username is already taken');
	
	const user_email = form.fields.email.toLowerCase();
	if (await user_is_email_registered(user_email))
		return form.raise_field_error('email', 'That e-mail address is already registered');
	
	const user_id = await user_create(form.fields.username, user_email, form.fields.password);
	if (user_id === -1) // caution will be raised internally
	return form.raise_form_error('Internal server error - try again later!');
	
	let verify_token = null;
	const verify_code = generate_verification_code();
	
	while (verify_token === null) {
		const generated_token = generate_verification_token();
		
		if (!(await user_is_verification_token_used(generated_token)))
			verify_token = generated_token;
	}
	
	const res = await db.insert_object('user_verify_codes', {
		token: verify_token,
		code: verify_code,
		user_id: user_id,
		last_sent: Date.now()
	});
	
	if (res === -1) // caution will be raised internally
	return form.raise_form_error('Internal server error - try again later!');
	
	log('registered new user account {%s} with user id {%s}', user_email, user_id);
	
	user_send_verification_code(verify_token, true);
	
	return { verify_token, flux_disable: true };
});

register_throttled_endpoint('/api/account_resend_verification', async (req, url, json) => {
	const form = form_validate_req(schema_account_resend_verification_code, json);
	if (form.error)
		return form;

	const result = await user_send_verification_code(form.fields.token, false);
	if (result === SendVerificationCodeResponse.Throttled)
		return { error: 'A code was recently sent, please wait before sending another' };

	if (result === SendVerificationCodeResponse.Success)
		return { success: true };

	return { error: 'Unable to re-send verification code' };
});

register_throttled_endpoint('/api/account_verify', async (req, url, json) => {
	const form = form_validate_req(schema_account_verify, json);
	if (form.error)
		return form;
	
	const verify_record = await user_get_verification_token(form.fields.token);
	if (!verify_record)
		return form.raise_form_error('Invalid or expired verification token');
	
	if (verify_record.code !== form.fields.code)
		return form.raise_field_error('code', 'Invalid verification code');
	
	await db.execute('DELETE FROM `user_verify_codes` WHERE `token` = ? LIMIT 1', form.fields.token);
	
	const current_user = await db.get_single('SELECT `flags` FROM `users` WHERE `id` = ? LIMIT 1', verify_record.user_id);
	if (!current_user)
		return form.raise_form_error('User account not found');
	
	const new_flags = current_user.flags | UserAccountFlags.AccountVerified;
	await db.execute('UPDATE `users` SET `flags` = ? WHERE `id` = ? LIMIT 1', new_flags, verify_record.user_id);
	
	log('verified user account with user id {%s}', verify_record.user_id);

	const response = Response.json({ success: true });
	const session = await user_start_session(verify_record.user_id);
	
	set_response_cookie(response, 'session_id', session.session_id);
	set_response_cookie(response, 'session_updated', session.user_updated_timestamp, false);
	
	return response;
});

register_session_endpoint('/api/logout', async (req, url, json, session) => {
	const response = Response.json({ success: true });

	if (session) {
		await user_end_session(session.session_id);
		delete_response_cookie(response, 'session_id');
		set_response_cookie(response, 'session_updated', 'EXPIRED', false);

		log(`logged out user {${session.user_id}} session {${session.session_id}}`);
	}

	return response;
}, false);

register_throttled_endpoint('/api/login', async (req, url, json) => {
	const form = form_validate_req(schema_login, json);
	if (form.error)
		return form;
	
	const identifier = form.fields.username;
	const is_email_login = identifier.includes('@');
	
	let user_data;
	if (is_email_login) {
		user_data = await db.get_single(
			'SELECT `id`, `flags`, `password` FROM `users` WHERE `email` = ? LIMIT 1',
			identifier.toLowerCase()
		);
	} else {
		user_data = await db.get_single(
			'SELECT `id`, `flags`, `password` FROM `users` WHERE LOWER(`username`) = ? LIMIT 1',
			identifier.toLowerCase()
		);
	}
	
	if (!user_data)
		return form.raise_field_error('username', 'Invalid username or password');
	
	const password_valid = await Bun.password.verify(form.fields.password, user_data.password);
	if (!password_valid)
		return form.raise_field_error('password', 'Invalid username or password');
	
	if (user_data.flags & UserAccountFlags.AccountDisabled)
		return form.raise_form_error('Account is disabled');
	
	const result: Record<string, any> = { success: true, flux_disable: true };
	
	if (!(user_data.flags & UserAccountFlags.AccountVerified)) {
		const verify_token = await db.get_single(
			'SELECT `token` FROM `user_verify_codes` WHERE `user_id` = ? LIMIT 1',
			user_data.id
		);
		
		if (verify_token) {
			result.needs_verify = verify_token.token;
			return result;
		}
	}
	
	const response = Response.json(result);
	const session = await user_start_session(user_data.id);
	
	set_response_cookie(response, 'session_id', session.session_id);
	set_response_cookie(response, 'session_updated', session.user_updated_timestamp, false);
	
	return response;
});
// endregion

// region routes
type RouteOptions = {
	content: BunFile;
	subs: Record<string, any>;
	require_auth?: boolean;
};

const routes: Record<string, RouteOptions> = {
	'/': {
		content: Bun.file('./html/index.html'),
		subs: {
			title: 'Homepage',
			scripts: cache_bust(['static/js/page_index.s.js']),
			stylesheets: cache_bust(['static/css/landing.css'])
		}
	},
	
	'/links': {
		content: Bun.file('./html/links.html'),
		subs: {
			title: 'Links',
			scripts: [],
			stylesheets: cache_bust(['static/css/links.css']),
			links: async () => db.get_all('SELECT * FROM `links`')
		}
	},
	
	'/login': {
		content: Bun.file('./html/login.html'),
		subs: {
			title: 'Login',
			scripts: cache_bust(['static/js/page_login.s.js']),
			stylesheets: cache_bust(['static/css/login.css']),
			register_form: () => form_render_html(schema_register),
			login_form: () => form_render_html(schema_login)
		}
	},
	
	'/verify-account': {
		content: Bun.file('./html/verify-account.html'),
		subs: {
			title: 'Account Verification',
			scripts: cache_bust(['static/js/page_account_verify.s.js']),
			stylesheets: cache_bust(['static/css/login.css'])
		}
	}
}

function sub_table_merge(target: Record<string, any>, ...sources: (Record<string, any> | undefined | null)[]): Record<string, any> {
	const result = { ...target };
	
	for (const source of sources) {
		if (source == null)
			continue;
		
		for (const key in source) {
			if (source.hasOwnProperty(key)) {
				const sourceValue = source[key];
				const targetValue = result[key];
				
				if (Array.isArray(targetValue) && Array.isArray(sourceValue))
					result[key] = [...targetValue, ...sourceValue];
				else
					result[key] = sourceValue;
			}
		}
	}
	
	return result;
}

function is_bun_file(obj: any): obj is BunFile {
	return obj.constructor === Blob;
}

async function resolve_bootstrap_content(content: string | BunFile): Promise<string> {
	if (is_bun_file(content))
		return await content.text();

	return content;
}

(async () => {
	let cache_bust_subs: Record<string, any> = {
		cache_bust
	};
	
	const global_sub_table = sub_table_merge(cache_bust_subs, {
		scripts: cache_bust(['static/js/client_bootstrap.s.js'])
	});

	let cache = process.env.SPOODER_ENV === 'dev' ? undefined : cache_http({
		ttl: 5 * 60 * 60 * 1000, // 5 minutes
		max_size: 5 * 1024 * 1024, // 5 MB
		use_canary_reporting: true,
		use_etags: true
	});

	const base_content = await resolve_bootstrap_content(Bun.file('./html/base_template.html'));
	
	const drop_missing = false;
	for (const [route, route_opts] of Object.entries(routes)) {
		const content_generator = async () => {
			let content = await resolve_bootstrap_content(route_opts.content);
			content = await parse_template(await resolve_bootstrap_content(base_content), { content }, false);
			
			const sub_table = sub_table_merge({}, global_sub_table, route_opts.subs);
			content = await parse_template(content, sub_table, drop_missing);
			
			return content;
		};

		const get_response = async (req: Request): Promise<Response> => {
			if (cache)
				return cache.request(req, route, content_generator);

			return new Response(await content_generator(), {
				headers: {
					'content-type': 'text/html'	
				}
			});
		};

		server.route(route, async (req, url) => {
			const user_session_id = get_cookies(req).session_id ?? null;
			const user_session = await user_get_session(user_session_id);

			if (route_opts.require_auth) {
				if (user_session !== null) {
					const res = await get_response(req);

					// keep session_updated in sync
					set_response_cookie(res, 'session_updated', user_session.user_updated_timestamp, false);
				}

				const res = Response.redirect('/login?referrer=' + encodeURIComponent(url.pathname), 302);
	
				// user has provided a session which is no longer valid, so expire it
				if (user_session_id !== null) {
					delete_response_cookie(res, 'session_id');
					set_response_cookie(res, 'session_updated', 'EXPIRED', false);
				}

				return res;
			}

			const res = await get_response(req);
			if (user_session !== null)
				set_response_cookie(res, 'session_updated', user_session.user_updated_timestamp, false);

			return res;
		});
	}

	const error_base_content = await resolve_bootstrap_content(Bun.file('./html/error.html'));

	const create_error_content_generator = (status_code: number) => async () => {
		const error_text = HTTP_STATUS_TEXT[status_code] as string;
		let content = await resolve_bootstrap_content(error_base_content);
		content = await parse_template(await resolve_bootstrap_content(base_content), { content }, false);

		const sub_table = sub_table_merge({
			error_code: status_code.toString(),
			error_text: error_text
		}, global_sub_table);

		content = await parse_template(content, sub_table, true);
		return content;
	};

	const default_handler = async (req: Request, status_code: number): Promise<Response> => {
		if (cache) {
			return cache.request(req, `error_${status_code}`, create_error_content_generator(status_code), status_code);
		} else {
			const content = await create_error_content_generator(status_code)();
			return new Response(content, {
				status: status_code,
				headers: {
					'content-type': 'text/html'
				}
			});
		}
	};

	server.error((err, req) => {
		caution(err?.message ?? err);
		return default_handler(req, 500);
	});
	
	server.default((req, status_code) => default_handler(req, status_code));
	
	const static_sub_ext = ['.css', '.s.js'];
	server.dir('/static', './static', async (file_path, file, stat, request) => {
		// ignore hidden files by default, return 404 to prevent file sniffing
		if (path.basename(file_path).startsWith('.'))
			return 404; // Not Found
		
		if (stat.isDirectory())
			return 401; // Unauthorized

		if (static_sub_ext?.some(ext => file_path.endsWith(ext))) {
			const content = await parse_template(await file.text(), global_sub_table, false);
			return new Response(content, {
				headers: {
					'Content-Type': file.type
				}
			});
		}
		
		return http_apply_range(file, request);
	});
})();
// endregion

// region webhook
if (typeof process.env.GH_WEBHOOK_SECRET === 'string') {
	server.webhook(process.env.GH_WEBHOOK_SECRET, '/internal/hook_source_change', () => {
		setImmediate(async () => {
			await server.stop(false);
			process.exit(0);
		});
		
		return HTTP_STATUS_CODE.OK_200;
	});
} else {
	caution('GH_WEBHOOK_SECRET environment variable not configured');
}
// endregion