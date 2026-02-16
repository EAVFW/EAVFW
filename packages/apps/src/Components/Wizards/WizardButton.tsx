import { Button, ButtonProps } from '@fluentui/react-components';
import { MouseEventHandler } from 'react';
import { useWizard } from './useWizard';

export const WizardButton = ({
  children,
  action,
  workflow,
  ...buttonProps
}: { action: string; workflow?: string } & ButtonProps) => {
  const [{ isTransitioning }, { moveNext }] = useWizard();

  return (
    <Button
      shape="square"
      {...buttonProps}
      disabled={isTransitioning}
      onClick={
        ((e) => {
          moveNext(action);
        }) as MouseEventHandler
      }
    >
      {children}
    </Button>
  );
};
