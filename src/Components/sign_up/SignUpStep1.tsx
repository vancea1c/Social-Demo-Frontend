import { useSignUpContext } from "./SignUpContext";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { step1Schema, Step1Data } from "../schemas/signup/step1Schema";
import BirthDate from "./BirthDate";

const SignUpStep1 = () => {
  const { nextStep, formData, setFormData } = useSignUpContext();

  // 1) Creăm methods și le trimitem mai departe prin FormProvider
  const methods = useForm<Step1Data>({
    mode: "onChange",
    resolver: zodResolver(step1Schema),
    defaultValues: {
      ...formData,
      birth_date_fields: {
        day: "",
        month: "",
        year: "",
        touched: false,
        ...formData.birth_date_fields,
      },
    },
  });

  // 2) Destructurăm doar ce ne trebuie în acest scope
  const {
    handleSubmit,
    register,
    formState: { errors, isValid },
  } = methods;
  const onSubmit = (data: Step1Data) => {
    const { birth_date_fields, ...rest } = data;
    const { day, month, year } = birth_date_fields;

    const birth_date = new Date(
      parseInt(year, 10),
      parseInt(month, 10) - 1,
      parseInt(day, 10)
    )
      .toISOString()
      .split("T")[0]; // "YYYY-MM-DD"

    setFormData({
      ...rest,
      birth_date,
      birth_date_fields: { day, month, year },
    });
    nextStep();
  };

  return (
    <div className="form">
      <FormProvider {...methods}>
        <div className="form-container">
          <div className="header">
            <h2>Create your account</h2>
          </div>
          <div className="body">
            <form id="signup-form" onSubmit={handleSubmit(onSubmit)}>
              <div className="form-group">
                <label htmlFor="first_name" className="form-label">
                  First Name
                </label>

                <input
                  id="first_name"
                  type="text"
                  {...register("first_name")}
                />
                {errors.first_name && (
                  <p className="text-danger">{errors.first_name.message}</p>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="last_name" className="form-label">
                  Last Name
                </label>
                <input id="last_name" type="text" {...register("last_name")} />
                {errors.last_name && (
                  <p className="text-danger">{errors.last_name.message}</p>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="email" className="form-labe">
                  Email
                </label>
                <input id="email" type="email" {...register("email")} />
                {errors.email && (
                  <p className="text-danger">{errors.email.message}</p>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="username" className="form-label">
                  Username
                </label>
                <input id="username" type="text" {...register("username")} />
                {errors.username && (
                  <p className="text-danger">{errors.username.message}</p>
                )}
              </div>

              <div className="form-group gender">
                <span>Select your gender</span>
                <div className="maleGender">
                  <label htmlFor="male">Male</label>
                  <input
                    id="male"
                    type="radio"
                    value="male"
                    {...register("gender")}
                  />
                </div>
                <div className="femaleGender">
                  <label htmlFor="female">Female</label>
                  <input
                    id="female"
                    type="radio"
                    value="female"
                    {...register("gender")}
                  />
                </div>
                {errors.gender && (
                  <p className="text-danger">{errors.gender.message}</p>
                )}
              </div>
              <BirthDate></BirthDate>
            </form>
          </div>
          <div className="footer">
            <button type="submit" form="signup-form" disabled={!isValid}>
              Next
            </button>
          </div>
        </div>
      </FormProvider>
    </div>
  );
};

export default SignUpStep1;
