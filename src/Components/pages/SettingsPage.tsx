import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import ConfirmDialog from "../Feed/ConfirmDialog";

const SettingsPage = () => {
  const navigate = useNavigate();
  const { deleteAccount } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDelete, setShowDelete] = useState(false);

  const handleDeleteConfirm = async () => {
    setShowDelete(false);
    setIsDeleting(true);
    setError(null);
    try {
      await deleteAccount();
    } catch (err: any) {
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.error ||
        err.message ||
        "An unknown error occurred while trying to delete your account.";
      setError(msg);
      setIsDeleting(false);
    }
  };
  return (
    <div className="max-w-md mx-auto p-6">
      <h2>Account Settings</h2>
      <button
        onClick={() => navigate("/change_your_password")}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition"
      >
        Change your password
      </button>
      {error && (
        <div className="mb-4">
          <p className="text-sm text-red-700 bg-red-100 rounded-md px-3 py-2">
            {error}
          </p>
        </div>
      )}
      <button
        onClick={() => setShowDelete(true)}
        disabled={isDeleting}
        className={`
          w-full
          ${isDeleting ? "opacity-50 cursor-not-allowed" : "hover:bg-red-700"}
          bg-red-600
          text-white
          font-semibold
          py-2
          px-4
          rounded-lg
          transition
          duration-150
        `}
      >
        {isDeleting ? "Deleting…" : "Delete My Account"}
      </button>
      <ConfirmDialog
        open={showDelete}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDelete(false)}
        text="Are you sure you want to permanently delete your account? This action cannot be undone."
      />
    </div>
  );
};
export default SettingsPage;
