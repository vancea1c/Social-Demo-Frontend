import React, { useState } from "react";
import { validatePassword, isPasswordValid } from "./parola2ext";
import { motion, AnimatePresence } from "framer-motion";

export default function PasswordField() {
  const [password, setPassword] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [showError, setShowError] = useState(false);

  // Când se schimbă parola, recalculăm condițiile
  const checks = validatePassword(password);
  const overallValid = isPasswordValid(password);
  const touched = password.length > 0;

  // Handler pentru modificare
  const handleChange = (e: any) => {
    // Resetează mesajul de eroare la orice modificare
    if (showError) {
      setShowError(false);
    }
    setPassword(e.target.value);
  };

  // Când inputul pierde focus, dacă parola nu e validă, setează showError
  const handleBlur = () => {
    setIsFocused(false);
    if (!overallValid && password.length > 0) {
      setShowError(true);
    }
  };

  // Când focusul intră, doar actualizează starea isFocused (nu resetăm showError aici)
  const handleFocus = () => {
    setIsFocused(true);
  };

  return (
    <div style={{ width: 300, margin: "0 auto" }}>
      {/* Dacă s-a generat eroarea, o afișăm până se modifică inputul */}
      {showError ? (
        <label htmlFor="password" style={{ color: "red", marginBottom: 4 }}>
          INVALID PASSWORD
        </label>
      ) : (
        <label htmlFor="password">PASSWORD</label>
      )}

      {/* INPUT */}
      <input
        id="password"
        name="password"
        type="password"
        value={password}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChange={handleChange}
        style={{
          display: "block",
          width: "100%",
          marginTop: 5,
          marginBottom: 8,
          borderColor:
            !isFocused && touched && !overallValid ? "red" : undefined,
        }}
      />

      {/* LISTA DE CONDIȚII: apare doar când e focusat sau există deja ceva tastat */}
      {(isFocused || password.length > 0) && (
        <AnimatePresence mode="wait">
          {(isFocused || password.length > 0) && (
            <motion.div
              key="conditionsList"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              style={{ overflow: "hidden", marginBottom: 16 }}
            >
              <p style={{ margin: 0 }}>Your password must contain at least:</p>
              <ul style={{ listStyleType: "none", paddingLeft: 0, margin: 0 }}>
                <ConditionItem
                  text="7 characters"
                  isOk={checks.length}
                  isFocused={isFocused}
                  showError={showError}
                />
                <ConditionItem
                  text="1 number"
                  isOk={checks.number}
                  isFocused={isFocused}
                  showError={showError}
                />
                <ConditionItem
                  text="1 uppercase letter"
                  isOk={checks.uppercase}
                  isFocused={isFocused}
                  showError={showError}
                />
                <ConditionItem
                  text="1 lowercase letter"
                  isOk={checks.lowercase}
                  isFocused={isFocused}
                  showError={showError}
                />
                <ConditionItem
                  text="1 symbol"
                  isOk={checks.symbol}
                  isFocused={isFocused}
                  showError={showError}
                />
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}

// Mic component care afișează cu roșu sau verde în funcție de isOk
function ConditionItem({
  text,
  isOk,
  isFocused,
  showError,
}: {
  text: string;
  isOk: boolean;
  isFocused: boolean;
  showError: boolean;
}) {
  if (isFocused && !isOk && showError) {
    return (
      <li style={{ color: "red", marginBottom: 4 }}>
        {"✕"} {text}
      </li>
    );
  } else if (isFocused && isOk) {
    return (
      <li style={{ color: "green", marginBottom: 4 }}>
        {"✓"} {text}
      </li>
    );
  } else if (isFocused && !isOk)
    return (
      <li style={{ color: "gray", marginBottom: 4 }}>
        {"o"} {text}
      </li>
    );

  return (
    <li style={{ color: isOk ? "green" : "red", marginBottom: 4 }}>
      {isOk ? "✓" : "✕"} {text}
    </li>
  );
}