"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Navbar } from "@/components/navbar";
import type { ImportResult } from "@/lib/types";

export default function ImportPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      validateAndSetFile(droppedFile);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    const validTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "text/csv",
    ];
    const validExtensions = [".xlsx", ".xls", ".csv"];

    const extension = "." + selectedFile.name.split(".").pop()?.toLowerCase();

    if (
      !validTypes.includes(selectedFile.type) &&
      !validExtensions.includes(extension)
    ) {
      alert("Please upload a valid Excel or CSV file");
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      alert("File size must be less than 10MB");
      return;
    }

    setFile(selectedFile);
    setResult(null);
  };

  const handleImport = async () => {
    if (!file) return;

    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/customers/import", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Import failed");
      }

      setResult(data);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Import failed");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link href="/customers">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Customers
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Import Customers</CardTitle>
            <CardDescription>
              Import customers from Excel or CSV file. Required columns: name,
              account_number, phone. Optional columns: nominee, nid, status,
              notes.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!result ? (
              <>
                <div
                  className={`relative border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                    dragActive
                      ? "border-blue-400 bg-blue-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleFileChange}
                    accept=".xlsx,.xls,.csv"
                  />
                  <FileSpreadsheet className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-4 text-sm text-gray-600">
                    {file ? (
                      <span className="font-medium text-gray-900">
                        {file.name}
                      </span>
                    ) : (
                      <>
                        Drag and drop your file here, or{" "}
                        <span className="font-medium text-blue-600">
                          browse
                        </span>
                      </>
                    )}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    Supports .xlsx, .xls, .csv (max 10MB)
                  </p>
                </div>

                {file && (
                  <div className="flex gap-3">
                    <Button onClick={handleImport} disabled={loading}>
                      <Upload className="mr-2 h-4 w-4" />
                      {loading ? "Importing..." : "Import"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleReset}
                      disabled={loading}
                    >
                      Clear
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-3">
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <p className="text-3xl font-bold text-green-600">
                        {result.success}
                      </p>
                      <p className="text-sm text-gray-600">Imported</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <p className="text-3xl font-bold text-red-600">
                        {result.failed}
                      </p>
                      <p className="text-sm text-gray-600">Failed</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <p className="text-3xl font-bold text-gray-900">
                        {result.success + result.failed}
                      </p>
                      <p className="text-sm text-gray-600">Total</p>
                    </CardContent>
                  </Card>
                </div>

                {result.errors.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Errors</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="max-h-64 overflow-y-auto space-y-2">
                        {result.errors.map((error, index) => (
                          <div
                            key={index}
                            className="flex items-start gap-2 text-sm"
                          >
                            <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                            <div>
                              <span className="font-medium">
                                Row {error.row}:
                              </span>{" "}
                              <span className="text-gray-600">
                                {error.error}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {result.success > 0 && (
                  <div className="flex items-center gap-2 text-green-700 bg-green-50 p-4 rounded-md">
                    <CheckCircle2 className="h-5 w-5" />
                    <p>
                      {result.success} customer
                      {result.success > 1 ? "s were" : " was"} successfully
                      imported!
                    </p>
                  </div>
                )}

                <div className="flex gap-3">
                  <Link href="/customers" className="flex-1">
                    <Button className="w-full">View Customers</Button>
                  </Link>
                  <Button variant="outline" onClick={handleReset}>
                    Import More
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
