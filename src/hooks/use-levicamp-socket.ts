/* eslint-disable @typescript-eslint/no-unused-expressions */
'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useSensorStore } from '@/stores/use-sensor-store';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:4000';
const RECONNECT_DELAY = 3000;

export function useLeviCampSocket() {
	const wsRef = useRef<WebSocket | null>(null);
	const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
	const { setConnected, setLastUpdate, appendReading } = useSensorStore();

	const connect = useCallback(() => {
		if (wsRef.current?.readyState === WebSocket.OPEN) return;

		const ws = new WebSocket(WS_URL);
		wsRef.current = ws;

		ws.onopen = () => {
			setConnected(true);
			if (reconnectTimer.current) {
				clearTimeout(reconnectTimer.current);
				reconnectTimer.current = null;
			}
		};

		ws.onmessage = (event) => {
			const reading = JSON.parse(event.data);
			const timestamp = new Date(reading.timestamp).toLocaleTimeString();
			setLastUpdate(new Date(reading.timestamp));
			appendReading(timestamp, reading.sites);
		};

		ws.onclose = () => {
			setConnected(false);
			reconnectTimer.current = setTimeout(connect, RECONNECT_DELAY);
		};

		ws.onerror = () => {
			ws.close();
		};
	}, [setConnected, setLastUpdate, appendReading]);

	useEffect(() => {
		connect();
		return () => {
			reconnectTimer.current && clearTimeout(reconnectTimer.current);
			wsRef.current?.close();
		};
	}, [connect]);
}
