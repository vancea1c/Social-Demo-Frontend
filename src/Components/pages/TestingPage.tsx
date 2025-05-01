import React, { useState } from "react";
import BirthDate from "../sign_up/BirthDate";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import { step1Schema, Step1Data } from "../schemas/signup/step1Schema";
import PasswordInput from "../Password2";

const TestingPage = () => {
  const [pw, setpw] = useState<string>();
  return <PasswordInput onValidPassword={setpw} />;
};

export default TestingPage;
