import { z } from "zod";

export interface Medication {
  id: string;
  genericName: string;
  brandNames: string;
  primaryUse: string;
  howToTake: string;
  warnings: string;
  sideEffects: string;
}

export const medicationSchema = z.object({
  id: z.string(),
  genericName: z.string(),
  brandNames: z.string(),
  primaryUse: z.string(),
  howToTake: z.string(),
  warnings: z.string(),
  sideEffects: z.string(),
});

export type MedicationType = z.infer<typeof medicationSchema>;
