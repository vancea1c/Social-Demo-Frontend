import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const today = new Date();
const min18 = new Date(
  today.getFullYear() - 18,
  today.getMonth(),
  today.getDate()
);

const BirthDateSchema = z
  .object({
    year: z.string().nonempty({ message: "Select year." }),
    month: z.string().nonempty({ message: "Select month." }),
    day: z.string().nonempty({ message: "Select day." }),
  })
  .superRefine((val, ctx) => {
    const { year, month, day } = val;
    const y = parseInt(year);
    const m = parseInt(month);
    const d = parseInt(day);

    const birth_date = new Date(y, m - 1, d);
    if (birth_date > min18) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "You must be at least 18 years old.",
        path: ["day"],
      });
    }
  });

type BirthDateForm = z.infer<typeof BirthDateSchema>;

const BirthDate = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<BirthDateForm>({
    mode: "onChange",
    resolver: zodResolver(BirthDateSchema),
  });

  // urmarim valorile selectate in formular
  const watchYear = watch("year");
  const watchMonth = watch("month");
  //lista de zile in functie de luna si an
  const [days, setDays] = useState<number[]>([]);

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

  // Funcție pt a obține nr de zile într-o lună dată
  const getDaysInMonth = (year: number, month: number): number => {
    // 0 = ultima zi din luna, (28, 29, 30, 31)
    return new Date(year, month, 0).getDate();
  };

  // useEffect care se declanșează când an sau lună se schimbă
  useEffect(() => {
    if (watchYear && watchMonth) {
      const year = parseInt(watchYear, 10);
      const month = parseInt(watchMonth, 10);
      const totalDays = getDaysInMonth(year, month);
      // Creăm un array cu numerele de la 1 la totalDays
      const daysArray = Array.from({ length: totalDays }, (_, i) => i + 1);
      setDays(daysArray);
    } else {
      setDays([]);
    }
  }, [watchYear, watchMonth]);

  const onSubmit = (data: BirthDateForm) => {
    console.log("Valid data:", data);
  };

  // Generăm lista de ani (ultimii 100 de ani)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) =>
    (currentYear - i).toString()
  );
  const months = monthNames.map((name, i) => ({
    value: (i + 1).toString(),
    name,
  }));

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="birth_date">
        <label>Birth Date:</label>
        <p>
          This will not be shown publicly. Confirm your own age, even if this
          account is for a business, a pet, or something else.
        </p>
        <div className="form-column">
          <label htmlFor="year">Year</label>
          <select id="year" {...register("year")} autoFocus>
            <option value=""></option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          {errors.year && <p className="text-danger">{errors.year.message}</p>}
        </div>
        <div className="form-column">
          <label htmlFor="month">Month</label>
          <select id="month" {...register("month")} autoFocus>
            <option value=""></option>
            {months.map((month, i) => (
              <option key={month.value} value={month.value}>
                {month.name}
              </option>
            ))}
          </select>
          {errors.month && (
            <p className="text-danger">{errors.month.message}</p>
          )}
        </div>
        <div className="form-column">
          <label htmlFor="day">Day</label>
          <select id="day" {...register("day")} autoFocus>
            <option value=""></option>
            {days.map((day) => (
              <option key={day} value={day.toString()}>
                {day}
              </option>
            ))}
          </select>
          {errors.day && <p className="text-danger">{errors.day.message}</p>}
        </div>

        <button type="submit" disabled={!isValid}>
          Next
        </button>
      </div>
    </form>
  );
};

export default BirthDate;
