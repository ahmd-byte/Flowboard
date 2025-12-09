import { useState, useEffect } from 'react';
import { X, ArrowRight, ArrowLeft, Sparkles, LayoutDashboard, Plus, Users, Settings } from 'lucide-react';

const TOUR_KEY = 'flowboard-tour-completed';

const tourSteps = [
  {
    id: 'welcome',
    title: 'Welcome to Flowboard! 🎉',
    description: 'Let\'s take a quick tour to help you get started with managing your projects.',
    icon: Sparkles,
    position: 'center'
  },
  {
    id: 'dashboard',
    title: 'Your Dashboard',
    description: 'This is your home base. Here you can see all your boards and quick stats about your projects.',
    icon: LayoutDashboard,
    target: '[data-tour="dashboard"]',
    position: 'bottom'
  },
  {
    id: 'create-board',
    title: 'Create Boards',
    description: 'Click here to create a new board. Organize your work into different boards for each project.',
    icon: Plus,
    target: '[data-tour="create-board"]',
    position: 'bottom'
  },
  {
    id: 'collaboration',
    title: 'Team Collaboration',
    description: 'Invite team members to your boards. Work together in real-time with live updates!',
    icon: Users,
    position: 'center'
  },
  {
    id: 'settings',
    title: 'Customize Your Experience',
    description: 'Visit settings to adjust notifications, theme, and other preferences.',
    icon: Settings,
    target: '[data-tour="settings"]',
    position: 'left'
  }
];

const OnboardingTour = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if tour was completed
    const completed = localStorage.getItem(TOUR_KEY);
    if (!completed) {
      setIsVisible(true);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeTour();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeTour = () => {
    localStorage.setItem(TOUR_KEY, 'true');
    setIsVisible(false);
    onComplete?.();
  };

  const skipTour = () => {
    localStorage.setItem(TOUR_KEY, 'true');
    setIsVisible(false);
    onComplete?.();
  };

  if (!isVisible) return null;

  const step = tourSteps[currentStep];
  const Icon = step.icon;
  const isLastStep = currentStep === tourSteps.length - 1;
  const isFirstStep = currentStep === 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      
      {/* Tour Card */}
      <div className="relative bg-neutral-900 rounded-2xl p-6 w-full max-w-md mx-4 border border-neutral-800 shadow-2xl animate-scale-in">
        {/* Close Button */}
        <button
          onClick={skipTour}
          className="absolute top-4 right-4 text-neutral-500 hover:text-white p-1 rounded-lg hover:bg-neutral-800 transition-colors"
        >
          <X size={20} />
        </button>

        {/* Step Indicator */}
        <div className="flex gap-1.5 mb-6">
          {tourSteps.map((_, index) => (
            <div
              key={index}
              className={`h-1 flex-1 rounded-full transition-colors ${
                index <= currentStep ? 'bg-red-600' : 'bg-neutral-700'
              }`}
            />
          ))}
        </div>

        {/* Icon */}
        <div className="w-16 h-16 bg-red-600/10 rounded-2xl flex items-center justify-center mb-4">
          <Icon size={32} className="text-red-500" />
        </div>

        {/* Content */}
        <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
        <p className="text-neutral-400 mb-6">{step.description}</p>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={skipTour}
            className="text-neutral-500 hover:text-white text-sm font-medium transition-colors"
          >
            Skip tour
          </button>
          
          <div className="flex gap-2">
            {!isFirstStep && (
              <button
                onClick={handlePrev}
                className="flex items-center gap-1 px-4 py-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-xl transition-colors"
              >
                <ArrowLeft size={16} />
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl font-medium transition-colors shadow-lg shadow-red-600/20"
            >
              {isLastStep ? 'Get Started' : 'Next'}
              {!isLastStep && <ArrowRight size={16} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Reset tour (for testing)
export const resetTour = () => {
  localStorage.removeItem(TOUR_KEY);
};

export default OnboardingTour;

