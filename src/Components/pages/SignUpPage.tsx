import { SignUpProvider } from "../sign_up/SignUpContext";
import SignUpForm from "../sign_up/SignUpForm";

const SignUpPage = () => {
  return (
    <div className="signup-page">
      <div className="signup-box">
        <div className="header">
          <h1 className="">Social</h1>
        </div>
        <SignUpProvider>
          <SignUpForm />
        </SignUpProvider>
        <div className="footer">
          <p>
            Have an account already? <a href="/log_in">Log in</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
