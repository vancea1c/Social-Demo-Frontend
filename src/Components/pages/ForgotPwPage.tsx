import ForgotPwForm from "../forgot_password/ForgotPwForm";
import { ForgotPwProvider } from "../forgot_password/ForgotPwContext";
const ForgotPwPage = () => {
  return (
    <ForgotPwProvider>
      <div className="forgotpw-page">
        <div className="forgotpw-box">
          <div className="header">
            <h1>Social</h1>
          </div>
          <ForgotPwForm />
          <div className="footer">
            <p>
              Don't have an account? <a href="/sign_up">Sign up</a>{" "}
            </p>
          </div>
        </div>
      </div>
    </ForgotPwProvider>
  );
};

export default ForgotPwPage;
