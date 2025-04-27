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

function Stepper({ activeStep, children, className, ...props }: StepperProps) {
	const childrenArray = React.Children.toArray(children);
	const steps = childrenArray.length;

	return (
		<StepperContext.Provider value={{ activeStep, steps }}>
			<div
				data-slot='stepper'
				className={cn('flex w-full items-center', className)}
				{...props}
			>
				{children}
			</div>
		</StepperContext.Provider>
	);
}

interface StepperItemProps extends React.HTMLAttributes<HTMLDivElement> {
	step: number;
	children: React.ReactNode;
}

function StepperItem({
	step,
	children,
	className,
	...props
}: StepperItemProps) {
	const { activeStep } = React.useContext(StepperContext);
	const isActive = step === activeStep;
	const isCompleted = step < activeStep;

	return (
		<div
			data-slot='stepper-item'
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
}

interface StepperTriggerProps extends React.HTMLAttributes<HTMLDivElement> {
	children: React.ReactNode;
}

function StepperTrigger({
	children,
	className,
	...props
}: StepperTriggerProps) {
	return (
		<div
			data-slot='stepper-trigger'
			className={cn('flex flex-col items-center', className)}
			{...props}
		>
			{children}
		</div>
	);
}

interface StepperIndicatorProps extends React.HTMLAttributes<HTMLDivElement> {
	children?: React.ReactNode;
}

function StepperIndicator({
	children,
	className,
	...props
}: StepperIndicatorProps) {
	return (
		<div
			data-slot='stepper-indicator'
			className={cn(
				'relative flex h-10 w-10 items-center justify-center rounded-full border-2 bg-background',
				className,
			)}
			{...props}
		>
			{children}
		</div>
	);
}

interface StepperSeparatorProps extends React.HTMLAttributes<HTMLDivElement> {}

function StepperSeparator({ className, ...props }: StepperSeparatorProps) {
	const { activeStep, steps } = React.useContext(StepperContext);

	return (
		<div
			data-slot='stepper-separator'
			className={cn('flex-1', className)}
			{...props}
		>
			<div className='bg-muted w-full h-[2px]' />
		</div>
	);
}

export {
	Stepper,
	StepperItem,
	StepperTrigger,
	StepperIndicator,
	StepperSeparator,
};
