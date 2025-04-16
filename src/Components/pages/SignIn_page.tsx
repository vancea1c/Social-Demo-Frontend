import SignInForm from "../sign_in/signInForm";

const SignInpage = () => {
  return (
    <div className="signin-page">
      <div className="signin-box">
        <div className="header">
          <h1 className="">Social</h1>
        </div>
        <SignInForm />
        <div className="footer">
          <p>
            Don't have an account? <a href="/sign_up">Sign up</a>{" "}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignInpage;
