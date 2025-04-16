import { useSignUpContext } from "./SignUpContext";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { step1Schema, Step1Data } from "../schemas/signup/step1Schema";

const SignUpStep1 = () => {
  const { nextStep, formData, setFormData } = useSignUpContext();

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    setValue,
    formState: { errors, isValid },
  } = useForm<Step1Data>({
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
  const watchDay = watch("birth_date_fields.day");
  const watchYear = watch("birth_date_fields.year");
  const watchMonth = watch("birth_date_fields.month");
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1; // 1-based
  const currentDay = today.getDate();

  const [daysInMonth, setDaysInMonth] = useState<number[]>([]);

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  useEffect(() => {
    const y = parseInt(watchYear);
    const m = parseInt(watchMonth);
    if (!isNaN(y) && !isNaN(m)) {
      const days = new Date(y, m, 0).getDate(); // m = 1–12 (no need to subtract 1)
      setDaysInMonth([...Array(days)].map((_, i) => i + 1));
    } else {
      setDaysInMonth([]);
    }
  }, [watchYear, watchMonth]);

  useEffect(() => {
    trigger("birth_date_fields");
  }, [watchDay, watchMonth, watchYear, trigger]);

  const handleBirthDateChange = (
    field: "day" | "month" | "year",
    value: string
  ) => {
    setValue(`birth_date_fields.${field}` as const, value, {
      shouldValidate: true,
    });
    // Setăm touched la true dacă nu este deja
    setValue("birth_date_fields.touched", true, { shouldValidate: true });
  };

  const onSubmit = (data: Step1Data) => {
    const { birth_date_fields, ...rest } = data;
    const { day, month, year } = birth_date_fields;
    const y = parseInt(year);
    const m = parseInt(month);
    const d = parseInt(day);

    const birth_date_obj = new Date(y, m - 1, d);
    const birth_date = birth_date_obj.toISOString().split("T")[0]; // "YYYY-MM-DD"

    setFormData({
      ...rest,
      birth_date, // Acum e un string "YYYY-MM-DD"
      birth_date_fields: { day, month, year },
    });

    nextStep();
  };

  return (
    <div className="form">
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

              <input id="first_name" type="text" {...register("first_name")} />
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
            <div className="birth_date">
              <label>Birth Date:</label>
              <p>
                This will not be shown publicly. Confirm your own age, even if
                this account is for a business, a pet, or something else.
              </p>
              <div className="form-column">
                <label htmlFor="year">Year</label>
                <select
                  id="year"
                  {...register("birth_date_fields.year")}
                  onChange={(e) => handleBirthDateChange("day", e.target.value)}
                  autoFocus
                >
                  <option key={""} value={""}>
                    {""}
                  </option>
                  {[...Array(100)].map((_, i) => {
                    const year = new Date().getFullYear() - i;
                    return (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div className="form-column">
                <label htmlFor="month">Month</label>
                <select
                  id="month"
                  {...register("birth_date_fields.month")}
                  onChange={(e) => handleBirthDateChange("day", e.target.value)}
                >
                  <option key={""} value={""}>
                    {""}
                  </option>
                  {monthNames.map((name, i) => {
                    const monthNumber = i + 1;
                    if (
                      parseInt(watchYear) === currentYear &&
                      monthNumber > currentMonth
                    )
                      return null;
                    return (
                      <option key={monthNumber} value={monthNumber}>
                        {name}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div className="form-column">
                <label htmlFor="day">Day</label>
                <select
                  id="day"
                  {...register("birth_date_fields.day")}
                  onChange={(e) => handleBirthDateChange("day", e.target.value)}
                >
                  <option key={""} value={""}>
                    {""}
                  </option>
                  {daysInMonth.map((d) => {
                    if (
                      parseInt(watchYear) === currentYear &&
                      parseInt(watchMonth) === currentMonth &&
                      d > currentDay
                    )
                      return null;
                    return (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    );
                  })}
                </select>
              </div>
              {errors.birth_date_fields?.birth_date_error && (
                <p className="text-danger">
                  {errors.birth_date_fields.birth_date_error.message}
                </p>
              )}
            </div>
          </form>
        </div>
        <div className="footer">
          <button type="submit" form="signup-form" disabled={!isValid}>
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignUpStep1;
