import { createContext, useContext, useState, ReactNode } from "react";

export type SignUpFormData = {
  first_name?: string;
  last_name?: string;
  email?: string;
  username?: string;
  gender?: "male" | "female";
  birth_date?: string;
  birth_date_fields?: {
    day: string;
    month: string;
    year: string;
  };
  password?: string;
};

interface SignUpContextProps {
  step: number;
  nextStep: () => void;
  prevStep: () => void;
  formData: { [key: string]: any };
  setFormData: (data: Partial<SignUpFormData>) => void;
}

const SignUpContext = createContext<SignUpContextProps | undefined>(undefined);

export const useSignUpContext = () => {
  const context = useContext(SignUpContext);
  if (!context) {
    throw new Error("useSignUpContext must be used within a SignUpProvider");
  }
  return context;
};
interface SignUpProviderProps {
  children: ReactNode;
}
export const SignUpProvider = ({ children }: SignUpProviderProps) => {
  const [step, setStep] = useState(1);
  const [formData, setFormDataState] = useState<SignUpFormData>({});

  const setFormData = (newData: Partial<SignUpFormData>) => {
    setFormDataState((prev) => ({ ...prev, ...newData }));
  };

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  return (
    <SignUpContext.Provider
      value={{ step, nextStep, prevStep, formData, setFormData }}
    >
      {children}
    </SignUpContext.Provider>
  );
};

export default SignUpContext;
