import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";

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
  const [step, setStep] = useState<number>(() => {
    const saved = localStorage.getItem("signupStep");
    return saved ? parseInt(saved, 10) : 1;
  });
  const [formData, setFormDataState] = useState<SignUpFormData>(() => {
    const saved = localStorage.getItem("signupData");
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.removeItem("signupStep");
    localStorage.removeItem("signupData");
    setStep(1);
    setFormDataState({});
  }, []);

  useEffect(() => {
    localStorage.setItem("signupStep", String(step));
  }, [step]);

  useEffect(() => {
    localStorage.setItem("signupData", JSON.stringify(formData));
  }, [formData]);

  const setFormData = (newData: Partial<SignUpFormData>) => {
    setFormDataState((prev) => {
      // Unim ce e nou cu prev
      const updated = { ...prev, ...newData };
      // Verificăm dacă vreo valoare chiar s-a schimbat
      const hasChanged = Object.keys(newData).some(
        (key) => (newData as any)[key] !== (prev as any)[key]
      );
      // Dacă nu s-a schimbat nimic, nu rerandăm
      if (!hasChanged) return prev;
      return updated;
    });
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
