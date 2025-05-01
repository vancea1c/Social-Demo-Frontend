import { useState, useEffect, FocusEvent, ChangeEvent } from "react";
import { useFormContext } from "react-hook-form";
import { Step1Data } from "../schemas/signup/step1Schema";
import { z } from "zod";

// Schema si tipuri pentru campurile datei de nastere
const today = new Date();
const min18 = new Date(
  today.getFullYear() - 18,
  today.getMonth(),
  today.getDate()
);

export const BirthDateSchema = z
  .object({
    year: z.string(),
    month: z.string(),
    day: z.string(),
    touched: z.boolean().optional(),
  })
  .superRefine((val, ctx) => {
    const y = parseInt(val.year, 10);
    const m = parseInt(val.month, 10);
    const d = parseInt(val.day, 10);
    if (!val.touched) return; // nu valida daca nu s a interacționat
    const hasEmpty = !y || !m || !d;
    const birthDate = new Date(y, m - 1, d);
    if (birthDate > min18) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "You must be at least 18 years old.",
        path: ["day"],
      });
    }
    if (hasEmpty) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please enter your birth date.",
        path: ["day"],
      });
      return;
    }
  });
export type BirthDateForm = z.infer<typeof BirthDateSchema>;

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

export const BirthDate = () => {
  const {
    register,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useFormContext<Step1Data>();

  const year = watch("birth_date_fields.year");
  const month = watch("birth_date_fields.month");
  // reset ziua și touched când se schimbă year sau month
  useEffect(() => {
    setValue("birth_date_fields.day", "", { shouldValidate: false });
    setValue("birth_date_fields.touched", false, { shouldValidate: false });
  }, [year, month, setValue]);

  // construiește array-ul de zile pentru luna selectată
  const [days, setDays] = useState<number[]>([]);
  useEffect(() => {
    const y = parseInt(year, 10);
    const m = parseInt(month, 10);
    if (!isNaN(y) && !isNaN(m)) {
      const total = new Date(y, m, 0).getDate();
      setDays(Array.from({ length: total }, (_, i) => i + 1));
    } else {
      setDays([]);
    }
  }, [year, month]);

  // când alegi ziua: marchează touched și rulează validarea Zod
  const handleDayChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setValue("birth_date_fields.day", e.target.value, {
      shouldValidate: false,
    });
    setValue("birth_date_fields.touched", true, { shouldValidate: false });
    trigger("birth_date_fields");
  };

  // la blur-ul întregului grup: marchează touched și validează
  const handleGroupBlur = (e: FocusEvent<HTMLDivElement>) => {
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setValue("birth_date_fields.touched", true, { shouldValidate: false });
    trigger("birth_date_fields");
  };

  return (
    <div className="birth_date">
      <div className="header">
        <label>Birth Date:</label>
        <p>
          This will not be shown publicly. Confirm your own age, even if this
          account is for a business, a pet, or something else.
        </p>
      </div>
      <div className="group-fields" onBlur={handleGroupBlur} tabIndex={-1}>
        <div className="form-column">
          <label htmlFor="year">Year</label>
          <select id="year" {...register("birth_date_fields.year")}>
            <option value="" />
            {Array.from({ length: 100 }, (_, i) => {
              const y = new Date().getFullYear() - i;
              return (
                <option key={y} value={y}>
                  {y}
                </option>
              );
            })}
          </select>
        </div>

        <div className="form-column">
          <label htmlFor="month">Month</label>
          <select id="month" {...register("birth_date_fields.month")}>
            <option value="" />
            {monthNames.map((name, i) => (
              <option key={i} value={i + 1}>
                {name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-column">
          <label htmlFor="day">Day</label>
          <select
            id="day"
            {...register("birth_date_fields.day")}
            onChange={handleDayChange}
          >
            <option value="" />
            {days.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          {errors.birth_date_fields?.day && (
            <p className="text-danger">
              {errors.birth_date_fields.day.message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BirthDate;
