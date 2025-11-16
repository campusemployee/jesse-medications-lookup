import { z } from "zod";

export interface Medication {
  id: string;
  genericName: string;
  brandNames: string;
  primaryUse: string;
  howToTake: string;
  warnings: string;
  sideEffects: string;
  source?: "curated" | "fda";
}

export const medicationSchema = z.object({
  id: z.string(),
  genericName: z.string(),
  brandNames: z.string(),
  primaryUse: z.string(),
  howToTake: z.string(),
  warnings: z.string(),
  sideEffects: z.string(),
  source: z.enum(["curated", "fda"]).optional(),
});

export type MedicationType = z.infer<typeof medicationSchema>;
