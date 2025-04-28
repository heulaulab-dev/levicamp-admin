import {
	Stepper,
	StepperDescription,
	StepperIndicator,
	StepperItem,
	StepperSeparator,
	StepperTitle,
	StepperTrigger,
} from '@/components/ui/stepper';

const steps = [
	{
		step: 1,
		title: 'Step One',
		description: 'Desc for step one',
	},
	{
		step: 2,
		title: 'Step Two',
		description: 'Desc for step two',
	},
	{
		step: 3,
		title: 'Step Three',
		description: 'Desc for step three',
	},
];

function Component() {
	return (
		<div className='space-y-8 min-w-[350px] text-center'>
			<Stepper defaultValue={2}>
				{steps.map(({ step, title, description }) => (
					<StepperItem
						key={step}
						step={step}
						className='relative flex-col! flex-1'
					>
						<StepperTrigger className='flex-col gap-3'>
							<StepperIndicator />
							<div className='space-y-0.5 px-2'>
								<StepperTitle>{title}</StepperTitle>
								<StepperDescription className='max-sm:hidden'>
									{description}
								</StepperDescription>
							</div>
						</StepperTrigger>
						{step < steps.length && (
							<StepperSeparator className='top-3 left-[calc(50%+0.75rem+0.125rem)] absolute inset-x-0 group-data-[orientation=horizontal]/stepper:flex-none -order-1 m-0 group-data-[orientation=horizontal]/stepper:w-[calc(100%-1.5rem-0.25rem)] -translate-y-1/2' />
						)}
					</StepperItem>
				))}
			</Stepper>
			<p
				className='mt-2 text-muted-foreground text-xs'
				role='region'
				aria-live='polite'
			>
				Stepper with titles and descriptions
			</p>
		</div>
	);
}

export { Component };
