import SignUpStep1 from "./SignUpStep1";
import SignUpStep2 from "./SignUpStep2";
import { useSignUpContext } from "./SignUpContext";

const SignUpForm = () => {
  const { step } = useSignUpContext();
  return (
    <div className="signup-form-container">
      {step === 1 && <SignUpStep1 />}
      {step === 2 && <SignUpStep2 />}
    </div>
  );
};

export default SignUpForm;
