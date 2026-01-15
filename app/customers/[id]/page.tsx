"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Navbar } from "@/components/navbar";
import { formatDateTime } from "@/lib/utils";
import type { Customer, CustomerStatus } from "@/lib/types";

export default function CustomerDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    account_number: "",
    phone: "",
    nominee: "",
    nid: "",
    status: "active" as CustomerStatus,
    notes: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCustomer();
  }, [id]);

  const fetchCustomer = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/customers/${id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch customer");
      }

      setCustomer(data.data);
      setFormData({
        name: data.data.name,
        account_number: data.data.account_number,
        phone: data.data.phone,
        nominee: data.data.nominee || "",
        nid: data.data.nid || "",
        status: data.data.status,
        notes: data.data.notes || "",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch customer");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const response = await fetch(`/api/customers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update customer");
      }

      setCustomer(data.data);
      alert("Customer updated successfully");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update customer");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this customer?")) return;

    try {
      await fetch(`/api/customers/${id}`, { method: "DELETE" });
      router.push("/customers");
    } catch (err) {
      setError("Failed to delete customer");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
        </div>
      </div>
    );
  }

  if (error && !customer) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="mx-auto max-w-2xl px-4 py-8">
          <div className="rounded-md bg-red-50 p-4 text-red-800">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
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
            <CardTitle className="text-2xl">Edit Customer</CardTitle>
            <CardDescription>
              Created: {customer && formatDateTime(customer.created_at)} •{" "}
              Updated: {customer && formatDateTime(customer.updated_at)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
                  {error}
                </div>
              )}

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="account_number">Account Number *</Label>
                  <Input
                    id="account_number"
                    value={formData.account_number}
                    onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    id="status"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as CustomerStatus })}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="lead">Lead</option>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nominee">Nominee</Label>
                  <Input
                    id="nominee"
                    value={formData.nominee}
                    onChange={(e) => setFormData({ ...formData, nominee: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nid">NID</Label>
                  <Input
                    id="nid"
                    value={formData.nid}
                    onChange={(e) => setFormData({ ...formData, nid: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  rows={4}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>

              <div className="flex gap-3">
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
                <Link href="/customers">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  className="ml-auto"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
