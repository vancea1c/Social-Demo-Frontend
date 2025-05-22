import ForgotPwForm from "../forgot_password/ForgotPwForm";
import { ForgotPwProvider } from "../forgot_password/ForgotPwContext";
import TextPressure from "../Animations/TextPressure";
const ForgotPwPage = () => {
  return (
    <div className="forgotpw-page font-jura min-h-screen bg-black flex items-center justify-center px-4">
      <div className="forgotpw-box w-full max-w-md bg-[#0E0E0E] bg-opacity-50 backdrop-blur-lg p-8 rounded-2xl shadow-lg">
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
        <ForgotPwProvider>
          <ForgotPwForm />
        </ForgotPwProvider>
        {/* <div className="footer">
          <p>
            Don't have an account? <a href="/sign_up">Sign up</a>{" "}
          </p>
        </div> */}
      </div>
    </div>
  );
};

export default ForgotPwPage;
