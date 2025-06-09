import React, { useState, FormEvent } from "react";
import PasswordInput from "../Password2"; // path to the existing PasswordInput
import { useAuth } from "../AuthContext";

const ChangePasswordForm: React.FC = () => {
  const { changePassword } = useAuth(); // your auth context’s function

  // ① State for the old password (just a plain <input>)
  const [oldPassword, setOldPassword] = useState("");
  const [serverErrorOld, setServerErrorOld] = useState<string | null>(null);

  // ② State for the new password (we’ll receive this from PasswordInput via onValidPassword)
  const [newPassword, setNewPassword] = useState("");
  const [serverErrorNew, setServerErrorNew] = useState<string | null>(null);

  // ③ Tells <PasswordInput> to show its red-error styles if
  //    the user has already tried to submit once but validation failed.
  const [showErrorNew, setShowErrorNew] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setServerErrorOld(null);
    setServerErrorNew(null);

    // If <PasswordInput> has never emitted onValidPassword (i.e. newPassword === "")
    // force it to show its validation errors.
    if (!newPassword) {
      setShowErrorNew(true);
      return;
    }

    try {
      // This will POST { password: oldPassword, newPassword: newPassword }
      // to "accounts/change_password/" and then sign out on success.
      await changePassword(oldPassword, newPassword);
      // (changePassword already calls signOut("/login") on success.)
    } catch (err: any) {
      // Expected shape from DRF: { password: [...], newPassword: [...] }
      const data = err.response?.data;
      if (data?.password) {
        // If the backend returned something like { password: ["The old password is incorrect."] }
        setServerErrorOld(
          Array.isArray(data.password) ? data.password[0] : data.password
        );
      }
      if (data?.newPassword) {
        // If the backend returned { newPassword: ["Must be different from the old one."] }
        setServerErrorNew(
          Array.isArray(data.newPassword)
            ? data.newPassword[0]
            : data.newPassword
        );
        setShowErrorNew(true);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto">
      {/* ─── Old Password ─── */}
      <div className="mb-4">
        <label
          htmlFor="oldPassword"
          className={`block font-medium mb-1 ${
            serverErrorOld && "text-red-600"
          } `}
        >
          Current Password
        </label>
        <input
          id="oldPassword"
          type="password"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          className={`w-full p-2 rounded border ${
            serverErrorOld ? "border-red-600" : " border-gray-300"
          }`}
        />
        {serverErrorOld && (
          <p className="text-red-600 text-sm mt-1">{serverErrorOld}</p>
        )}
      </div>

      {/* ─── New Password + Confirm (reuse PasswordInput exactly as-is) ─── */}
      <PasswordInput
        title="New Password"
        showError={showErrorNew}
        serverError={serverErrorNew}
        onValidPassword={(pw: string) => setNewPassword(pw)}
      />

      {/* ─── Submit Button ─── */}
      <div className="mt-6">
        <button
          type="submit"
          className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Change Password
        </button>
      </div>
    </form>
  );
};

export default ChangePasswordForm;
