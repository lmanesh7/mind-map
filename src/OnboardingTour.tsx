import React, { useEffect } from 'react';
import { Joyride, STATUS, Step, EventData } from 'react-joyride';

interface OnboardingTourProps {
  run: boolean;
  setRun: (run: boolean) => void;
}

const OnboardingTour: React.FC<OnboardingTourProps> = ({ run, setRun }) => {
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
    if (!hasSeenOnboarding) {
      setTimeout(() => {
        setRun(true);
      }, 1000);
    }
  }, [setRun]);

  const handleJoyrideCallback = (data: EventData) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status as any)) {
      localStorage.setItem('hasSeenOnboarding', 'true');
      setRun(false);
    }
  };

  const steps: Step[] = [
    {
      target: 'body',
      content: 'Welcome to the Mind Map App! Let\'s take a quick tour.',
      placement: 'center',
    },
    {
      target: '.tour-root-node',
      content: 'This is your starting point. You can click on it to edit the text and change colors.',
      placement: 'bottom',
    },
    {
      target: '.tour-root-node',
      content: 'Hover over a node and when your cursor shows a + icon, click and drag to create a new child node.',
      placement: 'top',
      spotlightPadding: 30,
      hideOverlay: true,
    },
    {
      target: '.tour-toolbar',
      content: 'Use these tools to Undo/Redo, export your map as a PNG or PDF, name your map, and save it to the cloud.',
      placement: 'bottom-end',
    }
  ];

  const isSidebarVisible = !!document.querySelector('.tour-sidebar');
  if (isSidebarVisible) {
    steps.push({
      target: '.tour-sidebar',
      content: 'Manage all your saved mind maps here. You can search, switch between maps, or create new ones.',
      placement: 'right-start',
    });
  }

  return (
    // @ts-ignore - react-joyride v3 types use import("react").JSX.Element which causes issues with older TS
    <Joyride
      onEvent={handleJoyrideCallback}
      continuous
      run={run}
      scrollToFirstStep
      steps={steps}
    />
  );
};

export default OnboardingTour;
