import { z } from "zod";

export const signUpFormSchema = z
  .object({
    fullName: z
      .string()
      .min(2, { message: "Full name must be at least 2 characters." })
      .max(30, { message: "Full name must not be longer than 30 characters." }),

    email: z
      .string({ required_error: "Please enter valid email address." })
      .email({ message: "Invalid email address." }),

    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters." })
      .max(30, { message: "Password must not be longer than 30 characters." }),

    confirmPassword: z
      .string()
      .min(8, { message: "Password must be at least 8 characters." })
      .max(30, { message: "Password must not be longer than 30 characters." }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });
