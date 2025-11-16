import { useState, useEffect, type KeyboardEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, CheckCircle2, Pill, AlertTriangle, FileText, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Medication } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedMedication, setSelectedMedication] = useState<Medication | null>(null);

  const { data: curatedMedications, isLoading: curatedLoading, isError: curatedError } = useQuery<Medication[]>({
    queryKey: ["/api/medications"],
  });

  const { data: searchResults, isLoading: searchLoading, isError: searchError } = useQuery<Medication[]>({
    queryKey: ["/api/medications/search", debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery || debouncedQuery.trim().length < 2) return [];
      const response = await fetch(`/api/medications/search?q=${encodeURIComponent(debouncedQuery)}`);
      if (!response.ok) throw new Error("Search failed");
      return response.json();
    },
    enabled: debouncedQuery.trim().length >= 2,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const displayMedications = searchQuery.trim().length >= 2 
    ? searchResults || []
    : curatedMedications || [];

  const isLoading = searchQuery.trim().length >= 2 ? searchLoading : curatedLoading;
  const isError = searchQuery.trim().length >= 2 ? searchError : curatedError;

  const handleSearchAgain = () => {
    setSelectedMedication(null);
  };

  const allMedicationNames = curatedMedications?.map(med => med.genericName).slice(0, 5) || [];

  const handleCardClick = (med: Medication) => {
    setSelectedMedication(med);
  };

  const handleCardKeyDown = (e: KeyboardEvent<HTMLDivElement>, med: Medication) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setSelectedMedication(med);
    }
  };

  if (selectedMedication) {
    return (
      <div className="min-h-screen bg-background py-6 px-4">
        <div className="mx-auto max-w-3xl">
          <Card className="shadow-md">
            <CardHeader className="space-y-1 pb-4">
              <h1 className="text-3xl font-bold text-primary">
                {selectedMedication.genericName}
              </h1>
              {selectedMedication.brandNames && (
                <p className="text-base text-muted-foreground">
                  Brand Names: {selectedMedication.brandNames}
                </p>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-chart-2 mt-0.5 flex-shrink-0" aria-hidden="true" />
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold text-foreground">Primary Use</h2>
                    <p className="text-base text-foreground" data-testid="text-primary-use">
                      {selectedMedication.primaryUse}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-start gap-3">
                  <Pill className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" aria-hidden="true" />
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold text-foreground">How to Take</h2>
                    <p className="text-base text-foreground" data-testid="text-how-to-take">
                      {selectedMedication.howToTake}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-start gap-3 rounded-md bg-destructive/10 border border-destructive p-4">
                  <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" aria-hidden="true" />
                  <div className="flex-1">
                    <h2 className="text-lg font-bold text-destructive">Important Warnings</h2>
                    <p className="text-base font-semibold text-destructive" data-testid="text-warnings">
                      {selectedMedication.warnings}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" aria-hidden="true" />
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold text-foreground">Common Side Effects</h2>
                    <p className="text-base text-muted-foreground" data-testid="text-side-effects">
                      {selectedMedication.sideEffects}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Button
                  onClick={handleSearchAgain}
                  size="lg"
                  className="w-full sm:w-auto min-h-11"
                  data-testid="button-search-again"
                >
                  Search Again
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-6 px-4">
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="text-center space-y-2 py-4">
          <h1 className="text-3xl sm:text-4xl font-bold text-primary">
            Hope Street Health - Medication Lookup
          </h1>
          <p className="text-base text-muted-foreground">
            Quick medication information for patients and staff
          </p>
        </header>

        <Card className="shadow-md">
          <CardContent className="pt-6 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
              <Input
                type="search"
                placeholder="Search any medication..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 text-base"
                autoFocus
                data-testid="input-search"
                aria-label="Search for medications"
              />
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Search for any medication by name or brand
            </p>
          </CardContent>
        </Card>

        {isLoading ? (
          <Card className="shadow-md">
            <CardContent className="pt-6 space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        ) : isError ? (
          <Card className="shadow-md">
            <CardContent className="pt-6 space-y-4 text-center">
              <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-2" />
              <p className="text-base text-foreground font-semibold" data-testid="text-error">
                Unable to load medications
              </p>
              <p className="text-sm text-muted-foreground">
                We're having trouble connecting to the medication database. Please try refreshing the page or contact clinic staff for assistance.
              </p>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                className="min-h-9"
                data-testid="button-reload"
              >
                Refresh Page
              </Button>
            </CardContent>
          </Card>
        ) : searchQuery && displayMedications.length === 0 ? (
          <Card className="shadow-md">
            <CardContent className="pt-6 space-y-4 text-center">
              <p className="text-base text-muted-foreground" data-testid="text-no-results">
                No medication found for "{searchQuery}"
              </p>
              <div className="pt-2">
                <p className="text-sm font-semibold text-foreground mb-3">
                  Try one of these common medications:
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {allMedicationNames.map((name) => (
                    <Button
                      key={name}
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const med = curatedMedications?.find((m: Medication) => m.genericName === name);
                        if (med) setSelectedMedication(med);
                      }}
                      className="min-h-9"
                      data-testid={`button-medication-${name.toLowerCase()}`}
                    >
                      {name}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ) : displayMedications.length > 0 ? (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground px-1">
              {searchQuery ? `Search Results (${displayMedications.length})` : `Available Medications (${displayMedications.length})`}
            </h2>
            <div className="space-y-3">
              {displayMedications.map((med: Medication) => (
                <Card
                  key={med.id}
                  role="button"
                  tabIndex={0}
                  className="shadow-sm hover-elevate active-elevate-2 cursor-pointer transition-shadow focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  onClick={() => handleCardClick(med)}
                  onKeyDown={(e) => handleCardKeyDown(e, med)}
                  aria-label={`View details for ${med.genericName}`}
                  data-testid={`card-medication-${med.genericName.toLowerCase()}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="text-xl font-bold text-primary">
                        {med.genericName}
                      </h3>
                      {med.source === "curated" && (
                        <Badge variant="secondary" className="flex items-center gap-1 shrink-0">
                          <Star className="h-3 w-3" />
                          Curated
                        </Badge>
                      )}
                    </div>
                    {med.brandNames && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {med.brandNames}
                      </p>
                    )}
                    <p className="text-base text-foreground">
                      {med.primaryUse}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
