import { caution } from 'spooder';

type CallbackMap = Record<string, (data: Record<string, any>) => Promise<void> | void>;

export function post_worker_message(worker: Worker, id: string, data: object) {
	worker.postMessage(JSON.stringify({ id, data }));
}

export function init_worker(prefix: string, callbacks: CallbackMap) {
	self.onmessage = (event: MessageEvent) => {
		try {
			const message = JSON.parse(event.data);
			if (typeof message !== 'object' || message === null)
				throw new Error(`worker expects object payload, got ${message === null ? 'null' : typeof message}`);

			if (!(message.id in callbacks))
				throw new Error(`unknown message ${message.id} to worker`);
			
			callbacks[message.id](message.data ?? null);
		} catch (e) {
			caution(`exception raised in ${prefix}`, { exception: e });
		}
	};
}