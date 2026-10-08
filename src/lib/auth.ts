import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    },
  },
  user: {
    additionalFields: {
      streak: {
        type: "number",
        defaultValue: 0,
        input: false,
      },
      lastQuizDate: {
        type: "date",
        required: false,
        input: false,
      },
      totalScore: {
        type: "number",
        defaultValue: 0,
        input: false,
      },
      quizzesTaken: {
        type: "number",
        defaultValue: 0,
        input: false,
      },
    },
  },
});
