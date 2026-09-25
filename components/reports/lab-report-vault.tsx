"use client";

import * as React from "react";
import {
  Upload,
  FileText,
  Download,
  Trash2,
  Calendar,
  Building,
  Plus,
  Search,
  FileCheck,
  Eye,
  FileBadge,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { LabReport, LabReportCategory } from "@/types";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface LabReportVaultProps {
  initialReports: LabReport[];
}

const CATEGORY_MAP: Record<LabReportCategory, { label: string; color: string }> = {
  hba1c: { label: "HbA1c Panel", color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  blood_glucose: { label: "Glucose / OGTT", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  lipid_panel: { label: "Lipid Profile", color: "bg-amber-50 text-amber-700 border-amber-200" },
  kidney_function: { label: "Kidney Function", color: "bg-cyan-50 text-cyan-700 border-cyan-200" },
  liver_panel: { label: "Liver Panel", color: "bg-rose-50 text-rose-700 border-rose-200" },
  prescription: { label: "Doctor Rx", color: "bg-teal-50 text-teal-700 border-teal-200" },
  doctor_notes: { label: "Clinical Notes", color: "bg-purple-50 text-purple-700 border-purple-200" },
  other: { label: "General Diagnostic", color: "bg-slate-100 text-slate-700 border-slate-200" },
};

export function LabReportVault({ initialReports }: LabReportVaultProps) {
  const router = useRouter();
  const [reports, setReports] = React.useState<LabReport[]>(initialReports);
  const [activeCategory, setActiveCategory] = React.useState<string>("all");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [uploadModalOpen, setUploadModalOpen] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<LabReport | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [previewTarget, setPreviewTarget] = React.useState<LabReport | null>(null);

  // Form State
  const [title, setTitle] = React.useState("");
  const [doctorOrLab, setDoctorOrLab] = React.useState("");
  const [category, setCategory] = React.useState<LabReportCategory>("hba1c");
  const [date, setDate] = React.useState(new Date().toISOString().split("T")[0]);
  const [summaryMetrics, setSummaryMetrics] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [fileUrl, setFileUrl] = React.useState<string | undefined>(undefined);
  const [fileName, setFileName] = React.useState<string | undefined>(undefined);
  const [fileSize, setFileSize] = React.useState<string | undefined>(undefined);
  const [fileType, setFileType] = React.useState<string | undefined>(undefined);
  const [isUploading, setIsUploading] = React.useState(false);

  const resetForm = () => {
    setTitle("");
    setDoctorOrLab("");
    setCategory("hba1c");
    setDate(new Date().toISOString().split("T")[0]);
    setSummaryMetrics("");
    setNotes("");
    setFileUrl(undefined);
    setFileName(undefined);
    setFileSize(undefined);
    setFileType(undefined);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File exceeds maximum allowed size (10 MB)");
      return;
    }

    setFileName(file.name);
    setFileType(file.type);
    setFileSize(
      file.size < 1024 * 1024
        ? `${Math.round(file.size / 1024)} KB`
        : `${(file.size / (1024 * 1024)).toFixed(1)} MB`
    );

    const reader = new FileReader();
    reader.onload = (event) => {
      setFileUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !doctorOrLab || !date) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setIsUploading(true);
      const res = await fetch("/api/lab-reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          doctorOrLab,
          category,
          date,
          summaryMetrics: summaryMetrics || undefined,
          notes: notes || undefined,
          fileUrl,
          fileName: fileName || "Diagnostic_Document.pdf",
          fileSize: fileSize || "540 KB",
          fileType: fileType || "application/pdf",
        }),
      });

      if (!res.ok) throw new Error("Failed to save lab report");
      const data = await res.json();

      setReports((prev) => [data.report, ...prev]);
      toast.success("Document added to Vault", {
        description: `${data.report.title} from ${data.report.doctorOrLab}`,
      });

      setUploadModalOpen(false);
      resetForm();
      router.refresh();
    } catch {
      toast.error("Failed to upload lab report. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      const res = await fetch(`/api/lab-reports/${deleteTarget.id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete report");
      setReports((prev) => prev.filter((r) => r.id !== deleteTarget.id));
      toast.success("Report removed from vault");
      setDeleteTarget(null);
      router.refresh();
    } catch {
      toast.error("Failed to delete report");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDownload = (report: LabReport) => {
    if (report.fileUrl) {
      const a = document.createElement("a");
      a.href = report.fileUrl;
      a.download = report.fileName || `${report.title.replace(/\s+/g, "_")}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success("Download started", { description: report.fileName || report.title });
    } else {
      // Generate a structured printable document preview
      setPreviewTarget(report);
    }
  };

  const filteredReports = reports.filter((rep) => {
    const matchesCategory = activeCategory === "all" || rep.category === activeCategory;
    const matchesSearch =
      searchQuery.trim() === "" ||
      rep.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rep.doctorOrLab.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (rep.summaryMetrics && rep.summaryMetrics.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (rep.notes && rep.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Vault Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Diagnostic & Laboratory Document Vault</span>
            <Badge variant="outline" className="text-xs bg-indigo-50 text-indigo-700 border-indigo-200">
              {reports.length} Records
            </Badge>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Store, catalog, and access previous doctor-based prescriptions, HbA1c lab panels, and lipid profiles.
          </p>
        </div>

        <Button
          onClick={() => {
            resetForm();
            setUploadModalOpen(true);
          }}
          className="shadow-sm gap-1.5"
        >
          <Upload className="h-4 w-4" />
          <span>Upload Lab Document</span>
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {[
            { id: "all", label: "All Documents" },
            { id: "hba1c", label: "HbA1c Panels" },
            { id: "lipid_panel", label: "Lipids" },
            { id: "prescription", label: "Prescriptions (Rx)" },
            { id: "blood_glucose", label: "Glucose / OGTT" },
            { id: "other", label: "Other" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-colors ${
                activeCategory === tab.id
                  ? "bg-indigo-700 text-white shadow-xs"
                  : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative min-w-[200px] md:max-w-xs">
          <Input
            placeholder="Search lab or metrics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 text-xs h-9"
          />
          <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-3 pointer-events-none" />
        </div>
      </div>

      {/* Document Grid / List */}
      {filteredReports.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="h-12 w-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 flex items-center justify-center mx-auto">
            <FileText className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No diagnostic documents found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            {searchQuery
              ? "No lab reports match your search query."
              : "Upload your laboratory test sheets, physician consultation notes, or blood panels to keep everything safely organized."}
          </p>
          <Button
            size="sm"
            onClick={() => {
              resetForm();
              setUploadModalOpen(true);
            }}
            className="mt-2"
          >
            <Plus className="h-3.5 w-3.5" />
            Upload First Document
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredReports.map((report) => {
            const catInfo = CATEGORY_MAP[report.category] || CATEGORY_MAP.other;

            return (
              <Card
                key={report.id}
                className="shadow-xs hover:border-indigo-200 dark:hover:border-indigo-800 transition-all border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden flex flex-col justify-between"
              >
                <CardContent className="p-5 space-y-3.5 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                        <FileBadge className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${catInfo.color}`}
                          >
                            {catInfo.label}
                          </span>
                          <span className="text-xs text-slate-400 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(report.date)}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1 leading-snug">
                          {report.title}
                        </h4>
                        <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1 mt-0.5">
                          <Building className="h-3 w-3 text-slate-400" />
                          {report.doctorOrLab}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Key Metrics Highlight Banner */}
                  {report.summaryMetrics && (
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700 text-xs">
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-0.5">
                        Extracted Metrics
                      </span>
                      <p className="font-semibold text-indigo-950 dark:text-indigo-300 font-mono text-[11px]">
                        {report.summaryMetrics}
                      </p>
                    </div>
                  )}

                  {/* Notes */}
                  {report.notes && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 italic bg-amber-50/50 dark:bg-amber-950/20 p-2 rounded-lg border border-amber-100 dark:border-amber-900/40">
                      &quot;{report.notes}&quot;
                    </p>
                  )}

                  {/* Attachment metadata */}
                  {report.fileName && (
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 pt-1">
                      <FileCheck className="h-3.5 w-3.5 text-emerald-600" />
                      <span className="font-medium text-slate-600 truncate max-w-[200px]">
                        {report.fileName}
                      </span>
                      {report.fileSize && <span>({report.fileSize})</span>}
                    </div>
                  )}
                </CardContent>

                {/* Footer Actions */}
                <div className="px-5 py-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownload(report)}
                      className="text-xs h-8 gap-1.5"
                    >
                      {report.fileUrl ? (
                        <>
                          <Download className="h-3.5 w-3.5" />
                          <span>Download</span>
                        </>
                      ) : (
                        <>
                          <Eye className="h-3.5 w-3.5" />
                          <span>View Summary</span>
                        </>
                      )}
                    </Button>
                  </div>

                  <button
                    onClick={() => setDeleteTarget(report)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Remove report"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Upload Modal */}
      <Dialog open={uploadModalOpen} onOpenChange={setUploadModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
                <Upload className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle>Upload Lab or Doctor Report</DialogTitle>
                <DialogDescription>
                  Attach previous medical prescriptions, blood panels, or doctor notes.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="rep-title">Document Title *</Label>
              <Input
                id="rep-title"
                placeholder="e.g. Quarterly Glycated Hemoglobin (HbA1c) Panel"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="rep-doctor">Laboratory / Doctor Name *</Label>
                <Input
                  id="rep-doctor"
                  placeholder="e.g. Metropolis Lab, Dr. Jenkins"
                  value={doctorOrLab}
                  onChange={(e) => setDoctorOrLab(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="rep-category">Category</Label>
                <Select
                  id="rep-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as LabReportCategory)}
                >
                  <option value="hba1c">HbA1c & Glycated Hemoglobin</option>
                  <option value="blood_glucose">Blood Glucose & OGTT</option>
                  <option value="lipid_panel">Lipid Profile & Cholesterol</option>
                  <option value="kidney_function">Kidney Function & Microalbumin</option>
                  <option value="liver_panel">Liver Function Panel</option>
                  <option value="prescription">Prescription / Medication Slip</option>
                  <option value="doctor_notes">Clinical Consultation Notes</option>
                  <option value="other">Other Laboratory Diagnostics</option>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="rep-date">Test / Report Date *</Label>
                <Input
                  id="rep-date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="rep-metrics">Key Metrics Summary</Label>
                <Input
                  id="rep-metrics"
                  placeholder="e.g. HbA1c: 6.8%, Fasting: 112"
                  value={summaryMetrics}
                  onChange={(e) => setSummaryMetrics(e.target.value)}
                />
              </div>
            </div>

            {/* File Upload Attachment Box */}
            <div className="space-y-1.5">
              <Label htmlFor="rep-file">Attach File (PDF, PNG, JPG)</Label>
              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-4 text-center hover:bg-slate-50 transition-colors cursor-pointer relative">
                <input
                  id="rep-file"
                  type="file"
                  accept=".pdf,image/png,image/jpeg,image/jpg"
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <div className="space-y-1 pointer-events-none">
                  <Upload className="h-6 w-6 text-indigo-600 mx-auto" />
                  <p className="text-xs font-semibold text-slate-700">
                    {fileName ? (
                      <span className="text-emerald-700 font-bold">
                        ✓ {fileName} ({fileSize})
                      </span>
                    ) : (
                      "Click or drag document to attach"
                    )}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Supports PDF, PNG, JPG up to 10 MB
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="rep-notes">Physician Notes / Diagnostic Impression</Label>
              <Input
                id="rep-notes"
                placeholder="e.g. Dose unchanged, schedule follow-up in 90 days"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setUploadModalOpen(false)}
                disabled={isUploading}
              >
                Cancel
              </Button>
              <Button type="submit" isLoading={isUploading}>
                Save to Vault
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      {previewTarget && (
        <Dialog open={!!previewTarget} onOpenChange={(open) => !open && setPreviewTarget(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{previewTarget.title}</DialogTitle>
              <DialogDescription>
                {previewTarget.doctorOrLab} • {formatDate(previewTarget.date)}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Category:</span>
                  <span className="font-semibold text-slate-800">
                    {CATEGORY_MAP[previewTarget.category]?.label || "Diagnostic"}
                  </span>
                </div>
                {previewTarget.summaryMetrics && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Key Metrics:</span>
                    <span className="font-mono font-bold text-indigo-900">
                      {previewTarget.summaryMetrics}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500">Document Name:</span>
                  <span className="font-semibold text-slate-800">
                    {previewTarget.fileName || "Summary.pdf"}
                  </span>
                </div>
              </div>

              {previewTarget.notes && (
                <div className="text-xs text-slate-600 bg-amber-50 p-3 rounded-xl border border-amber-200">
                  <strong className="block text-slate-800 mb-1">Clinical Notes:</strong>
                  {previewTarget.notes}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button onClick={() => setPreviewTarget(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Remove Document from Vault"
        description="Are you sure you want to delete this lab report? This action cannot be undone."
        confirmLabel="Delete Report"
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </div>
  );
}

