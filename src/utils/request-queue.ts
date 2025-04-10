type QueuedRequest = {
	id: string;
	priority: number;
	request: () => Promise<unknown>;
	retryCount: number;
};

type QueueStatus = {
	queueLength: number;
	active: number;
};

export class RequestQueue {
	private queue: QueuedRequest[] = [];
	private processing = false;
	private maxRetries = 3;
	private delayBetweenRequests = 200; // milliseconds
	private maxConcurrent = 2; // max concurrent requests
	private activeRequests = 0;

	// Singleton instance
	private static instance: RequestQueue;

	private constructor() {}

	public static getInstance(): RequestQueue {
		if (!RequestQueue.instance) {
			RequestQueue.instance = new RequestQueue();
		}
		return RequestQueue.instance;
	}

	// Add request to queue with priority
	public async add(
		id: string,
		request: () => Promise<unknown>,
		priority: number = 1,
	): Promise<unknown> {
		return new Promise((resolve, reject) => {
			const queuedRequest: QueuedRequest = {
				id,
				priority,
				request: async () => {
					try {
						const result = await request();
						resolve(result);
						return result;
					} catch (error) {
						reject(error);
						throw error;
					}
				},
				retryCount: 0,
			};

			this.queue.push(queuedRequest);
			// Sort queue by priority (higher number = higher priority)
			this.queue.sort((a, b) => b.priority - a.priority);

			if (!this.processing) {
				this.process();
			}
		});
	}

	private async process(): Promise<void> {
		this.processing = true;

		while (this.queue.length > 0 && this.activeRequests < this.maxConcurrent) {
			const request = this.queue.shift();
			if (request) {
				this.activeRequests++;

				try {
					await this.executeRequest(request);
				} finally {
					this.activeRequests--;
				}
			}
		}

		if (this.queue.length === 0 && this.activeRequests === 0) {
			this.processing = false;
		} else if (this.queue.length > 0) {
			// Continue processing remaining requests
			await this.process();
		}
	}

	private async executeRequest(request: QueuedRequest): Promise<void> {
		try {
			await request.request();
			// Add delay between requests
			await new Promise((resolve) =>
				setTimeout(resolve, this.delayBetweenRequests),
			);
		} catch (error) {
			if (
				request.retryCount < this.maxRetries &&
				error instanceof Error &&
				'response' in error &&
				(error as { response?: { status?: number } }).response?.status === 429
			) {
				// If rate limited and under max retries, add back to queue with exponential backoff
				request.retryCount++;
				const backoffTime = Math.pow(2, request.retryCount) * 1000;
				await new Promise((resolve) => setTimeout(resolve, backoffTime));
				this.queue.push(request);
			} else {
				console.error(
					`Request ${request.id} failed after ${request.retryCount} retries:`,
					error,
				);
			}
		}
	}

	// Clear the queue
	public clear(): void {
		this.queue = [];
	}

	// Get queue status
	public getStatus(): QueueStatus {
		return {
			queueLength: this.queue.length,
			active: this.activeRequests,
		};
	}
}
