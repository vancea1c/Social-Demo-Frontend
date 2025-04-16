import { SignUpProvider } from "../sign_up/SignUpContext";
import SignUpForm from "../sign_up/SignUpForm";

const SignUpPage = () => {
  return (
    <SignUpProvider>
      <div className="signup-page">
        <div className="signup-box">
          <div className="header">
            <h1 className="">Social</h1>
          </div>
          <SignUpForm />
          <div className="footer">
            <p>
              Have an account already? <a href="/log_in">Log in</a>
            </p>
          </div>
        </div>
      </div>
    </SignUpProvider>
  );
};

export default SignUpPage;
