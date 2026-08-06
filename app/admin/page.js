"use client";

import { useState, useEffect } from "react";
import {
  ShieldCheck,
  Users,
  Calendar,
  DollarSign,
  PlusCircle,
  QrCode,
  Tag,
  Search,
  Sparkles,
  RefreshCcw,
  CheckCircle2,
  XCircle,
  LogOut,
} from "lucide-react";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Input from "../../components/ui/Input";
import Modal from "../../components/ui/Modal";
import QRScannerModal from "../../components/organizer/QRScannerModal";
import { getEvents, createEventInSupabase } from "../../lib/services/event-service";
import { useToast } from "../../hooks/use-toast";
import { useAuth } from "../../hooks/use-auth";
import { wipeAllSystemData } from "../../lib/utils/clean-data";
import { getCustomerTickets } from "../../lib/services/booking-service";

export default function AdminDashboardPage() {
  const { toast } = useToast();
  const { logout } = useAuth();

  const [activeTab, setActiveTab] = useState("events"); // events, coupons, attendees, analytics
  const [eventsList, setEventsList] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [isWiping, setIsWiping] = useState(false);

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [showCouponModal, setShowCouponModal] = useState(false);

  // New Event Form state
  const [newTitle, setNewTitle] = useState("");
  const [newShortDesc, setNewShortDesc] = useState("");
  const [newFullDesc, setNewFullDesc] = useState("");
  const [newBannerUrl, setNewBannerUrl] = useState("");
  const [newVenue, setNewVenue] = useState("");
  const [newCity, setNewCity] = useState("");
  const [newStartDate, setNewStartDate] = useState("");
  const [newEndDate, setNewEndDate] = useState("");
  const [ticketTiers, setTicketTiers] = useState([
    { name: "General Admission", price: 49, quantity_total: 100 },
    { name: "VIP Pass", price: 120, quantity_total: 30 },
  ]);
  const [isSubmittingEvent, setIsSubmittingEvent] = useState(false);

  // Coupons State
  const [couponsList, setCouponsList] = useState([
    { id: "c-1", code: "WELCOME10", discount_type: "percentage", discount_value: 10, times_used: 14 },
    { id: "c-2", code: "AFTERHOURS20", discount_type: "fixed", discount_value: 20, times_used: 8 },
  ]);
  const [newCouponCode, setNewCouponCode] = useState("");
  const [newCouponType, setNewCouponType] = useState("percentage");
  const [newCouponValue, setNewCouponValue] = useState(15);

  // Attendees & Orders State
  const [ordersList, setOrdersList] = useState([]);
  const [searchAttendee, setSearchAttendee] = useState("");

  const fetchOrdersAndTickets = async () => {
    try {
      const tickets = await getCustomerTickets();
      setOrdersList(tickets || []);
    } catch {
      setOrdersList([]);
    }
  };

  const fetchEvents = async () => {
    setLoadingEvents(true);
    try {
      const data = await getEvents();
      setEventsList(data || []);
    } catch (err) {
      console.warn("Fetch events admin warning:", err);
      setEventsList([]);
    } finally {
      setLoadingEvents(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    fetchOrdersAndTickets();
  }, []);

  // Handle Event Creation
  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!newTitle || !newVenue || !newCity) {
      toast({ title: "Missing fields", description: "Title, venue, and city are required.", type: "error" });
      return;
    }

    setIsSubmittingEvent(true);
    try {
      await createEventInSupabase({
        title: newTitle,
        short_description: newShortDesc,
        full_description: newFullDesc,
        banner_url: newBannerUrl,
        venue_name: newVenue,
        city: newCity,
        start_date: newStartDate,
        end_date: newEndDate,
        ticket_types: ticketTiers,
      });

      toast({ title: "Event Created!", description: "New event created successfully.", type: "success" });
      setShowCreateModal(false);

      // Reset form
      setNewTitle("");
      setNewShortDesc("");
      setNewFullDesc("");
      setNewBannerUrl("");
      setNewVenue("");
      setNewCity("");

      fetchEvents();
    } catch (err) {
      toast({ title: "Failed", description: err.message, type: "error" });
    } finally {
      setIsSubmittingEvent(false);
    }
  };

  // Add Coupon Handler
  const handleCreateCoupon = (e) => {
    e.preventDefault();
    if (!newCouponCode.trim()) return;

    const couponObj = {
      id: `c-${Date.now()}`,
      code: newCouponCode.trim().toUpperCase(),
      discount_type: newCouponType,
      discount_value: Number(newCouponValue) || 10,
      times_used: 0,
    };

    setCouponsList([couponObj, ...couponsList]);
    setNewCouponCode("");
    setShowCouponModal(false);
    toast({ title: "Coupon Created", description: `Code ${couponObj.code} added.`, type: "success" });
  };

  // Refund Handler
  const handleRefundOrder = (orderId) => {
    setOrdersList(prev =>
      prev.map(o => (o.id === orderId ? { ...o, status: "refunded" } : o))
    );
    toast({ title: "Refund Issued", description: "Order status updated to refunded.", type: "info" });
  };

  const handleAdminLogout = async () => {
    try {
      await logout();
    } catch {}
    document.cookie = "afterhours_admin_auth=; path=/; max-age=0; SameSite=Lax";
    localStorage.removeItem("afterhours_admin_session");
    window.location.href = "/admin/login";
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Top Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Company Admin Dashboard</h1>
              <Badge variant="emerald">INTERNAL STAFF</Badge>
            </div>
            <p className="text-xs text-slate-400">Private event management, gate scanners, coupons, and sales analytics.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="glow" size="sm" onClick={() => setShowCreateModal(true)}>
            <PlusCircle className="w-4 h-4" /> Create Event
          </Button>

          <Button variant="secondary" size="sm" onClick={() => setShowScannerModal(true)}>
            <QrCode className="w-4 h-4 text-fuchsia-400" /> Gate QR Scanner
          </Button>


          <button
            onClick={handleAdminLogout}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-500/40 transition-colors flex items-center gap-1.5 text-xs font-semibold"
            title="Log Out Staff Account"
          >
            <LogOut className="w-4 h-4 text-rose-400" /> Staff Logout
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col gap-2">
          <span className="text-xs font-semibold text-slate-400">Company Sales Revenue</span>
          <p className="text-3xl font-extrabold text-emerald-400">
            ${ordersList.filter(o => o.status === "paid").reduce((acc, o) => acc + parseFloat(o.amount.replace("$", "")), 0).toFixed(2)}
          </p>
          <span className="text-[11px] text-slate-400">Total Revenue Collected</span>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col gap-2">
          <span className="text-xs font-semibold text-slate-400">Total Active Events</span>
          <p className="text-3xl font-extrabold text-white">{eventsList.length}</p>
          <span className="text-[11px] text-violet-400 font-semibold">Published In-House</span>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col gap-2">
          <span className="text-xs font-semibold text-slate-400">Active Coupons</span>
          <p className="text-3xl font-extrabold text-violet-400">{couponsList.length}</p>
          <span className="text-[11px] text-slate-400">Promo Tiers Active</span>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col gap-2">
          <span className="text-xs font-semibold text-slate-400">Total Bookings</span>
          <p className="text-3xl font-extrabold text-fuchsia-400">{ordersList.length}</p>
          <span className="text-[11px] text-emerald-400">HMAC QR Verified</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-4 mb-8 overflow-x-auto">
        <button
          onClick={() => setActiveTab("events")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "events"
              ? "bg-violet-600 text-white"
              : "bg-slate-900 text-slate-400 hover:text-white"
          }`}
        >
          <Calendar className="w-4 h-4 inline-block mr-1.5 -mt-0.5" /> Events List ({eventsList.length})
        </button>

        <button
          onClick={() => setActiveTab("coupons")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "coupons"
              ? "bg-violet-600 text-white"
              : "bg-slate-900 text-slate-400 hover:text-white"
          }`}
        >
          <Tag className="w-4 h-4 inline-block mr-1.5 -mt-0.5" /> Coupons & Discounts ({couponsList.length})
        </button>

        <button
          onClick={() => setActiveTab("attendees")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "attendees"
              ? "bg-violet-600 text-white"
              : "bg-slate-900 text-slate-400 hover:text-white"
          }`}
        >
          <Users className="w-4 h-4 inline-block mr-1.5 -mt-0.5" /> Attendees & Refunds ({ordersList.length})
        </button>
      </div>

      {/* TAB 1: EVENTS */}
      {activeTab === "events" && (
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Company Event Catalogue</h3>
            <Button variant="secondary" size="sm" onClick={fetchEvents}>
              <RefreshCcw className="w-3.5 h-3.5" /> Refresh List
            </Button>
          </div>

          {loadingEvents ? (
            <p className="text-xs text-slate-400 py-6 text-center">Loading events from database...</p>
          ) : eventsList.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center gap-3">
              <Calendar className="w-10 h-10 text-slate-600" />
              <p className="text-sm font-bold text-white">No company events created yet</p>
              <p className="text-xs text-slate-400">Click "Create Event" to publish your first company event.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {eventsList.map((evt) => (
                <div
                  key={evt.id}
                  className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    {evt.banner_url ? (
                      <img src={evt.banner_url} alt="Banner" className="w-14 h-14 rounded-xl object-cover" />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-violet-600/20 text-violet-400 flex items-center justify-center font-bold text-xs">
                        EVENT
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold text-white text-sm">{evt.title}</h4>
                      <p className="text-xs text-slate-400">{evt.venue_name} • {evt.city}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge variant={evt.is_published ? "emerald" : "amber"}>
                      {evt.is_published ? "PUBLISHED" : "DRAFT"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: COUPONS */}
      {activeTab === "coupons" && (
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Promo Codes & Coupons</h3>
            <Button variant="glow" size="sm" onClick={() => setShowCouponModal(true)}>
              <PlusCircle className="w-4 h-4" /> Add Coupon Code
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-4">Code</th>
                  <th className="p-4">Discount Type</th>
                  <th className="p-4">Value</th>
                  <th className="p-4">Times Used</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {couponsList.map((c) => (
                  <tr key={c.id}>
                    <td className="p-4 font-mono font-bold text-violet-400">{c.code}</td>
                    <td className="p-4 capitalize">{c.discount_type}</td>
                    <td className="p-4 font-bold text-white">
                      {c.discount_type === "percentage" ? `${c.discount_value}% OFF` : `$${c.discount_value} OFF`}
                    </td>
                    <td className="p-4 text-slate-400">{c.times_used} uses</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: ATTENDEES & REFUNDS */}
      {activeTab === "attendees" && (
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-lg font-bold text-white">Attendee Orders & Refunds</h3>
            <div className="w-full sm:w-64">
              <Input
                icon={Search}
                placeholder="Search attendee..."
                value={searchAttendee}
                onChange={(e) => setSearchAttendee(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-4">Order #</th>
                  <th className="p-4">Attendee</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {ordersList.map((ord) => (
                  <tr key={ord.id}>
                    <td className="p-4 font-mono text-slate-400">{ord.order_number}</td>
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-white">{ord.name}</span>
                        <span className="text-[11px] text-slate-400">{ord.email}</span>
                      </div>
                    </td>
                    <td className="p-4 font-bold text-white">{ord.amount}</td>
                    <td className="p-4">
                      <Badge variant={ord.status === "paid" ? "emerald" : "rose"}>
                        {ord.status.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="p-4 text-right">
                      {ord.status === "paid" && (
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleRefundOrder(ord.id)}
                        >
                          Issue Refund
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE EVENT MODAL */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Company Event"
      >
        <form onSubmit={handleCreateEvent} className="flex flex-col gap-4 text-xs">
          <Input
            label="Event Title *"
            placeholder="e.g. Underground Rave Vol. IV"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Venue Name *"
              placeholder="e.g. The Warehouse Stage"
              value={newVenue}
              onChange={(e) => setNewVenue(e.target.value)}
            />
            <Input
              label="City *"
              placeholder="e.g. New York"
              value={newCity}
              onChange={(e) => setNewCity(e.target.value)}
            />
          </div>

          <Input
            label="Banner Image URL"
            placeholder="https://images.unsplash.com/..."
            value={newBannerUrl}
            onChange={(e) => setNewBannerUrl(e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              type="datetime-local"
              label="Start Date & Time"
              value={newStartDate}
              onChange={(e) => setNewStartDate(e.target.value)}
            />
            <Input
              type="datetime-local"
              label="End Date & Time"
              value={newEndDate}
              onChange={(e) => setNewEndDate(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-semibold text-slate-300">Short Description</label>
            <textarea
              rows={2}
              placeholder="Brief summary of the experience..."
              value={newShortDesc}
              onChange={(e) => setNewShortDesc(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white"
            />
          </div>

          <Button type="submit" variant="glow" size="lg" isLoading={isSubmittingEvent} className="mt-2">
            Publish Event
          </Button>
        </form>
      </Modal>

      {/* CREATE COUPON MODAL */}
      <Modal
        isOpen={showCouponModal}
        onClose={() => setShowCouponModal(false)}
        title="Add Promo Coupon Code"
      >
        <form onSubmit={handleCreateCoupon} className="flex flex-col gap-4 text-xs">
          <Input
            label="Coupon Code *"
            placeholder="e.g. SUMMER25"
            value={newCouponCode}
            onChange={(e) => setNewCouponCode(e.target.value)}
          />

          <div className="flex flex-col gap-1">
            <label className="font-semibold text-slate-300">Discount Type</label>
            <select
              value={newCouponType}
              onChange={(e) => setNewCouponType(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white"
            >
              <option value="percentage">Percentage (%)</option>
              <option value="fixed">Fixed Amount ($)</option>
            </select>
          </div>

          <Input
            type="number"
            label="Discount Value"
            value={newCouponValue}
            onChange={(e) => setNewCouponValue(e.target.value)}
          />

          <Button type="submit" variant="glow" size="lg" className="mt-2">
            Create Coupon
          </Button>
        </form>
      </Modal>

      {/* LIVE SCANNER MODAL */}
      <QRScannerModal
        isOpen={showScannerModal}
        onClose={() => setShowScannerModal(false)}
      />
    </div>
  );
}
