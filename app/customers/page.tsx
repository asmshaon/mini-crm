"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, Plus, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/navbar";
import { formatDate, getStatusColor, debounce } from "@/lib/utils";
import type { Customer } from "@/lib/types";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/dialog";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    customerId: string | null;
    customerName: string;
  }>({
    isOpen: false,
    customerId: null,
    customerName: "",
  });

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/customers?search=${search}&page=${page}&limit=10`
      );
      const data = await response.json();
      setCustomers(data.data || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotal(data.pagination?.total || 0);
    } catch (error) {
      console.error("Failed to fetch customers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [page]);

  const debouncedSearch = debounce((value: string) => {
    setSearch(value);
    setPage(1);
    fetchCustomers();
  }, 300);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    debouncedSearch(value);
  };

  const handleDelete = (id: string, name: string) => {
    setDeleteDialog({ isOpen: true, customerId: id, customerName: name });
  };

  const confirmDelete = async () => {
    const { customerId } = deleteDialog;
    if (!customerId) return;

    const toastId = toast.loading("Deleting customer...");

    try {
      const response = await fetch(`/api/customers/${customerId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        toast.error("Failed to delete customer", { id: toastId });
        setDeleteDialog({ isOpen: false, customerId: null, customerName: "" });
        return;
      }

      toast.success("Customer deleted successfully", { id: toastId });
      setDeleteDialog({ isOpen: false, customerId: null, customerName: "" });
      fetchCustomers();
    } catch {
      toast.error("Failed to delete customer", { id: toastId });
      setDeleteDialog({ isOpen: false, customerId: null, customerName: "" });
    }
  };

  const cancelDelete = () => {
    setDeleteDialog({ isOpen: false, customerId: null, customerName: "" });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
              <p className="text-gray-600">
                {total} {total === 1 ? "customer" : "customers"} found
              </p>
            </div>
            <Link href="/customers/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Customer
              </Button>
            </Link>
          </div>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <Input
              type="search"
              placeholder="Search by name, account number, phone, nominee, or NID..."
              className="pl-10"
              onChange={handleSearchChange}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
          </div>
        ) : customers.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500">No customers found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {customers.map((customer) => (
              <Card
                key={customer.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{customer.name}</CardTitle>
                      <p className="text-sm text-gray-600">
                        {customer.account_number}
                      </p>
                    </div>
                    <Badge
                      variant={customer.status as any}
                      className={getStatusColor(customer.status)}
                    >
                      {customer.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center text-sm">
                    <span className="font-medium text-gray-700 w-24">
                      Phone:
                    </span>
                    <span className="text-gray-900">{customer.phone}</span>
                  </div>
                  {customer.nominee && (
                    <div className="flex items-center text-sm">
                      <span className="font-medium text-gray-700 w-24">
                        Nominee:
                      </span>
                      <span className="text-gray-900">{customer.nominee}</span>
                    </div>
                  )}
                  {customer.nid && (
                    <div className="flex items-center text-sm">
                      <span className="font-medium text-gray-700 w-24">
                        NID:
                      </span>
                      <span className="text-gray-900">{customer.nid}</span>
                    </div>
                  )}
                  <div className="flex items-center text-sm">
                    <span className="font-medium text-gray-700 w-24">
                      Created:
                    </span>
                    <span className="text-gray-900">
                      {formatDate(customer.created_at)}
                    </span>
                  </div>
                  <div className="flex gap-2 pt-3">
                    <Link href={`/customers/${customer.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(customer.id, customer.name)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-8 flex justify-center gap-2">
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <span className="flex items-center px-4 text-sm">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        title="Delete Customer"
        description={`Are you sure you want to delete "${deleteDialog.customerName}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        variant="danger"
      />
    </div>
  );
}
