import TextPressure from "../Animations/TextPressure";
import { SignUpProvider } from "../sign_up/SignUpContext";
import SignUpForm from "../sign_up/SignUpForm";

const SignUpPage = () => {
  return (
    <div className="signup-page font-jura min-h-screen bg-black flex items-center justify-center px-4">
      <div className="signup-box w-full max-w-md bg-[#0E0E0E] bg-opacity-50 backdrop-blur-lg p-8 rounded-2xl shadow-lg">
        <div className="header w-fit">
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
