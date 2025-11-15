import type { Medication } from "@shared/schema";

export interface IStorage {
  getAllMedications(): Promise<Medication[]>;
  getMedicationById(id: string): Promise<Medication | undefined>;
  searchMedications(query: string): Promise<Medication[]>;
}

export class MemStorage implements IStorage {
  private medications: Map<string, Medication>;

  constructor() {
    this.medications = new Map();
  }

  setMedications(medications: Medication[]) {
    this.medications.clear();
    medications.forEach(med => {
      this.medications.set(med.id, med);
    });
  }

  async getAllMedications(): Promise<Medication[]> {
    return Array.from(this.medications.values());
  }

  async getMedicationById(id: string): Promise<Medication | undefined> {
    return this.medications.get(id);
  }

  async searchMedications(query: string): Promise<Medication[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.medications.values()).filter(med =>
      med.genericName.toLowerCase().includes(lowerQuery) ||
      med.brandNames.toLowerCase().includes(lowerQuery)
    );
  }
}

export const storage = new MemStorage();
