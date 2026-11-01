import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  ClipboardList,
  FileText,
  Plus,
  Printer,
  Search,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import {
  doctorPatientsApi,
  type DoctorPatient,
  type MedicalRecord,
  type PrescriptionMedication,
} from "@/api/doctorPatientsApi";
import { getSession } from "@/api/authApi";
import { DashboardShell } from "@/components/dashboard/shell";
import { Avatar, doctorPersona } from "@/components/dashboard/common";
import { EmptyState } from "@/components/dashboard/states";
import { GlassCard } from "@/components/ui/glass-card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { doctorNav } from "@/lib/nav";

export const Route = createFileRoute("/doctor/patients")({
  head: () => ({
    meta: [
      { title: "Patient Records — MediAI Care" },
      { name: "description", content: "Electronic medical records for your patients." },
      { property: "og:title", content: "Patient Records — MediAI Care" },
      { property: "og:description", content: "Search patients and review their EMR." },
    ],
  }),
  component: PatientsPage,
});

const emptyMedication = (): PrescriptionMedication => ({
  name: "",
  dosage: "",
  frequency: "",
  duration: "",
  instructions: "",
});

function formatDate(value: string | null) {
  if (!value) return "Not recorded";
  const date = new Date(value.length === 10 ? `${value}T00:00:00` : value);
  return Number.isNaN(date.getTime())
    ? "Not recorded"
    : date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function avatarHue(id: string) {
  return [...id].reduce((hue, char) => (hue * 31 + char.charCodeAt(0)) % 360, 0);
}

function PatientsPage() {
  const [patients, setPatients] = useState<DoctorPatient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [printingRecordId, setPrintingRecordId] = useState<string | null>(null);
  const [symptoms, setSymptoms] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [tests, setTests] = useState("");
  const [instructions, setInstructions] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [medications, setMedications] = useState<PrescriptionMedication[]>([]);

  const selectedPatient = patients.find((patient) => patient.id === selectedPatientId) ?? null;
  const filteredPatients = useMemo(
    () => patients.filter((patient) => patient.name.toLowerCase().includes(query.toLowerCase())),
    [patients, query],
  );

  const loadPatients = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const loadedPatients = await doctorPatientsApi.list();
      setPatients(loadedPatients);
      setSelectedPatientId((current) =>
        loadedPatients.some((patient) => patient.id === current)
          ? current
          : loadedPatients[0]?.id ?? "",
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not load patients";
      setLoadError(message);
      toast.error("Could not load patients", { description: message });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPatients();
  }, [loadPatients]);

  useEffect(() => {
    if (!selectedPatientId) {
      setRecords([]);
      return;
    }
    let active = true;
    setRecords([]);
    setRecordsLoading(true);
    doctorPatientsApi
      .records(selectedPatientId)
      .then((loadedRecords) => {
        if (active) setRecords(loadedRecords);
      })
      .catch((error: unknown) => {
        if (!active) return;
        toast.error("Could not load patient history", {
          description: error instanceof Error ? error.message : "Please try again",
        });
        setRecords([]);
      })
      .finally(() => {
        if (active) setRecordsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [selectedPatientId]);

  useEffect(() => {
    if (!printingRecordId) return;
    const timer = window.setTimeout(() => window.print(), 100);
    const clearPrintingState = () => setPrintingRecordId(null);
    window.addEventListener("afterprint", clearPrintingState);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("afterprint", clearPrintingState);
    };
  }, [printingRecordId]);

  const resetForm = () => {
    setSymptoms("");
    setDiagnosis("");
    setTests("");
    setInstructions("");
    setFollowUpDate("");
    setMedications([]);
  };

  const updateMedication = (
    index: number,
    field: keyof PrescriptionMedication,
    value: string,
  ) => {
    setMedications((current) =>
      current.map((medication, medicationIndex) =>
        medicationIndex === index ? { ...medication, [field]: value } : medication,
      ),
    );
  };

  const saveRecord = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedPatient || saving) return;
    setSaving(true);
    try {
      const record = await doctorPatientsApi.createRecord(selectedPatient.id, {
        symptoms,
        diagnosis,
        recommendedTests: tests
          .split(/\r?\n|,/)
          .map((test) => test.trim())
          .filter(Boolean),
        medications,
        instructions,
        followUpDate,
      });
      setRecords((current) => [record, ...current]);
      setPatients((current) =>
        current.map((patient) =>
          patient.id === selectedPatient.id
            ? {
                ...patient,
                recordCount: patient.recordCount + 1,
                lastVisit: record.createdAt.slice(0, 10),
              }
            : patient,
        ),
      );
      resetForm();
      toast.success("Visit saved to the patient's record");
    } catch (error) {
      toast.error("Could not save patient record", {
        description: error instanceof Error ? error.message : "Please try again",
      });
    } finally {
      setSaving(false);
    }
  };

  const doctorName = getSession()?.name ?? "Attending clinician";

  return (
    <DashboardShell
      title="Patient records"
      subtitle="Review medical history and document each visit"
      nav={doctorNav}
      role="Doctor"
      persona={doctorPersona}
    >
      <style>{`
        @media print {
          @page { margin: 16mm; }
          body * { visibility: hidden !important; }
          .prescription-print[data-printing="true"],
          .prescription-print[data-printing="true"] * { visibility: visible !important; }
          .prescription-print[data-printing="true"] {
            position: fixed !important;
            inset: 0 auto auto 0 !important;
            width: 100% !important;
            max-height: none !important;
            overflow: visible !important;
            border: 0 !important;
            border-radius: 0 !important;
            background: #fff !important;
            color: #111 !important;
            box-shadow: none !important;
          }
          .prescription-print[data-printing="true"] button { display: none !important; }
        }
      `}</style>
      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <GlassCard className="p-3">
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search patients"
              className="rounded-xl pl-9"
              aria-label="Search patients"
            />
          </div>
          {loading ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Loading patients…</p>
          ) : loadError ? (
            <div className="py-6 text-center">
              <p className="text-sm text-destructive">{loadError}</p>
              <Button variant="outline" size="sm" className="mt-3" onClick={() => void loadPatients()}>
                Try again
              </Button>
            </div>
          ) : filteredPatients.length ? (
            <div className="max-h-[600px] space-y-1 overflow-y-auto">
              {filteredPatients.map((patient) => (
                <button
                  key={patient.id}
                  disabled={saving}
                  onClick={() => {
                    resetForm();
                    setSelectedPatientId(patient.id);
                  }}
                  className={`flex w-full items-center gap-3 rounded-xl p-2 text-left transition-colors ${
                    selectedPatientId === patient.id ? "bg-primary/12" : "hover:bg-accent/50"
                  }`}
                >
                  {patient.profilePhoto ? (
                    <img
                      src={patient.profilePhoto}
                      alt={`${patient.name} patient image`}
                      className="h-[34px] w-[34px] shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <Avatar name={patient.name} hue={avatarHue(patient.id)} size={34} />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{patient.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {patient.age === null ? "Age not recorded" : `${patient.age} years`}
                      {patient.gender ? ` · ${patient.gender}` : ""}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <p className="px-3 py-8 text-center text-sm text-muted-foreground">
              {query ? "No patients match your search." : "Patients with appointments will appear here."}
            </p>
          )}
        </GlassCard>

        {!selectedPatient ? (
          <EmptyState
            icon={ClipboardList}
            title={loading ? "Loading patient records" : "No patient records yet"}
            description={
              loading
                ? "Your patient list is being loaded."
                : "Patients connected to your appointments will appear here."
            }
          />
        ) : (
          <div className="space-y-4">
            <GlassCard key={selectedPatient.id}>
              <div className="flex flex-wrap items-center gap-4">
                {selectedPatient.profilePhoto ? (
                  <img
                    src={selectedPatient.profilePhoto}
                    alt={`${selectedPatient.name} patient image`}
                    className="h-[60px] w-[60px] shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <Avatar
                    name={selectedPatient.name}
                    hue={avatarHue(selectedPatient.id)}
                    size={60}
                  />
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-display text-xl font-semibold">{selectedPatient.name}</p>
                  <p className="break-all text-sm text-muted-foreground">
                    {selectedPatient.email}
                    {selectedPatient.phone ? ` · ${selectedPatient.phone}` : ""}
                    {selectedPatient.address ? ` · ${selectedPatient.address}` : ""}
                  </p>
                </div>
                <Badge variant="secondary">Patient</Badge>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {[
                  ["Age", selectedPatient.age === null ? "Not recorded" : `${selectedPatient.age}`],
                  ["Gender", selectedPatient.gender ?? "Not recorded"],
                  ["Last visit", formatDate(selectedPatient.lastVisit)],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl bg-muted/50 p-3">
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="font-medium">{value}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge variant="outline">
                  {selectedPatient.recordCount} saved {selectedPatient.recordCount === 1 ? "visit" : "visits"}
                </Badge>
                {[
                  ...new Set(records.map((record) => record.diagnosis).filter(Boolean)),
                ].map((condition) => (
                  <Badge key={condition} variant="outline">{condition}</Badge>
                ))}
              </div>
            </GlassCard>

            <GlassCard hover={false}>
              <div className="mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <div>
                  <h2 className="font-display font-semibold">Document a visit</h2>
                  <p className="text-xs text-muted-foreground">
                    Add symptoms, treatment, prescriptions, tests, and follow-up instructions.
                  </p>
                </div>
              </div>
              <form className="space-y-4" onSubmit={(event) => void saveRecord(event)}>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-1.5 text-sm font-medium">
                    Symptoms <span className="text-destructive">*</span>
                    <Textarea
                      required
                      maxLength={3000}
                      rows={4}
                      value={symptoms}
                      onChange={(event) => setSymptoms(event.target.value)}
                      placeholder="Record the patient's reported symptoms and relevant observations"
                    />
                  </label>
                  <label className="space-y-1.5 text-sm font-medium">
                    Assessment / diagnosis
                    <Textarea
                      maxLength={2000}
                      rows={4}
                      value={diagnosis}
                      onChange={(event) => setDiagnosis(event.target.value)}
                      placeholder="Clinical assessment or diagnosis"
                    />
                  </label>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <h3 className="text-sm font-semibold">Prescription</h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setMedications((current) => [...current, emptyMedication()])}
                    >
                      <Plus className="h-4 w-4" />
                      Add medication
                    </Button>
                  </div>
                  {medications.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-border/70 px-3 py-4 text-sm text-muted-foreground">
                      No medication added. Add a medication to include it in the prescription.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {medications.map((medication, index) => (
                        <div
                          key={index}
                          className="grid gap-3 rounded-xl bg-muted/40 p-3 sm:grid-cols-2 xl:grid-cols-[1.2fr_0.8fr_1fr_0.8fr_auto]"
                        >
                          <Input
                            required
                            maxLength={120}
                            aria-label={`Medication ${index + 1} name`}
                            placeholder="Medication name"
                            value={medication.name}
                            onChange={(event) => updateMedication(index, "name", event.target.value)}
                          />
                          <Input
                            required
                            maxLength={80}
                            aria-label={`Medication ${index + 1} dosage`}
                            placeholder="Dosage"
                            value={medication.dosage}
                            onChange={(event) => updateMedication(index, "dosage", event.target.value)}
                          />
                          <Input
                            required
                            maxLength={120}
                            aria-label={`Medication ${index + 1} frequency`}
                            placeholder="Frequency"
                            value={medication.frequency}
                            onChange={(event) =>
                              updateMedication(index, "frequency", event.target.value)
                            }
                          />
                          <Input
                            required
                            maxLength={80}
                            aria-label={`Medication ${index + 1} duration`}
                            placeholder="Duration"
                            value={medication.duration}
                            onChange={(event) =>
                              updateMedication(index, "duration", event.target.value)
                            }
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label={`Remove medication ${index + 1}`}
                            onClick={() =>
                              setMedications((current) =>
                                current.filter((_, medicationIndex) => medicationIndex !== index),
                              )
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <Input
                            className="sm:col-span-2 xl:col-span-5"
                            maxLength={500}
                            aria-label={`Medication ${index + 1} instructions`}
                            placeholder="Medication-specific instructions (optional)"
                            value={medication.instructions}
                            onChange={(event) =>
                              updateMedication(index, "instructions", event.target.value)
                            }
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-1.5 text-sm font-medium">
                    Recommended tests
                    <Textarea
                      rows={3}
                      maxLength={3000}
                      value={tests}
                      onChange={(event) => setTests(event.target.value)}
                      placeholder={"One test per line (or separate tests with commas)"}
                    />
                  </label>
                  <label className="space-y-1.5 text-sm font-medium">
                    Patient instructions
                    <Textarea
                      rows={3}
                      maxLength={3000}
                      value={instructions}
                      onChange={(event) => setInstructions(event.target.value)}
                      placeholder="Care plan, lifestyle advice, and other recommendations"
                    />
                  </label>
                </div>
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <label className="space-y-1.5 text-sm font-medium">
                    Follow-up date
                    <Input
                      type="date"
                      value={followUpDate}
                      onChange={(event) => setFollowUpDate(event.target.value)}
                    />
                  </label>
                  <Button type="submit" disabled={saving || recordsLoading}>
                    {saving ? "Saving visit…" : "Save to patient history"}
                  </Button>
                </div>
              </form>
            </GlassCard>

            <GlassCard hover={false}>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="font-display font-semibold">Visit history</h2>
                  <p className="text-xs text-muted-foreground">Saved consultations and prescriptions</p>
                </div>
                <Badge variant="secondary">{records.length}</Badge>
              </div>
              {recordsLoading ? (
                <p className="py-5 text-center text-sm text-muted-foreground">Loading history…</p>
              ) : records.length === 0 ? (
                <p className="rounded-xl border border-dashed border-border/70 px-3 py-6 text-center text-sm text-muted-foreground">
                  No visits have been documented for this patient.
                </p>
              ) : (
                <div className="space-y-3">
                  {records.map((record) => (
                    <article
                      key={record.id}
                      className="prescription-print rounded-xl border border-border/70 bg-background/60 p-4"
                      data-printing={printingRecordId === record.id}
                    >
                      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-3">
                            {selectedPatient.profilePhoto && (
                              <img
                                src={selectedPatient.profilePhoto}
                                alt={`${selectedPatient.name} patient image`}
                                className="h-12 w-12 rounded-full object-cover"
                              />
                            )}
                            <div>
                              <p className="font-medium">
                                {record.diagnosis || "Consultation"} · {formatDate(record.createdAt)}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {selectedPatient.name} · Age {selectedPatient.age ?? "not recorded"} ·{" "}
                                {selectedPatient.gender ?? "Gender not recorded"} · Prescribed by {doctorName}
                              </p>
                            </div>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setPrintingRecordId(record.id)}
                        >
                          <Printer className="h-4 w-4" />
                          Print / Save PDF
                        </Button>
                      </div>
                      <div className="space-y-3 text-sm">
                        <section>
                          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            Symptoms
                          </h3>
                          <p className="mt-1 whitespace-pre-wrap">{record.symptoms}</p>
                        </section>
                        {record.diagnosis && (
                          <section>
                            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                              Assessment / diagnosis
                            </h3>
                            <p className="mt-1 whitespace-pre-wrap">{record.diagnosis}</p>
                          </section>
                        )}
                        {record.medications.length > 0 && (
                          <section>
                            <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                              Prescription
                            </h3>
                            <div className="space-y-1.5">
                              {record.medications.map((medication, index) => (
                                <div key={`${record.id}-${index}`} className="rounded-lg bg-muted/50 p-2">
                                  <p className="font-medium">
                                    {medication.name} · {medication.dosage}
                                  </p>
                                  <p className="text-muted-foreground">
                                    {medication.frequency} · {medication.duration}
                                  </p>
                                  {medication.instructions && (
                                    <p className="mt-1 text-muted-foreground">{medication.instructions}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </section>
                        )}
                        {record.recommendedTests.length > 0 && (
                          <section>
                            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                              Recommended tests
                            </h3>
                            <p className="mt-1">{record.recommendedTests.join(", ")}</p>
                          </section>
                        )}
                        {record.instructions && (
                          <section>
                            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                              Patient instructions
                            </h3>
                            <p className="mt-1 whitespace-pre-wrap">{record.instructions}</p>
                          </section>
                        )}
                        {record.followUpDate && (
                          <p className="text-muted-foreground">
                            Follow-up: {formatDate(record.followUpDate)}
                          </p>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </GlassCard>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
