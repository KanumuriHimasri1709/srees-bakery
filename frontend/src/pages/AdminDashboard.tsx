import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { RequireAdmin } from "../components/AuthGuard";
import { StatusBadge } from "../components/StatusBadge";
import { api } from "../services/api";
import { toast } from "sonner";
import {
  Shield,
  LayoutDashboard,
  ClipboardList,
  UtensilsCrossed,
  Image as ImageIcon,
  Tag,
  Users,
  BrainCircuit,
  LogOut,
  Eye,
  CheckCircle,
  X,
  Plus,
  Trash2,
  Edit2,
  RefreshCw,
  Search,
  Check,
  AlertCircle
} from "lucide-react";

export const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<
    "overview" | "enquiries" | "menu" | "gallery" | "offers" | "customers" | "rag"
  >("overview");

  // Overview stats
  const [overviewData, setOverviewData] = useState<any>(null);

  // Enquiries state
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [selectedEnquiry, setSelectedEnquiry] = useState<any | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [enquirySearch, setEnquirySearch] = useState<string>("");

  // Menu state
  const [menuProducts, setMenuProducts] = useState<any[]>([]);
  const [showProductModal, setShowProductModal] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [productForm, setProductForm] = useState({
    name: "",
    category: "Cakes",
    price: "",
    description: "",
    image_url: "",
    is_available: 1,
  });

  // Gallery state
  const [galleryItems, setGalleryItems] = useState<any[]>([]);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [galleryForm, setGalleryForm] = useState({
    src: "",
    label: "",
    category: "Cakes",
    ai_context: "",
  });

  // Offers state
  const [offers, setOffers] = useState<any[]>([]);
  const [offerForm, setOfferForm] = useState({
    title: "",
    description: "",
    discount_percent: 10,
    is_active: 1,
    terms: "",
  });

  // Customers state
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedCustomerEnquiries, setSelectedCustomerEnquiries] = useState<any[] | null>(null);
  const [viewingCustomerName, setViewingCustomerName] = useState<string>("");

  // RAG Knowledge state
  const [ragStatus, setRagStatus] = useState<any>(null);
  const [isRebuildingRag, setIsRebuildingRag] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  // Load active tab data
  const loadData = async () => {
    setIsLoading(true);
    try {
      if (activeTab === "overview") {
        const res = await api.adminGetOverview();
        if (res.success) setOverviewData(res);
      } else if (activeTab === "enquiries") {
        const res = await api.adminGetEnquiries({
          status: statusFilter !== "All" ? statusFilter : undefined,
          search: enquirySearch || undefined,
        });
        if (res.success) setEnquiries(res.enquiries);
      } else if (activeTab === "menu") {
        const res = await api.adminGetMenu();
        if (res.success) setMenuProducts(res.products);
      } else if (activeTab === "gallery") {
        const res = await api.adminGetGallery();
        if (res.success) setGalleryItems(res.gallery);
      } else if (activeTab === "offers") {
        const res = await api.adminGetOffers();
        if (res.success && res.offers.length > 0) {
          setOffers(res.offers);
          setOfferForm(res.offers[0]);
        }
      } else if (activeTab === "customers") {
        const res = await api.adminGetCustomers();
        if (res.success) setCustomers(res.customers);
      } else if (activeTab === "rag") {
        const res = await api.adminGetRagStatus();
        if (res.success) setRagStatus(res);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to load admin data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab, statusFilter, enquirySearch]);

  // Handle Enquiry Status Change
  const handleUpdateStatus = async (enquiryId: number, newStatus: string) => {
    try {
      const res = await api.adminUpdateEnquiryStatus(enquiryId, newStatus);
      if (res.success) {
        toast.success(res.message);
        setEnquiries((prev) =>
          prev.map((e) => (e.id === enquiryId ? { ...e, status: newStatus } : e))
        );
        if (selectedEnquiry && selectedEnquiry.id === enquiryId) {
          setSelectedEnquiry({ ...selectedEnquiry, status: newStatus });
        }
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update status.");
    }
  };

  // Handle Menu Save
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await api.adminUpdateProduct(editingProduct.id, productForm);
        toast.success("Product updated successfully.");
      } else {
        await api.adminCreateProduct(productForm);
        toast.success("Product added successfully.");
      }
      setShowProductModal(false);
      setEditingProduct(null);
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to save product.");
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await api.adminDeleteProduct(productId);
      toast.success("Product deleted.");
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete product.");
    }
  };

  // Handle Offer Save
  const handleSaveOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (offers.length === 0) return;
    try {
      await api.adminUpdateOffer(offers[0].id, offerForm);
      toast.success("Offer updated successfully.");
    } catch (err: any) {
      toast.error(err.message || "Failed to update offer.");
    }
  };

  // Handle RAG Rebuild
  const handleRebuildRag = async () => {
    setIsRebuildingRag(true);
    try {
      const res = await api.adminRebuildRag();
      if (res.success) {
        toast.success(res.message);
        loadData();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to rebuild RAG index.");
    } finally {
      setIsRebuildingRag(false);
    }
  };

  const menuCategories = [
    "Cakes",
    "Cookies",
    "Cupcakes",
    "Chocolates",
    "Brownies",
    "Special Treats",
  ];

  const enquiryStatuses = [
    "Pending",
    "Reviewed",
    "Confirmed",
    "In Preparation",
    "Ready",
    "Completed",
    "Cancelled",
  ];

  return (
    <RequireAdmin>
      <div className="pt-32 pb-20 bg-[#FDFBF7] min-h-screen">
        <div className="container space-y-8">
          {/* Admin Bar Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#EADED3]">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-[#8B263E] text-[#E0A952] flex items-center justify-center font-serif font-bold text-lg shadow-sm">
                <Shield className="w-5 h-5" />
              </span>
              <div>
                <span className="eyebrow">Bakery Management</span>
                <h1 className="font-serif text-3xl font-bold text-[#2B1810]">
                  Admin Business Dashboard
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <a
                href="/"
                target="_blank"
                rel="noreferrer"
                className="btn btn-sm btn-secondary text-xs"
              >
                View Public Site
              </a>
              <button onClick={logout} className="btn btn-sm btn-ghost text-xs text-rose-700">
                <LogOut className="w-3.5 h-3.5" />
                Logout
              </button>
            </div>
          </div>

          {/* Admin Layout Grid */}
          <div className="dashboard-grid">
            {/* Sidebar Navigation */}
            <aside className="dashboard-sidebar space-y-1.5">
              <button
                onClick={() => setActiveTab("overview")}
                className={`dashboard-nav-item ${activeTab === "overview" ? "active" : ""}`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Overview Metrics
              </button>

              <button
                onClick={() => setActiveTab("enquiries")}
                className={`dashboard-nav-item ${activeTab === "enquiries" ? "active" : ""}`}
              >
                <ClipboardList className="w-4 h-4" />
                Customer Enquiries
              </button>

              <button
                onClick={() => setActiveTab("menu")}
                className={`dashboard-nav-item ${activeTab === "menu" ? "active" : ""}`}
              >
                <UtensilsCrossed className="w-4 h-4" />
                Menu Management
              </button>

              <button
                onClick={() => setActiveTab("gallery")}
                className={`dashboard-nav-item ${activeTab === "gallery" ? "active" : ""}`}
              >
                <ImageIcon className="w-4 h-4" />
                Gallery Portfolio
              </button>

              <button
                onClick={() => setActiveTab("offers")}
                className={`dashboard-nav-item ${activeTab === "offers" ? "active" : ""}`}
              >
                <Tag className="w-4 h-4" />
                Welcome Offer
              </button>

              <button
                onClick={() => setActiveTab("customers")}
                className={`dashboard-nav-item ${activeTab === "customers" ? "active" : ""}`}
              >
                <Users className="w-4 h-4" />
                Registered Customers
              </button>

              <button
                onClick={() => setActiveTab("rag")}
                className={`dashboard-nav-item ${activeTab === "rag" ? "active" : ""}`}
              >
                <BrainCircuit className="w-4 h-4" />
                RAG Knowledge Base
              </button>
            </aside>

            {/* Content Body */}
            <main className="space-y-6">
              {/* VIEW 1: OVERVIEW METRICS */}
              {activeTab === "overview" && (
                <div className="space-y-8">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="metric-card">
                      <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                        Total Enquiries
                      </span>
                      <div className="metric-number">
                        {overviewData?.enquiries?.total ?? "—"}
                      </div>
                      <span className="text-[11px] text-stone-400 mt-1 block">Lifetime customer orders</span>
                    </div>

                    <div className="metric-card bg-amber-50/50 border-amber-200">
                      <span className="text-xs font-semibold text-amber-900 uppercase tracking-wider">
                        Pending Enquiries
                      </span>
                      <div className="metric-number text-amber-900">
                        {overviewData?.enquiries?.pending ?? "—"}
                      </div>
                      <span className="text-[11px] text-amber-700 mt-1 block">Requires staff review</span>
                    </div>

                    <div className="metric-card bg-sky-50/50 border-sky-200">
                      <span className="text-xs font-semibold text-sky-900 uppercase tracking-wider">
                        Today's Enquiries
                      </span>
                      <div className="metric-number text-sky-900">
                        {overviewData?.enquiries?.today ?? "—"}
                      </div>
                      <span className="text-[11px] text-sky-700 mt-1 block">Placed today</span>
                    </div>

                    <div className="metric-card bg-emerald-50/50 border-emerald-200">
                      <span className="text-xs font-semibold text-emerald-900 uppercase tracking-wider">
                        Confirmed Enquiries
                      </span>
                      <div className="metric-number text-emerald-900">
                        {overviewData?.enquiries?.confirmed ?? "—"}
                      </div>
                      <span className="text-[11px] text-emerald-700 mt-1 block">Confirmed orders</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="luxury-card p-6 space-y-3 bg-white">
                      <h3 className="font-serif text-xl font-bold text-[#2B1810]">
                        Customer Base
                      </h3>
                      <div className="metric-number">{overviewData?.total_customers ?? "—"}</div>
                      <p className="text-xs text-stone-500">
                        Total registered customer accounts in database.
                      </p>
                      <button
                        onClick={() => setActiveTab("customers")}
                        className="btn btn-sm btn-secondary text-xs mt-2"
                      >
                        View Customer List
                      </button>
                    </div>

                    <div className="luxury-card p-6 space-y-3 bg-white">
                      <h3 className="font-serif text-xl font-bold text-[#2B1810]">
                        Menu Catalog
                      </h3>
                      <div className="metric-number">{overviewData?.total_products ?? "—"}</div>
                      <p className="text-xs text-stone-500">
                        Total products actively listed in verified bakery menu.
                      </p>
                      <button
                        onClick={() => setActiveTab("menu")}
                        className="btn btn-sm btn-secondary text-xs mt-2"
                      >
                        Manage Products
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* VIEW 2: ENQUIRIES MANAGEMENT */}
              {activeTab === "enquiries" && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="font-serif text-2xl font-bold text-[#2B1810]">
                        Customer Enquiries
                      </h3>
                      <p className="text-xs text-stone-500">
                        Manage incoming orders, review custom cake references, and update order progress.
                      </p>
                    </div>

                    {/* Filter toolbar */}
                    <div className="flex flex-wrap items-center gap-2">
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="form-select py-1.5 px-3 text-xs w-auto"
                      >
                        <option value="All">All Statuses</option>
                        {enquiryStatuses.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>

                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={enquirySearch}
                          onChange={(e) => setEnquirySearch(e.target.value)}
                          placeholder="Search customer, phone..."
                          className="pl-8 pr-3 py-1.5 text-xs rounded-full border border-[#EADED3] bg-white outline-none focus:border-[#8B263E]"
                        />
                      </div>
                    </div>
                  </div>

                  {enquiries.length === 0 ? (
                    <div className="luxury-card p-12 text-center text-stone-500 text-sm">
                      No customer enquiries found matching the selected filter.
                    </div>
                  ) : (
                    <div className="data-table-wrap">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>ID</th>
                            <th>Customer</th>
                            <th>Phone</th>
                            <th>Product / Flavour</th>
                            <th>Required Date</th>
                            <th>Type</th>
                            <th>Status</th>
                            <th>Created At</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {enquiries.map((enq) => (
                            <tr key={enq.id}>
                              <td className="font-bold text-[#8B263E]">#{enq.id}</td>
                              <td className="font-semibold text-stone-900">{enq.name}</td>
                              <td>
                                <a
                                  href={`tel:${enq.phone}`}
                                  className="text-stone-600 hover:text-[#8B263E] underline font-mono text-xs"
                                >
                                  {enq.phone}
                                </a>
                              </td>
                              <td className="max-w-[180px] truncate text-xs">
                                {enq.product || enq.flavour || "Custom Cake"}
                              </td>
                              <td className="text-xs text-stone-700">{enq.required_date || "—"}</td>
                              <td>
                                <span className="text-[11px] px-2 py-0.5 rounded bg-stone-100 uppercase font-bold text-stone-600">
                                  {enq.type}
                                </span>
                              </td>
                              <td>
                                <StatusBadge status={enq.status} />
                              </td>
                              <td className="text-stone-400 text-xs">
                                {enq.created_at?.split(" ")[0]}
                              </td>
                              <td>
                                <button
                                  onClick={() => setSelectedEnquiry(enq)}
                                  className="btn btn-sm btn-secondary text-xs flex items-center gap-1"
                                >
                                  <Eye className="w-3 h-3" />
                                  View / Update
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* VIEW 3: MENU MANAGEMENT */}
              {activeTab === "menu" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-serif text-2xl font-bold text-[#2B1810]">
                        Menu Catalog Management
                      </h3>
                      <p className="text-xs text-stone-500">
                        Add, edit, update pricing, or toggle availability for bakery products.
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setEditingProduct(null);
                        setProductForm({
                          name: "",
                          category: "Cakes",
                          price: "",
                          description: "",
                          image_url: "",
                          is_available: 1,
                        });
                        setShowProductModal(true);
                      }}
                      className="btn btn-sm btn-primary text-xs flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Product
                    </button>
                  </div>

                  <div className="data-table-wrap">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Product Name</th>
                          <th>Category</th>
                          <th>Verified Price</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {menuProducts.map((prod) => (
                          <tr key={prod.id}>
                            <td className="text-stone-400 text-xs">#{prod.id}</td>
                            <td className="font-semibold text-stone-900">{prod.name}</td>
                            <td>
                              <span className="text-xs px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 font-medium">
                                {prod.category}
                              </span>
                            </td>
                            <td className="font-bold text-[#8B263E] text-xs">{prod.price}</td>
                            <td>
                              <span
                                className={`text-[11px] px-2 py-0.5 rounded font-bold ${
                                  prod.is_available
                                    ? "bg-emerald-100 text-emerald-800"
                                    : "bg-rose-100 text-rose-800"
                                }`}
                              >
                                {prod.is_available ? "Available" : "Disabled"}
                              </span>
                            </td>
                            <td>
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => {
                                    setEditingProduct(prod);
                                    setProductForm({
                                      name: prod.name,
                                      category: prod.category,
                                      price: prod.price,
                                      description: prod.description || "",
                                      image_url: prod.image_url || "",
                                      is_available: prod.is_available,
                                    });
                                    setShowProductModal(true);
                                  }}
                                  className="p-1.5 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100"
                                  title="Edit Product"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(prod.id)}
                                  className="p-1.5 rounded-lg text-rose-600 hover:text-rose-800 hover:bg-rose-50"
                                  title="Delete Product"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* VIEW 4: GALLERY MANAGEMENT */}
              {activeTab === "gallery" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-serif text-2xl font-bold text-[#2B1810]">
                        Gallery Management
                      </h3>
                      <p className="text-xs text-stone-500">
                        Manage authentic bakery photos displayed on the public gallery portfolio.
                      </p>
                    </div>

                    <button
                      onClick={() => setShowGalleryModal(true)}
                      className="btn btn-sm btn-primary text-xs flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Photo
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {galleryItems.map((item) => (
                      <div
                        key={item.id}
                        className="luxury-card overflow-hidden bg-white border border-[#EADED3] flex flex-col group relative"
                      >
                        <div className="h-36 overflow-hidden bg-stone-100">
                          <img
                            src={item.src}
                            alt={item.label}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-3 flex-1 flex flex-col justify-between">
                          <div>
                            <span className="text-[10px] font-bold text-[#8B263E] uppercase block">
                              {item.category}
                            </span>
                            <div className="text-xs font-semibold text-stone-900 truncate">
                              {item.label}
                            </div>
                          </div>
                          <button
                            onClick={async () => {
                              if (!confirm(`Delete image "${item.label}"?`)) return;
                              await api.adminDeleteGallery(item.id);
                              toast.success("Image removed from gallery.");
                              loadData();
                            }}
                            className="mt-2 text-[11px] text-rose-600 hover:text-rose-800 flex items-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" />
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* VIEW 5: OFFERS MANAGEMENT */}
              {activeTab === "offers" && (
                <div className="max-w-xl space-y-6">
                  <div className="luxury-card p-6 sm:p-8 bg-white space-y-4">
                    <div>
                      <h3 className="font-serif text-2xl font-bold text-[#2B1810]">
                        First-Order Welcome Offer
                      </h3>
                      <p className="text-xs text-stone-500 mt-1">
                        Verified offer: Follow bakery Instagram & share page to get 10% OFF.
                      </p>
                    </div>

                    <form onSubmit={handleSaveOffer} className="space-y-4">
                      <div>
                        <label className="form-label">Offer Title</label>
                        <input
                          type="text"
                          required
                          value={offerForm.title}
                          onChange={(e) => setOfferForm({ ...offerForm, title: e.target.value })}
                          className="form-input"
                        />
                      </div>

                      <div>
                        <label className="form-label">Description / Offer Text</label>
                        <textarea
                          rows={3}
                          required
                          value={offerForm.description}
                          onChange={(e) =>
                            setOfferForm({ ...offerForm, description: e.target.value })
                          }
                          className="form-textarea"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="form-label">Discount Percentage (%)</label>
                          <input
                            type="number"
                            required
                            min={1}
                            max={50}
                            value={offerForm.discount_percent}
                            onChange={(e) =>
                              setOfferForm({
                                ...offerForm,
                                discount_percent: parseInt(e.target.value) || 10,
                              })
                            }
                            className="form-input"
                          />
                        </div>
                        <div>
                          <label className="form-label">Status</label>
                          <select
                            value={offerForm.is_active}
                            onChange={(e) =>
                              setOfferForm({ ...offerForm, is_active: parseInt(e.target.value) })
                            }
                            className="form-select"
                          >
                            <option value={1}>Active</option>
                            <option value={0}>Disabled</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="form-label">Terms & Conditions</label>
                        <input
                          type="text"
                          value={offerForm.terms || ""}
                          onChange={(e) => setOfferForm({ ...offerForm, terms: e.target.value })}
                          className="form-input"
                        />
                      </div>

                      <button type="submit" className="btn btn-primary text-xs w-full py-3">
                        Save Offer Changes
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* VIEW 6: REGISTERED CUSTOMERS */}
              {activeTab === "customers" && (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-serif text-2xl font-bold text-[#2B1810]">
                      Registered Customers
                    </h3>
                    <p className="text-xs text-stone-500">
                      View customer profiles and their past enquiry histories. Passwords are never exposed.
                    </p>
                  </div>

                  <div className="data-table-wrap">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Customer Name</th>
                          <th>Phone</th>
                          <th>Email Address</th>
                          <th>Enquiry History</th>
                          <th>Registration Date</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {customers.map((cust) => (
                          <tr key={cust.id}>
                            <td className="text-stone-400 text-xs">#{cust.id}</td>
                            <td className="font-semibold text-stone-900">{cust.name}</td>
                            <td>
                              <a
                                href={`tel:${cust.phone}`}
                                className="text-xs font-mono text-stone-700 hover:text-[#8B263E] underline"
                              >
                                {cust.phone}
                              </a>
                            </td>
                            <td className="text-xs text-stone-600">{cust.email}</td>
                            <td>
                              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FAF5EC] text-[#8B263E] border border-[#EADED3]">
                                {cust.enquiry_count} enquiries
                              </span>
                            </td>
                            <td className="text-xs text-stone-400">
                              {cust.created_at?.split(" ")[0]}
                            </td>
                            <td>
                              <button
                                onClick={async () => {
                                  setViewingCustomerName(cust.name);
                                  const res = await api.adminGetCustomerEnquiries(cust.id);
                                  if (res.success) {
                                    setSelectedCustomerEnquiries(res.enquiries);
                                  }
                                }}
                                className="btn btn-sm btn-secondary text-xs flex items-center gap-1"
                              >
                                <Eye className="w-3 h-3" />
                                View History
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* VIEW 7: RAG KNOWLEDGE BASE */}
              {activeTab === "rag" && (
                <div className="max-w-2xl space-y-6">
                  <div className="luxury-card p-6 sm:p-8 bg-white space-y-6">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-bold text-[#8B263E] uppercase tracking-wider">
                        <BrainCircuit className="w-4 h-4 text-[#C58A32]" />
                        FAISS Vector Store & Semantic Embeddings
                      </div>
                      <h3 className="font-serif text-2xl font-bold text-[#2B1810] mt-1">
                        RAG Knowledge Base Status
                      </h3>
                      <p className="text-xs text-stone-500 mt-1">
                        Controls the vector search store that grounds our bakery AI assistant.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-[#FAF5EC] border border-[#EADED3]">
                        <span className="text-xs text-stone-500">Vector Store Health:</span>
                        <div className="text-lg font-bold text-emerald-800 mt-1 flex items-center gap-1.5">
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                          {ragStatus?.status || "Healthy"}
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-[#FAF5EC] border border-[#EADED3]">
                        <span className="text-xs text-stone-500">Indexed Chunks:</span>
                        <div className="text-lg font-bold text-[#2B1810] mt-1">
                          {ragStatus?.chunk_count || 5} chunks
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-[#FAF5EC] border border-[#EADED3]">
                        <span className="text-xs text-stone-500">Source Documents:</span>
                        <div className="text-lg font-bold text-[#2B1810] mt-1">
                          {ragStatus?.documents_count || 5} documents
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-[#FAF5EC] border border-[#EADED3]">
                        <span className="text-xs text-stone-500">Last Index Build:</span>
                        <div className="text-xs font-semibold text-stone-700 mt-2">
                          {ragStatus?.last_updated || "Current"}
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-700 flex-none mt-0.5" />
                      <div>
                        <strong>Strict Anti-Hallucination Isolation:</strong> Customer reference photos and order enquiries never enter the RAG knowledge base. Only verified bakery catalogues in <code>rag/documents/</code> are indexed.
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        onClick={handleRebuildRag}
                        disabled={isRebuildingRag}
                        className="btn btn-primary text-xs py-3.5 w-full flex items-center justify-center gap-2"
                      >
                        {isRebuildingRag ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            Rebuilding Vector Store...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="w-4 h-4" />
                            Rebuild Knowledge Base Now
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </main>
          </div>
        </div>

        {/* MODAL: VIEW / UPDATE ENQUIRY */}
        {selectedEnquiry && (
          <div
            onClick={() => setSelectedEnquiry(null)}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-[#EADED3] max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div>
                  <span className="text-xs font-bold text-[#8B263E]">
                    Enquiry #{selectedEnquiry.id} ({selectedEnquiry.type})
                  </span>
                  <h3 className="font-serif text-2xl font-bold text-[#2B1810]">
                    Customer Enquiry Details
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedEnquiry(null)}
                  className="p-1 rounded-full text-stone-400 hover:text-stone-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Reference Image Preview if exists */}
              {selectedEnquiry.reference_image_url && (
                <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                  <span className="text-xs font-semibold text-stone-600 block">
                    Uploaded Reference Design:
                  </span>
                  <img
                    src={selectedEnquiry.reference_image_url}
                    alt="Customer Reference Design"
                    className="h-48 w-full rounded-xl object-contain bg-white border border-stone-200"
                  />
                </div>
              )}

              {/* Enquiry Details Grid */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-stone-400 block">Customer Name:</span>
                  <strong className="text-sm text-stone-800">{selectedEnquiry.name}</strong>
                </div>
                <div>
                  <span className="text-stone-400 block">Phone:</span>
                  <a
                    href={`tel:${selectedEnquiry.phone}`}
                    className="text-sm font-bold text-[#8B263E] underline"
                  >
                    {selectedEnquiry.phone}
                  </a>
                </div>
                <div>
                  <span className="text-stone-400 block">Required Date:</span>
                  <strong className="text-stone-800">{selectedEnquiry.required_date || "—"}</strong>
                </div>
                <div>
                  <span className="text-stone-400 block">Egg Preference:</span>
                  <strong className="text-stone-800">{selectedEnquiry.egg_preference}</strong>
                </div>
                <div>
                  <span className="text-stone-400 block">Item / Flavour:</span>
                  <strong className="text-stone-800">
                    {selectedEnquiry.product || selectedEnquiry.flavour || "—"}
                  </strong>
                </div>
                <div>
                  <span className="text-stone-400 block">Size / Quantity:</span>
                  <strong className="text-stone-800">
                    {selectedEnquiry.size || selectedEnquiry.quantity || "—"}
                  </strong>
                </div>
                {selectedEnquiry.theme && (
                  <div>
                    <span className="text-stone-400 block">Theme / Concept:</span>
                    <strong className="text-stone-800">{selectedEnquiry.theme}</strong>
                  </div>
                )}
                {selectedEnquiry.colour && (
                  <div>
                    <span className="text-stone-400 block">Preferred Colour:</span>
                    <strong className="text-stone-800">{selectedEnquiry.colour}</strong>
                  </div>
                )}
              </div>

              {selectedEnquiry.message_on_cake && (
                <div className="p-3 rounded-xl bg-[#FAF5EC] text-xs border border-[#EADED3]">
                  <span className="text-[10px] uppercase font-bold text-[#8B263E] block">
                    Message to write on cake:
                  </span>
                  "{selectedEnquiry.message_on_cake}"
                </div>
              )}

              {selectedEnquiry.additional_message && (
                <div className="p-3 rounded-xl bg-stone-50 text-xs border border-stone-200">
                  <span className="text-[10px] uppercase font-bold text-stone-600 block">
                    Additional Instructions / Address:
                  </span>
                  {selectedEnquiry.additional_message}
                </div>
              )}

              {/* Status Updater */}
              <div className="pt-4 border-t border-stone-100 space-y-2">
                <label className="form-label">Update Enquiry Status:</label>
                <div className="flex flex-wrap gap-2">
                  {enquiryStatuses.map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleUpdateStatus(selectedEnquiry.id, st)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                        selectedEnquiry.status === st
                          ? "bg-[#8B263E] text-white shadow-sm"
                          : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: ADD / EDIT PRODUCT */}
        {showProductModal && (
          <div
            onClick={() => setShowProductModal(false)}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-[#EADED3]"
            >
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <h3 className="font-serif text-2xl font-bold text-[#2B1810]">
                  {editingProduct ? "Edit Bakery Product" : "Add New Bakery Product"}
                </h3>
                <button
                  onClick={() => setShowProductModal(false)}
                  className="p-1 text-stone-400 hover:text-stone-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveProduct} className="space-y-4">
                <div>
                  <label className="form-label">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Category</label>
                    <select
                      value={productForm.category}
                      onChange={(e) =>
                        setProductForm({ ...productForm, category: e.target.value })
                      }
                      className="form-select"
                    >
                      {menuCategories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="form-label">Verified Price *</label>
                    <input
                      type="text"
                      required
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                      placeholder="e.g. ½ kg ₹400 · 1 kg ₹750"
                      className="form-input"
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label">Description / Dietary Notes</label>
                  <textarea
                    rows={2}
                    value={productForm.description}
                    onChange={(e) =>
                      setProductForm({ ...productForm, description: e.target.value })
                    }
                    className="form-textarea"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Image Path / URL</label>
                    <input
                      type="text"
                      value={productForm.image_url}
                      onChange={(e) =>
                        setProductForm({ ...productForm, image_url: e.target.value })
                      }
                      placeholder="/assets/gallery/original-002.jpg"
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="form-label">Availability</label>
                    <select
                      value={productForm.is_available}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          is_available: parseInt(e.target.value),
                        })
                      }
                      className="form-select"
                    >
                      <option value={1}>Available</option>
                      <option value={0}>Disabled</option>
                    </select>
                  </div>
                </div>

                <button type="submit" className="btn btn-primary text-xs w-full py-3 mt-2">
                  {editingProduct ? "Save Changes" : "Create Product"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: CUSTOMER ENQUIRY HISTORY */}
        {selectedCustomerEnquiries && (
          <div
            onClick={() => setSelectedCustomerEnquiries(null)}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-[#EADED3] max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <h3 className="font-serif text-2xl font-bold text-[#2B1810]">
                  Enquiry History: {viewingCustomerName}
                </h3>
                <button
                  onClick={() => setSelectedCustomerEnquiries(null)}
                  className="p-1 text-stone-400 hover:text-stone-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {selectedCustomerEnquiries.length === 0 ? (
                <p className="text-xs text-stone-500 py-6 text-center">
                  This customer has not submitted any enquiries yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {selectedCustomerEnquiries.map((enq) => (
                    <div
                      key={enq.id}
                      className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 flex items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="font-bold text-stone-900">
                          #{enq.id} · {enq.type === "custom-cake" ? "Custom Cake" : enq.product || "Standard Order"}
                        </div>
                        <div className="text-stone-500 mt-0.5">
                          Required for: {enq.required_date || "—"} · Placed on {enq.created_at?.split(" ")[0]}
                        </div>
                      </div>
                      <StatusBadge status={enq.status} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </RequireAdmin>
  );
};
export default AdminDashboard;
