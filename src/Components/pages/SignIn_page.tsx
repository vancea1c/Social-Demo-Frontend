import TextPressure from "../Animations/TextPressure";
import SignInForm from "../sign_in/signInForm";

const SignInpage = () => {
  return (
    <div className="signin-page font-jura min-h-screen bg-black flex items-center justify-center px-4">
      <div className="signin-box w-full max-w-md bg-[#0E0E0E] bg-opacity-50 backdrop-blur-lg p-8 rounded-2xl shadow-lg">
        <div className="header w-3xs ">
          <TextPressure
            text="SOCIAL"
            flex={true}
            alpha={false}
            stroke={false}
            width={true}
            weight={true}
            italic={true}
            textColor="#ffffff"
            strokeColor="#ff0000"
            minFontSize={36}
          />
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
