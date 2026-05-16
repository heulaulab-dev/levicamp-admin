import { create } from 'zustand';

export type SensorData = {
	id: string;
	name: string;
	temperature: number;
	humidity: number;
	power_usage: number;
	occupied: boolean;
};

export type SensorEntry = SensorData & {
	timestamp: string;
};

type SensorStore = {
	// key = site ID, value = array history 60 detik
	history: Record<string, SensorEntry[]>;
	connected: boolean;
	lastUpdate: Date | null;
	setConnected: (val: boolean) => void;
	setLastUpdate: (val: Date) => void;
	appendReading: (timestamp: string, sites: SensorData[]) => void;
};

const MAX_HISTORY = 60;

export const useSensorStore = create<SensorStore>((set) => ({
	history: {},
	connected: false,
	lastUpdate: null,

	setConnected: (val) => set({ connected: val }),

	setLastUpdate: (val) => set({ lastUpdate: val }),

	appendReading: (timestamp, sites) =>
		set((state) => {
			const next = { ...state.history };

			sites.forEach((site) => {
				const prev = next[site.id] ?? [];
				const entry: SensorEntry = { ...site, timestamp };
				next[site.id] = [...prev, entry].slice(-MAX_HISTORY);
			});

			return { history: next };
		}),
}));
