const API_BASE_URL = process.env.API_BASE_URL;

type JSONValue =
	| string
	| number
	| boolean
	| null
	| JSONValue[]
	| { [key: string]: JSONValue };

export async function fetcher(
	endpoint: string,
	token: string,
	method = 'GET',
	body?: Record<string, JSONValue>,
) {
	const res = await fetch(`${API_BASE_URL}${endpoint}`, {
		method,
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`,
		},
		body: body ? JSON.stringify(body) : undefined,
	});

	if (!res.ok) throw new Error(`Fetch error: ${res.status}`);
	return res.json();
}
