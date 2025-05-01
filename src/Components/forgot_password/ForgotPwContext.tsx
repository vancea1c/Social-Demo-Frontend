import { createContext, useContext, useState, ReactNode } from "react";
import { useLocation } from "react-router-dom";

export type ForgotPwFormData = {
  identifier?: string;
  code?: string;
  newPassword?: string;
};

interface ForgotPwContextProps {
  step: number;
  nextStep: () => void;
  prevStep: () => void;
  formData: { [key: string]: any };
  setFormData: (data: Partial<ForgotPwFormData>) => void;
  resetFlow: () => void;
}

const ForgotPwContext = createContext<ForgotPwContextProps | undefined>(
  undefined
);
export const useForgotPwContext = () => {
  const context = useContext(ForgotPwContext);
  if (!context) {
    throw new Error(
      "useForgotPwContext must be used within a ForgotPwProvider"
    );
  }
  return context;
};

interface ForgotPwProviderProps {
  children: ReactNode;
}

export const ForgotPwProvider = ({ children }: ForgotPwProviderProps) => {
  const location = useLocation();
  const navId = (location.state as any)?.identifier as string | undefined;

  const [step, setStep] = useState(1);
  const [formData, setFormDataState] = useState<ForgotPwFormData>({
    identifier: navId,
  });

  const setFormData = (newData: Partial<ForgotPwFormData>) => {
    setFormDataState((prev) => ({ ...prev, ...newData }));
  };
  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  const resetFlow = () => {
    setStep(1);
    setFormDataState({}); // golește toate datele
  };

  return (
    <ForgotPwContext.Provider
      value={{ step, nextStep, prevStep, formData, setFormData, resetFlow }}
    >
      {children}
    </ForgotPwContext.Provider>
  );
};

export default ForgotPwContext;
