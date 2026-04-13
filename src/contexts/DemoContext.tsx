import { createContext, useContext, useState, ReactNode } from "react";

interface DemoContextType {
  isDemo: boolean;
  enterDemo: () => void;
  exitDemo: () => void;
  demoPlan: any | null;
  setDemoPlan: (plan: any | null) => void;
  demoSavedPlans: any[];
  setDemoSavedPlans: (plans: any[]) => void;
}

const DemoContext = createContext<DemoContextType>({
  isDemo: false,
  enterDemo: () => {},
  exitDemo: () => {},
  demoPlan: null,
  setDemoPlan: () => {},
  demoSavedPlans: [],
  setDemoSavedPlans: () => {},
});

export const useDemo = () => useContext(DemoContext);

export const DemoProvider = ({ children }: { children: ReactNode }) => {
  const [isDemo, setIsDemo] = useState(false);
  const [demoPlan, setDemoPlan] = useState<any | null>(null);
  const [demoSavedPlans, setDemoSavedPlans] = useState<any[]>([]);

  return (
    <DemoContext.Provider
      value={{
        isDemo,
        enterDemo: () => setIsDemo(true),
        exitDemo: () => setIsDemo(false),
        demoPlan,
        setDemoPlan,
        demoSavedPlans,
        setDemoSavedPlans,
      }}
    >
      {children}
    </DemoContext.Provider>
  );
};
