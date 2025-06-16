import ForgotPwForm from "../forgot_password/ForgotPwForm";
import { ForgotPwProvider } from "../forgot_password/ForgotPwContext";
const ForgotPwPage = () => {
  return (
    <div className="forgotpw-page font-jura min-h-screen bg-black flex items-center justify-center px-4">
      <div className="forgotpw-box w-full max-w-md bg-[#0E0E0E] bg-opacity-50 backdrop-blur-lg p-8 rounded-2xl shadow-lg">
        <div className="header w-fit">
          <h1>SOCIAL</h1>
        </div>
        <ForgotPwProvider>
          <ForgotPwForm />
        </ForgotPwProvider>
      </div>
    </div>
  );
};

export default ForgotPwPage;
