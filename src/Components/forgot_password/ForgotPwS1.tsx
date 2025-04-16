import { useEffect, useState } from "react";
import { useForgotPwContext } from "./ForgotPwContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPwSchema, ForgotPwFormData } from "../schemas/forgotPwSchema";
import axios from "axios";

const ForgotPwS1 = () => {
  const { nextStep, setFormData } = useForgotPwContext();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ForgotPwFormData>({
    mode: "onChange",
    resolver: zodResolver(forgotPwSchema),
  });

  const onSubmit = async (data: ForgotPwFormData) => {
    console.log("Submitting data", data);
    try {
      await axios.post("http://localhost:8000/api/forgot_password/", data);
      setFormData(data);
      nextStep();
    } catch (error: any) {
      if (error.response && error.response.data) {
        const serverErrors = error.response.data;
        for (const field in serverErrors) {
          setError(field as keyof ForgotPwFormData, {
            type: "server",
            message: serverErrors[field][0],
          });
        }
      }
    }
  };
  return (
    <div className="form">
      <div className="form-container">
        <div className="header">
          <h2>Find your Social account</h2>
          <p>
            Enter the email or username associated with your account to change
            your password.
          </p>
        </div>
        <div className="body">
          <form id="forgotpw-form" onSubmit={handleSubmit(onSubmit)}>
            <div className="form-group">
              <label htmlFor="usn/e" className="form-label">
                Username or Email
              </label>
              <input id="usn/e" {...register("identifier")} />
              <input type="hidden" value={1} {...register("step")} />
              {errors.identifier && (
                <p className="text-danger">{errors.identifier.message}</p>
              )}
            </div>
          </form>
        </div>
        <div className="footer">
          <button type="submit" form="forgotpw-form">
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPwS1;
