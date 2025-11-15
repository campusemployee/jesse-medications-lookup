import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import type { Medication } from "@shared/schema";
import { promises as fs } from "fs";
import path from "path";

const OPENFDA_API_KEY = process.env.OPENFDA_API_KEY || "";
const OPENFDA_BASE_URL = "https://api.fda.gov/drug/label.json";

interface FDADrugLabel {
  openfda?: {
    generic_name?: string[];
    brand_name?: string[];
  };
  indications_and_usage?: string[];
  dosage_and_administration?: string[];
  warnings?: string[];
  adverse_reactions?: string[];
}

async function fetchMedicationFromFDA(genericName: string): Promise<Medication | null> {
  try {
    const searchQuery = encodeURIComponent(`openfda.generic_name:"${genericName}"`);
    const apiKeyParam = OPENFDA_API_KEY ? `&api_key=${OPENFDA_API_KEY}` : "";
    const url = `${OPENFDA_BASE_URL}?search=${searchQuery}&limit=1${apiKeyParam}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`FDA API error for ${genericName}: ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    if (!data.results || data.results.length === 0) {
      console.log(`No FDA data found for ${genericName}`);
      return null;
    }
    
    const result: FDADrugLabel = data.results[0];
    
    const extractText = (field: string[] | undefined): string => {
      if (!field || field.length === 0) return "";
      return field[0].replace(/<[^>]*>/g, "").trim().substring(0, 500);
    };
    
    const brandNameArray = result.openfda?.brand_name ?? [];
    const brandNames = brandNameArray.slice(0, 3).join(", ");
    
    const medication: Medication = {
      id: genericName.toLowerCase().replace(/\s+/g, "-"),
      genericName: result.openfda?.generic_name?.[0] || genericName,
      brandNames: brandNames,
      primaryUse: extractText(result.indications_and_usage) || "Consult healthcare provider for usage information",
      howToTake: extractText(result.dosage_and_administration) || "Follow your doctor's instructions",
      warnings: extractText(result.warnings) || "Consult your healthcare provider for warnings",
      sideEffects: extractText(result.adverse_reactions) || "Consult your healthcare provider for side effect information",
    };
    
    return medication;
  } catch (error) {
    console.error(`Error fetching medication ${genericName} from FDA:`, error);
    return null;
  }
}

async function loadMedicationsFromCSV(): Promise<Medication[]> {
  try {
    const csvPath = path.join(process.cwd(), "server", "medications.csv");
    const csvContent = await fs.readFile(csvPath, "utf-8");
    const lines = csvContent.trim().split("\n");
    
    const medications: Medication[] = lines.slice(1).map(line => {
      const values: (string | null)[] = [];
      let currentValue = "";
      let insideQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          insideQuotes = !insideQuotes;
        } else if (char === "," && !insideQuotes) {
          values.push(currentValue.trim());
          currentValue = "";
        } else {
          currentValue += char;
        }
      }
      values.push(currentValue.trim());
      
      const getField = (index: number): string => {
        return values[index] !== undefined ? values[index] as string : "";
      };
      
      return {
        id: getField(0),
        genericName: getField(1),
        brandNames: getField(2),
        primaryUse: getField(3),
        howToTake: getField(4),
        warnings: getField(5),
        sideEffects: getField(6),
      };
    });
    
    console.log(`✓ Loaded ${medications.length} medications from CSV fallback`);
    return medications;
  } catch (error) {
    console.error("Error loading medications CSV:", error);
    return [];
  }
}

function mergeMedicationData(fdaMed: Medication | null, csvMed: Medication | undefined): Medication | null {
  if (!csvMed && !fdaMed) return null;
  if (!csvMed) return fdaMed;
  if (!fdaMed) return csvMed;
  
  return {
    id: csvMed.id,
    genericName: csvMed.genericName,
    brandNames: csvMed.brandNames || fdaMed.brandNames || "",
    primaryUse: csvMed.primaryUse,
    howToTake: csvMed.howToTake,
    warnings: csvMed.warnings,
    sideEffects: csvMed.sideEffects,
  };
}

async function loadMedicationsHybrid(): Promise<Medication[]> {
  const csvMeds = await loadMedicationsFromCSV();

  console.log("Loading medications from openFDA API with CSV fallback...");
  const medications: Medication[] = [];
  
  for (const csvMed of csvMeds) {
    let fdaMed = await fetchMedicationFromFDA(csvMed.genericName);
    
    if (!fdaMed) {
      console.log(`  ⟳ Retrying ${csvMed.genericName}...`);
      await new Promise(resolve => setTimeout(resolve, 500));
      fdaMed = await fetchMedicationFromFDA(csvMed.genericName);
    }
    
    const mergedMed = mergeMedicationData(fdaMed, csvMed);
    
    if (mergedMed) {
      medications.push(mergedMed);
      if (fdaMed) {
        console.log(`✓ Loaded ${csvMed.genericName} from FDA (merged with CSV)`);
      } else {
        console.log(`✓ Loaded ${csvMed.genericName} from CSV only`);
      }
    }
    
    await new Promise(resolve => setTimeout(resolve, 150));
  }
  
  console.log(`Loaded ${medications.length}/${csvMeds.length} medications (FDA + CSV hybrid)`);
  return medications;
}

export async function registerRoutes(app: Express): Promise<Server> {
  const medications = await loadMedicationsHybrid();
  storage.setMedications(medications);

  app.get("/api/medications", async (_req, res) => {
    try {
      const allMedications = await storage.getAllMedications();
      res.json(allMedications);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch medications" });
    }
  });

  app.get("/api/medications/:id", async (req, res) => {
    try {
      const medication = await storage.getMedicationById(req.params.id);
      if (medication) {
        res.json(medication);
      } else {
        res.status(404).json({ error: "Medication not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch medication" });
    }
  });

  app.get("/api/medications/search/:query", async (req, res) => {
    try {
      const results = await storage.searchMedications(req.params.query);
      res.json(results);
    } catch (error) {
      res.status(500).json({ error: "Failed to search medications" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
