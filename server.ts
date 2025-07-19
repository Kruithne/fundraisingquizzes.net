import { http_serve, HTTP_STATUS_CODE, caution } from 'spooder';

const server = http_serve(Number(process.env.SERVER_PORT), process.env.SERVER_LISTEN_HOST);

server.bootstrap({
	base: Bun.file('./html/base_template.html'),

	cache: {
		ttl: 5 * 60 * 60 * 1000, // 5 minutes
		max_size: 5 * 1024 * 1024, // 5 MB
		use_canary_reporting: true,
		use_etags: true
	},

	error: {
		use_canary_reporting: true,
		error_page: Bun.file('./html/error.html')
	},
	
	cache_bust: true,

	static: {
		directory: './static',
		route: '/static',
		sub_ext: ['.css']
	},

	global_subs: {
		
	},

	routes: {
		'/': {
			content: Bun.file('./html/index.html'),
			subs: { 'title': 'Homepage' }
		}
	}
});

server.json('/api/test', (req, url, json) => {
	return {
		foo: 'bar'
	};
});

// Automatic update webhook
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