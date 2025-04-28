import {
	Stepper,
	StepperIndicator,
	StepperItem,
	StepperSeparator,
	StepperTrigger,
} from '@/components/ui/stepper';

interface DialogStepperProps {
	currentStep: number;
	isLoading?: boolean;
}

function DialogStepper({ currentStep, isLoading = false }: DialogStepperProps) {
	const steps = [1, 2];

	return (
		<div className='space-y-8 mx-auto min-w-[300px] max-w-xl text-center'>
			<Stepper value={currentStep}>
				{steps.map((step) => (
					<StepperItem
						key={step}
						step={step}
						completed={step < currentStep}
						loading={isLoading && step === currentStep}
						className='not-last:flex-1'
					>
						<StepperTrigger>
							<StepperIndicator />
						</StepperTrigger>
						{step < steps.length && <StepperSeparator />}
					</StepperItem>
				))}
			</Stepper>
		</div>
	);
}

export { DialogStepper };
