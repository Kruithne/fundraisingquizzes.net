import { http_serve, caution, db_mysql, cache_bust, HTTP_STATUS_CODE } from 'spooder';
import { form_validate_req, form_create_schema, form_render_html } from './server/flux';

// MARK: server bootstrap
const server = http_serve(Number(process.env.SERVER_PORT), process.env.SERVER_LISTEN_HOST);
const db = await db_mysql({
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_DATABASE
}, false, true);

await db.update_schema('./schema');

// MARK: api
const today_in_history_schema = form_create_schema({
	fields: {
		month: { type: 'number', min: 0, max: 11 },
		day: { type: 'number', min: 1, max: 31 }
	}
});

server.json('/api/today_in_history', async (req, url, json) => {
	const validate = form_validate_req(today_in_history_schema, json);
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

const register_schema = form_create_schema({
	id: 'register_form',
	endpoint: '/api/register',
	fields: {
		username: {
			type: 'text',
			label: 'Choose a username:',
			max_length: 20
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

// MARK: routes
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
				register_form: () => form_render_html(register_schema)
			}
		}
	}
});

// MARK: webhook
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