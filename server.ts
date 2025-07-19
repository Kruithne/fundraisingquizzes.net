import { http_serve, HTTP_STATUS_CODE, HTTP_STATUS_TEXT, caution } from 'spooder';

const server = http_serve(Number(process.env.SERVER_PORT), process.env.SERVER_LISTEN_HOST);

server.dir('/static', './static', {
	ignore_hidden: true,
	support_ranges: false,
	index_directories: false
});

server.route('/*', () => {
	const file = Bun.file('./html/placeholder.html');
	return new Response(file, { status: 200 });
});

async function default_handler(status_code: number): Promise<Response> {
	return new Response(HTTP_STATUS_TEXT[status_code], { status: status_code });
}

// Unhandled exceptions and rejections from handlers.
server.error((err: Error) => {
	caution(err?.message ?? err);
	return default_handler(HTTP_STATUS_CODE.InternalServerError_500);
});

// Unhandled response codes.
server.default((_req, status_code) => default_handler(status_code));

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