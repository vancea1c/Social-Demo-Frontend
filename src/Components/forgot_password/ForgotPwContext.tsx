import { createContext, useContext, useState, ReactNode } from "react";

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
  const [step, setStep] = useState(1);
  const [formData, setFormDataState] = useState<ForgotPwFormData>({});

  const setFormData = (newData: Partial<ForgotPwFormData>) => {
    setFormDataState((prev) => ({ ...prev, ...newData }));
  };
  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  return (
    <ForgotPwContext.Provider
      value={{ step, nextStep, prevStep, formData, setFormData }}
    >
      {children}
    </ForgotPwContext.Provider>
  );
};

export default ForgotPwContext;
