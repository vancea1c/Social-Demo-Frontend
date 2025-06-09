import React, {
  useState,
  useEffect,
  useRef,
  FocusEvent,
  ChangeEvent,
} from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

// -------------------- Validation helpers --------------------
export interface PasswordChecks {
  length: boolean;
  number: boolean;
  uppercase: boolean;
  lowercase: boolean;
  symbol: boolean;
}

export function validatePassword(pw: string): PasswordChecks {
  return {
    length: pw.length >= 8,
    number: /\d/.test(pw),
    uppercase: /[A-Z]/.test(pw),
    lowercase: /[a-z]/.test(pw),
    symbol: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pw),
  };
}

export function isPasswordValid(pw: string): boolean {
  const c = validatePassword(pw);
  return c.length && c.number && c.uppercase && c.lowercase && c.symbol;
}

// -------------------- Component props --------------------
interface PasswordInputProps {
  onValidPassword: (password: string) => void;
  showError?: boolean;
  title?: string;
  serverError?: string | null;
}

// -------------------- Main component --------------------
const PasswordInput: React.FC<PasswordInputProps> = ({
  onValidPassword,
  showError: externalShowError,
  title = "Password",
  serverError,
}) => {
  const groupRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Local state
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState(false);
  const [localShowError, setLocalShowError] = useState(false);

  // Derived
  const checks = validatePassword(password);
  const overallValid = isPasswordValid(password);
  const matches = password === confirmPassword;
  const allValid = overallValid && matches;
  const hasAnyInput = password.length > 0 || confirmPassword.length > 0;
  const errorActive =
    (!overallValid && ((externalShowError ?? false) || localShowError)) ||
    Boolean(serverError);

  // Notify parent when fully valid
  useEffect(() => {
    if (allValid) onValidPassword(password);
  }, [allValid, onValidPassword, password]);

  // Clear local error once valid
  useEffect(() => {
    if (overallValid) setLocalShowError(false);
  }, [overallValid]);

  // Handlers
  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (localShowError) setLocalShowError(false);
    setPassword(e.target.value);
  };
  const handleConfirmChange = (e: ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
  };

  // ① Focus/Blur pe întreg grupul
  const handleGroupEvent = (e: FocusEvent<HTMLDivElement>) => {
    if (e.type === "focus") {
      setIsFocused(true);
      return;
    }
    // blur
    const related = (e.relatedTarget as Node) || document.activeElement;
    if (groupRef.current?.contains(related as Node)) {
      // focusul a rămas în grup → nu facem nimic
      return;
    }
    // chiar am ieșit
    setIsFocused(false);
    if (!touched && hasAnyInput) setTouched(true); //afisam lista de reguli daca s a tastat ceva
    if (!overallValid && hasAnyInput) setLocalShowError(true); // afisam cu rosu invalid password
  };

  const toggleVisibility = () => {
    if (!inputRef.current) {
      // fallback: doar inversăm dacă nu avem ref
      setShowPassword((prev) => !prev);
      return;
    }

    // 1️⃣ salvezi poziția cursorului înainte de toggle
    const start = inputRef.current.selectionStart;
    const end = inputRef.current.selectionEnd;

    // 2️⃣ schimbi vizibilitatea
    setShowPassword((prev) => !prev);

    // 3️⃣ readuci focus-ul și poziția cursorului
    setTimeout(() => {
      inputRef.current!.focus();
      // refaci selecția doar dacă există valori
      if (start !== null && end !== null) {
        inputRef.current!.setSelectionRange(start, end);
      }
    }, 0);
  };

  return (
    <div className="relative max-w-md">
      {serverError && <p className="text-red-600 mb-2">{serverError}</p>}
      {/* ─── Password group ─── */}
      <div
        ref={groupRef}
        tabIndex={-1} // face div-ul focusable
        onFocus={handleGroupEvent} // both focus
        onBlur={handleGroupEvent} // and blur calls
        className="mb-4 password-group"
      >
        <label
          htmlFor="password"
          className={errorActive ? "text-red-600 font-medium" : "font-medium"}
        >
          {errorActive ? `Invalid ${title}` : `${title}`}
        </label>

        <div className="relative mt-1">
          <input
            id="password"
            ref={inputRef}
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={handlePasswordChange}
            className={`w-full p-2 rounded border ${
              errorActive ? "border-red-600" : "border-gray-300"
            }`}
          />
          <button
            type="button"
            onClick={toggleVisibility}
            className="absolute right-2 top-2 text-gray-600"
            aria-label={showPassword ? "Hide password" : "Show password"}
            title={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
          </button>
        </div>

        {/* ─── Criteria list ─── */}
        {hasAnyInput && (isFocused || touched) && (
          <AnimatePresence mode="wait">
            <motion.div
              key="criteria"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mt-2"
            >
              <p className="text-sm mb-1">
                Your password must contain at least:
              </p>
              <ul className="list-none pl-0">
                <ConditionItem
                  text="8 characters"
                  ok={checks.length}
                  focused={isFocused}
                  showError={errorActive}
                />
                <ConditionItem
                  text="1 number"
                  ok={checks.number}
                  focused={isFocused}
                  showError={errorActive}
                />
                <ConditionItem
                  text="1 uppercase letter"
                  ok={checks.uppercase}
                  focused={isFocused}
                  showError={errorActive}
                />
                <ConditionItem
                  text="1 lowercase letter"
                  ok={checks.lowercase}
                  focused={isFocused}
                  showError={errorActive}
                />
                <ConditionItem
                  text="1 symbol"
                  ok={checks.symbol}
                  focused={isFocused}
                  showError={errorActive}
                />
              </ul>
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* ─── Confirm-password ─── */}
      <div>
        <label htmlFor="confirmPassword" className="font-medium">
          Confirm {title}
        </label>
        <input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={handleConfirmChange}
          className={`w-full p-2 rounded border ${
            confirmPassword.length > 0 && !matches
              ? "border-red-600"
              : "border-gray-300"
          }`}
        />
        {!matches && confirmPassword.length > 0 && (
          <p className="text-red-600 text-sm mt-1">Passwords do not match</p>
        )}
      </div>
    </div>
  );
};

// Sub-component pentru criterii
interface ConditionProps {
  text: string;
  ok: boolean;
  focused: boolean;
  showError: boolean;
}
const ConditionItem: React.FC<ConditionProps> = ({
  text,
  ok,
  focused,
  showError,
}) => {
  if (!ok && showError) return <li className="text-red-600 mb-1">✕ {text}</li>;
  if (focused && !ok && !showError)
    return <li className="text-gray-400 mb-1">○ {text}</li>;
  return (
    <li className={`${ok ? "text-green-600" : "text-red-600"} mb-1`}>
      {ok ? "✓" : "✕"} {text}
    </li>
  );
};

export default PasswordInput;
