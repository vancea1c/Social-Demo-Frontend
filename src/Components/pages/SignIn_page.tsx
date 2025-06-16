import SignInForm from "../sign_in/signInForm";

const SignInpage = () => {
  return (
    <div className="signin-page font-jura min-h-screen bg-black flex items-center justify-center px-4">
      <div className="signin-box w-full max-w-md bg-[#0E0E0E] bg-opacity-50 backdrop-blur-lg p-8 rounded-2xl shadow-lg">
        <div className="header w-full h-full text-center mb-6">
          <h1>SOCIAL</h1>
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
