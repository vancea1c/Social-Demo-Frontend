import ForgotPwS1 from "./ForgotPwS1";
import ForgotPwS2 from "./ForgotPwS2";
import ForgotPwS3 from "./ForgotPwS3";
import { useForgotPwContext } from "./ForgotPwContext";

const ForgotPwForm = () => {
  const { step } = useForgotPwContext();
  return (
    <div className="forgotpw-form-container">
      {step === 1 && <ForgotPwS1 />}
      {step === 2 && <ForgotPwS2 />}
      {step === 3 && <ForgotPwS3 />}
    </div>
  );
};

export default ForgotPwForm;
