/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-object-type */
'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

const StepperContext = React.createContext<{
	activeStep: number;
	steps: number;
}>({
	activeStep: 1,
	steps: 1,
});

interface StepperProps extends React.HTMLAttributes<HTMLDivElement> {
	activeStep: number;
	children: React.ReactNode;
	defaultValue?: number;
}

const Stepper = React.forwardRef<HTMLDivElement, StepperProps>(
	({ activeStep, children, className, ...props }, ref) => {
		const childrenArray = React.Children.toArray(children);
		const steps = childrenArray.length;

		return (
			<StepperContext.Provider value={{ activeStep, steps }}>
				<div
					ref={ref}
					className={cn('flex w-full items-center', className)}
					{...props}
				>
					{children}
				</div>
			</StepperContext.Provider>
		);
	},
);
Stepper.displayName = 'Stepper';

interface StepperItemProps extends React.HTMLAttributes<HTMLDivElement> {
	step: number;
	children: React.ReactNode;
}

const StepperItem = React.forwardRef<HTMLDivElement, StepperItemProps>(
	({ step, children, className, ...props }, ref) => {
		const { activeStep } = React.useContext(StepperContext);
		const isActive = step === activeStep;
		const isCompleted = step < activeStep;

		return (
			<div
				ref={ref}
				className={cn(
					'flex flex-1 flex-col items-center',
					isActive && 'text-primary',
					isCompleted && 'text-primary',
					!isActive && !isCompleted && 'text-muted-foreground',
					className,
				)}
				{...props}
			>
				{children}
			</div>
		);
	},
);
StepperItem.displayName = 'StepperItem';

interface StepperTriggerProps extends React.HTMLAttributes<HTMLDivElement> {
	children: React.ReactNode;
}

const StepperTrigger = React.forwardRef<HTMLDivElement, StepperTriggerProps>(
	({ children, className, ...props }, ref) => {
		return (
			<div
				ref={ref}
				className={cn('flex flex-col items-center', className)}
				{...props}
			>
				{children}
			</div>
		);
	},
);
StepperTrigger.displayName = 'StepperTrigger';

interface StepperIndicatorProps extends React.HTMLAttributes<HTMLDivElement> {
	children?: React.ReactNode;
}

const StepperIndicator = React.forwardRef<
	HTMLDivElement,
	StepperIndicatorProps
>(({ children, className, ...props }, ref) => {
	return (
		<div
			ref={ref}
			className={cn(
				'relative flex h-10 w-10 items-center justify-center rounded-full border-2 bg-background',
				className,
			)}
			{...props}
		>
			{children}
		</div>
	);
});
StepperIndicator.displayName = 'StepperIndicator';

interface StepperSeparatorProps extends React.HTMLAttributes<HTMLDivElement> {}

const StepperSeparator = React.forwardRef<
	HTMLDivElement,
	StepperSeparatorProps
>(({ className, ...props }, ref) => {
	const { activeStep, steps } = React.useContext(StepperContext);

	return (
		<div ref={ref} className={cn('flex-1', className)} {...props}>
			<div className='bg-muted w-full h-[2px]' />
		</div>
	);
});
StepperSeparator.displayName = 'StepperSeparator';

export {
	Stepper,
	StepperItem,
	StepperTrigger,
	StepperIndicator,
	StepperSeparator,
};
