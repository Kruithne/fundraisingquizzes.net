import nodemailer from 'nodemailer';
import { caution, JsonArray, JsonObject, log_create_logger } from 'spooder';
import { init_worker } from './worker_base';

const log = log_create_logger('mail');

// #region mail
type Replacements = Record<string, string>;

const BASE_TEMPLATE_FILE = './mail/template.html';
const template_cache = new Map();

async function load_base_template(): Promise<string> {
	const cached = template_cache.get(BASE_TEMPLATE_FILE);
	if (cached)
		return cached;
	
	const base_template_file = Bun.file('./mail/template.html');
	const text = await base_template_file.text();
	
	template_cache.set(BASE_TEMPLATE_FILE, text);
	
	return text;
}

async function load_template(template_id: string, replacements?: Replacements): Promise<JsonObject> {
	const template_file_path = './mail/templates/' + template_id + '.json';
	let text = template_cache.get(template_file_path);
	
	if (text === undefined) {
		const template_file = Bun.file(template_file_path);
		text = await template_file.text();
		
		template_cache.set(template_file_path, text);
	}
	
	const json = JSON.parse(text);
	
	if (replacements) {
		for (let i = 0; i < json.content.length; i++) {
			for (const key in replacements)
				json.content[i] = json.content[i].replace('%' + key + '%', replacements[key]);
		}
	}
	
	return json;
}

async function render_html_template(template: JsonArray) {
	const base_html = await load_base_template();
	
	const lines = base_html.split(/\r?\n/);
	const template_index = lines.findIndex(line => line.includes('<!-- TEMPLATE CONTENT -->'));
	
	const template_content = template.flatMap(content =>
		lines[template_index].replace('<!-- TEMPLATE CONTENT -->', content as string)
	);
	
	lines.splice(template_index, 1, ...template_content);
	return lines.join('\n');
}

function render_text_template(template: JsonArray) {
	return template.join('\n\n');
}

async function send_mail_template(template_id: string, recipients: string[], replacements?: Replacements) {
	if (recipients.length === 0)
		return;
	
	try {
		const template = await load_template(template_id, replacements);
		const transporter = nodemailer.createTransport({
			host: process.env.SMTP_HOST,
			port: 465,
			secure: true,
			tls: {
				rejectUnauthorized: false
			},
			auth: {
				user: process.env.SMTP_USER,
				pass: process.env.SMTP_PASS
			}
		});
		
		const message = {
			from: 'Fundraising Quizzes <no-reply@fundraisingquizzes.net>',
			to: recipients,
			subject: template.subject as string,
			text: render_text_template(template.content as JsonArray),
			html: await render_html_template(template.content as JsonArray)
		};
		
		const info = await transporter.sendMail(message);
		const recipient_str = recipients.length === 1 ? recipients[0] : recipients.length + ' recipients';
		log(`{${template_id}} to {${recipient_str}} -> {${info.response}}`);
	} catch (e) {
		caution('smtp transport failed', {
			error: e,
			template_id,
			recipients
		});
	}
}
// #endregion
	
// #region worker
type MailDispatchNode = {
	id: number;
	template_id?: string;
	recipients: Array<string>;
	replacements?: Record<string, string>;
	subject?: string;
}

const DISPATCH_THROTTLE_MS = 250;

const mail_queue = Array<MailDispatchNode>();
let current_email_id = 1;
let is_dispatching = false;

function queue_mail(node: MailDispatchNode) {
	mail_queue.push(node);
	
	log(`outgoing mail {${node.id}} queued ({${mail_queue.length}})`);
	
	if (!is_dispatching) {
		is_dispatching = true;
		process_queue();
	}
}

async function process_queue() {
	const node = mail_queue.shift();
	if (node === undefined)
		return;
	
	log(`dispatch mail {${node.id}} -> {${node.recipients.length}} recipients`);
	
	if (node.template_id !== undefined) {
		await send_mail_template(node.template_id, node.recipients, node.replacements);
	} else {
		caution('dispatching email without template', node);
	}
	
	if (mail_queue.length > 0)
		setTimeout(process_queue, DISPATCH_THROTTLE_MS);
	else
		is_dispatching = false;
}

init_worker('worker-mail-outgoing', {
	async queue_mail(data) {
		if ((typeof data.content !== 'string' || typeof data.subject !== 'string') && typeof data.template_id !== 'string')
			return caution('queue_mail() without (.content and .subject) or .template', data);
		
		if (!Array.isArray(data.recipients) || data.recipients.length === 0)
			return caution('queue_mail() without valid recipients', data);
		
		data.id = current_email_id++;
		queue_mail(data as MailDispatchNode);
	}
});
// #endregion