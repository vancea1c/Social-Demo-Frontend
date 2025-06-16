import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useSignUpContext } from "./SignUpContext";
import PasswordInput from "../Password2";
import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";

function SignUpStep2() {
  const { signIn } = useAuth();
  const { prevStep, formData, setFormData } = useSignUpContext();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Submit handler
  const handleSubmit = async () => {
    setLoading(true);
    // Merge with previous step data
    const completeData = { ...formData };
    console.log("Sending to server:", completeData);

    try {
      const response = await axios.post("/api/accounts/sign_up/", completeData);
      if (response.status === 201) {
        await signIn({
          identifier: formData.username,
          password: formData.password,
        });
        navigate("/home");
      } else {
        setLoading(false);
        console.error("Creating account error:", response.data);
      }
    } catch (error: any) {
      console.error("Data sending error:", error);
      if (error.response) {
        console.log("Server message:", error.response.data);
      }
    }
  };

  return (
    <div className="form">
      <div className="form-container">
        <h2>Choose a password</h2>
        <PasswordInput
          onValidPassword={(pw) => {
            // când parola este 100% validă și se potrivește confirm, o salvăm
            setFormData({ password: pw });
          }}
          showError={false} // sau formData.password === undefined pentru a forța eroarea
        />

        {/* Footer */}
        <div className="footer">
          <button onClick={prevStep}>Prev</button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!formData.password}
          >
            {loading ? "Creating account.." : "Create account"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default SignUpStep2;
