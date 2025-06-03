import { useState, useCallback } from 'react';

export function usePhoneInput(initialValue = '') {
	const [value, setValue] = useState(initialValue);

	const formatPhoneNumber = useCallback((input: string) => {
		// Remove all non-numeric characters
		const numbers = input.replace(/\D/g, '');

		// If starts with 62, don't add another 62
		if (numbers.startsWith('62')) {
			return numbers.slice(2);
		}

		// If starts with 0, replace with empty (Indonesian mobile format)
		if (numbers.startsWith('0')) {
			return numbers.slice(1);
		}

		return numbers;
	}, []);

	const handleChange = useCallback(
		(input: string) => {
			const formatted = formatPhoneNumber(input);
			setValue(formatted);
			return formatted;
		},
		[formatPhoneNumber],
	);

	const getFullPhoneNumber = useCallback(() => {
		if (!value) return '';
		return `+62${value}`;
	}, [value]);

	const getDisplayValue = useCallback(() => {
		return value;
	}, [value]);

	return {
		value,
		handleChange,
		getFullPhoneNumber,
		getDisplayValue,
		setValue,
	};
}
