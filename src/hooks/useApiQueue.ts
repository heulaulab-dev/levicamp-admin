import { useCallback } from 'react';
import { RequestQueue } from '@/utils/request-queue';

export const useApiQueue = () => {
	const queue = RequestQueue.getInstance();

	const queueRequest = useCallback(
		async <T>(
			id: string,
			request: () => Promise<T>,
			priority?: number,
		): Promise<T> => {
			return queue.add(id, request, priority) as Promise<T>;
		},
		[],
	);

	return {
		queueRequest,
		getQueueStatus: queue.getStatus.bind(queue),
		clearQueue: queue.clear.bind(queue),
	};
};
