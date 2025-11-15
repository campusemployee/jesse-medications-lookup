import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { promises as fs } from "fs";
import path from "path";
import type { Medication } from "@shared/schema";

async function loadMedicationsFromCSV(): Promise<Medication[]> {
  try {
    const csvPath = path.join(process.cwd(), "server", "medications.csv");
    const csvContent = await fs.readFile(csvPath, "utf-8");
    const lines = csvContent.trim().split("\n");
    const headers = lines[0].split(",");
    
    const medications: Medication[] = lines.slice(1).map(line => {
      const values: string[] = [];
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
      
      return {
        id: values[0],
        genericName: values[1],
        brandNames: values[2],
        primaryUse: values[3],
        howToTake: values[4],
        warnings: values[5],
        sideEffects: values[6],
      };
    });
    
    return medications;
  } catch (error) {
    console.error("Error loading medications CSV:", error);
    return [];
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  const medications = await loadMedicationsFromCSV();
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
