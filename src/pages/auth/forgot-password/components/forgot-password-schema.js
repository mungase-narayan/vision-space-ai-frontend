import { z } from "zod";

export const forgotPasswordSchema = z.object({
  email: z
    .string({
      required_error: "Please enter email address.",
    })
    .email(),
});
