import { http_serve, caution, cache_bust, log, HTTP_STATUS_CODE } from 'spooder';
import { form_validate_req, form_create_schema, form_render_html } from './server/flux';
import { post_worker_message } from './server/worker_base';
import { db } from './server/db';

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
			max_length: 100
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
// endregion

// region mail
const mail_worker_outgoing = new Worker('./server/worker_mail_outgoing.ts');

export function mail_queue_template(template_id: string, recipients: string[], replacements?: Record<string, string>, sender_id?: number) {
	post_worker_message(mail_worker_outgoing, 'queue_mail', {
		template_id, recipients, replacements, sender_id
	});
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
	return await db.exists('SELECT 1 FROM `user_verify_codes` WHERE `token` = ?', [token]);
}

async function user_get_verification_token(token: string) {
	return await db.get_single('SELECT * FROM `user_verify_codes` WHERE `token` = ? LIMIT 1', [token]) ;
}

async function user_send_verification_code(verify_token: string, force = false): Promise<SendVerificationCodeResponse> {
	const token = await user_get_verification_token(verify_token) ;
	if (!token) {
		caution('send_verification_code cannot find token', { verify_token });
		return SendVerificationCodeResponse.Error;
	}

	// verification codes can only be sent every 5 minutes.
	const timestamp = Date.now();
	if (!force && timestamp - token.last_sent < 300000)
		return SendVerificationCodeResponse.Throttled;

	await db.execute('UPDATE `user_verify_codes` SET `last_sent` = ? WHERE `token` = ? LIMIT 1', [timestamp, verify_token]);

	const user_row = await db.get_single('SELECT `first_name`, `last_name`, `email` FROM `users` WHERE `id` = ? LIMIT 1', [token.user_id]);
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

server.json('/api/register', async (req, url, json) => {
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
// endregion

// region routes
server.bootstrap({
	base: Bun.file('./html/base_template.html'),
	drop_missing_subs: false,

	cache: process.env.SPOODER_ENV === 'dev' ? undefined : {
		ttl: 5 * 60 * 60 * 1000, // 5 minutes
		max_size: 5 * 1024 * 1024, // 5 MB
		use_canary_reporting: true,
		use_etags: true
	},

	error: {
		use_canary_reporting: true,
		error_page: Bun.file('./html/error.html')
	},

	static: {
		directory: './static',
		route: '/static',
		sub_ext: ['.css', '.s.js']
	},

	cache_bust: true,

	global_subs: {
		test: 'foobar',
		scripts: cache_bust(['static/js/client_bootstrap.s.js'])
	},

	routes: {
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

		'/register': {
			content: Bun.file('./html/register.html'),
			subs: {
				title: 'Register Account',
				scripts: cache_bust(['static/js/page_register.s.js']),
				stylesheets: cache_bust(['static/css/register.css']),
				register_form: () => form_render_html(schema_register),
				login_form: () => form_render_html(schema_login)
			}
		}
	}
});
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