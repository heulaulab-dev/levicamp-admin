'use client';

import { SensorEntry } from '@/stores/use-sensor-store';
import { LineChart, Line, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useEffect, useState } from 'react';

type Props = {
	siteId: string;
	history: SensorEntry[];
};

const METRICS = [
	{ key: 'temperature' as const, color: '#f97316', label: 'Temp °C' },
	{ key: 'humidity' as const, color: '#38bdf8', label: 'Humidity %' },
	{ key: 'power_usage' as const, color: '#a78bfa', label: 'Power W' },
];

export function SiteCard({ siteId, history }: Props) {
	const latest = history[history.length - 1];
	const [now, setNow] = useState(Date.now());

	useEffect(() => {
		const interval = setInterval(() => setNow(Date.now()), 1000);
		return () => clearInterval(interval);
	}, []);

	const isStale = latest
		? now - new Date(latest.timestamp).getTime() > 5 * 1000
		: true;

	console.log(isStale);

	return (
		<div className='space-y-3 bg-card p-4 border rounded-xl'>
			{isStale && (
				<div className='text-red-500 text-sm text-center'>
					⚠ No recent data (last update:{' '}
					{latest ? new Date(latest.timestamp).toLocaleTimeString() : 'N/A'})
				</div>
			)}

			{/* Header */}
			<div className='flex justify-between items-center'>
				<p className='font-medium text-sm'>{latest?.name ?? siteId}</p>
				<span
					className={`text-xs px-2 py-0.5 rounded-full ${
						latest?.occupied
							? 'bg-green-100 text-green-700'
							: 'bg-zinc-100 text-zinc-500'
					}`}
				>
					{latest?.occupied ? 'Occupied' : 'Vacant'}
				</span>
			</div>

			{/* Latest values */}
			<div className='flex gap-3 text-muted-foreground text-xs'>
				<span>🌡 {latest?.temperature}°C</span>
				<span>💧 {latest?.humidity}%</span>
				<span>⚡ {latest?.power_usage}W</span>
			</div>

			{/* Charts */}
			<div className='space-y-2'>
				{METRICS.map(({ key, color, label }) => (
					<div key={key}>
						<p className='mb-1 text-muted-foreground text-xs'>{label}</p>
						<ResponsiveContainer width='100%' height={50}>
							<LineChart data={history}>
								<YAxis domain={['auto', 'auto']} hide />
								<Tooltip
									contentStyle={{ fontSize: 10 }}
									formatter={(val) => [val, label]}
								/>
								<Line
									type='monotone'
									dataKey={key}
									stroke={color}
									dot={false}
									strokeWidth={1.5}
									isAnimationActive={false}
								/>
							</LineChart>
						</ResponsiveContainer>
					</div>
				))}
			</div>
		</div>
	);
}
