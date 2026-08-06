"use client";

import { useState, useEffect } from "react";
import {
  ShieldCheck,
  Users,
  Calendar,
  PlusCircle,
  QrCode,
  Tag,
  Search,
  RefreshCcw,
  LogOut,
  UserCheck,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import QRScannerModal from "@/components/organizer/QRScannerModal";
import { getEvents, createEventInSupabase } from "@/lib/services/event-service";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { getCustomerTickets } from "@/lib/services/booking-service";

export default function AdminDashboardPage() {
  const { toast } = useToast();
  const { logout } = useAuth();

  const [sessionRole, setSessionRole] = useState(null); // 'admin' or 'staff'
  const [sessionUser, setSessionUser] = useState(null);
  const [loadingSession, setLoadingSession] = useState(true);

  const [activeTab, setActiveTab] = useState("events"); // events, coupons, attendees
  const [eventsList, setEventsList] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  // Admin Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [showCouponModal, setShowCouponModal] = useState(false);

  // Staff Scanner view state (open by default for staff)
  const [staffScannerActive, setStaffScannerActive] = useState(true);

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
    { id: "c-randi", code: "RANDI", discount_type: "override", discount_value: 10, times_used: 42 },
    { id: "c-friend", code: "FRIEND", discount_type: "fixed", discount_value: 200, times_used: 19 },
    { id: "c-1", code: "WELCOME10", discount_type: "percentage", discount_value: 10, times_used: 14 },
    { id: "c-2", code: "AFTERHOURS20", discount_type: "fixed", discount_value: 20, times_used: 8 },
  ]);
  const [newCouponCode, setNewCouponCode] = useState("");
  const [newCouponType, setNewCouponType] = useState("percentage");
  const [newCouponValue, setNewCouponValue] = useState(15);

  // Attendees & Orders State
  const [ordersList, setOrdersList] = useState([]);
  const [searchAttendee, setSearchAttendee] = useState("");

  useEffect(() => {
    // Read session & role from localStorage
    try {
      const storedSession = localStorage.getItem("afterhours_admin_session");
      if (storedSession) {
        const parsed = JSON.parse(storedSession);
        setSessionRole(parsed.role || "staff");
        setSessionUser(parsed);
      } else {
        setSessionRole("staff");
      }
    } catch (e) {
      console.warn("Session read error:", e);
      setSessionRole("staff");
    } finally {
      setLoadingSession(false);
    }

    fetchEvents();
    fetchOrdersAndTickets();
  }, []);

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

  const isAdmin = sessionRole === "admin";

  const handleAdminLogout = async () => {
    try {
      await logout();
    } catch {}
    document.cookie = "afterhours_admin_auth=; path=/; max-age=0; SameSite=Lax";
    localStorage.removeItem("afterhours_admin_session");
    window.location.href = "/portal-ops-x97/login";
  };

  // Handle Event Creation (Admin Only)
  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!isAdmin) return;
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

  // Add Coupon Handler (Admin Only)
  const handleCreateCoupon = (e) => {
    e.preventDefault();
    if (!isAdmin) return;
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

  // Refund Handler (Admin Only)
  const handleRefundOrder = (orderId) => {
    if (!isAdmin) return;
    setOrdersList(prev =>
      prev.map(o => (o.id === orderId ? { ...o, status: "refunded" } : o))
    );
    toast({ title: "Refund Issued", description: "Order status updated to refunded.", type: "info" });
  };

  const filteredOrders = ordersList.filter(o =>
    !searchAttendee ||
    o.name?.toLowerCase().includes(searchAttendee.toLowerCase()) ||
    o.email?.toLowerCase().includes(searchAttendee.toLowerCase()) ||
    o.order_number?.toLowerCase().includes(searchAttendee.toLowerCase())
  );

  if (loadingSession) {
    return <div className="min-h-screen flex items-center justify-center text-white text-sm font-semibold">Loading Portal...</div>;
  }

  // =========================================================================
  // STAFF VIEW: ONLY CAN SCAN QR CODES (MOBILE RESPONSIVE FOCUSED SCANNER)
  // =========================================================================
  if (!isAdmin) {
    return (
      <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10 min-h-[85vh] flex flex-col gap-4 sm:gap-6">
        {/* Header for Staff */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-4 sm:pb-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-lg shrink-0">
              <QrCode className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-extrabold text-white">Gate Check-in Station</h1>
                <Badge variant="amber">FIELD STAFF</Badge>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400">Gate Check-ins & Ticket Scanner</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-end">
            <button
              onClick={handleAdminLogout}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-500/40 transition-colors flex items-center justify-center gap-1.5 text-xs font-semibold shrink-0"
              title="Sign Out Staff Account"
            >
              <LogOut className="w-4 h-4 text-rose-400" /> <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>

        {/* Staff Only Dedicated Scanner Card */}
        <div className="flex-1 rounded-2xl sm:rounded-3xl bg-slate-900/90 border border-slate-800 p-5 sm:p-8 backdrop-blur-xl shadow-2xl flex flex-col items-center justify-center text-center gap-4 sm:gap-6">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-violet-600/20 border border-violet-500/40 flex items-center justify-center text-violet-400 shadow-xl">
            <QrCode className="w-8 h-8 sm:w-10 sm:h-10 animate-pulse" />
          </div>

          <div className="flex flex-col gap-1.5 max-w-md">
            <h2 className="text-xl sm:text-2xl font-extrabold text-white">Ready for Gate Scans</h2>
            <p className="text-xs text-slate-400 leading-relaxed px-2">
              As Field Staff, your account is configured strictly for attendee check-ins. Tap below to launch the camera scanner and verify attendee tickets.
            </p>
          </div>

          <Button
            variant="glow"
            size="lg"
            onClick={() => setStaffScannerActive(true)}
            className="w-full sm:w-auto bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 sm:px-8 py-3.5 sm:py-4 text-xs sm:text-sm font-extrabold shadow-2xl shadow-violet-900/50 justify-center"
          >
            <QrCode className="w-5 h-5" /> Launch Ticket Scanner
          </Button>

          <QRScannerModal
            isOpen={staffScannerActive}
            onClose={() => setStaffScannerActive(false)}
          />
        </div>
      </div>
    );
  }

  // =========================================================================
  // ADMIN VIEW: FULL CONTROL PORTAL (MOBILE RESPONSIVE GRID & CARDS)
  // =========================================================================
  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10">
      {/* Top Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8 pb-4 sm:pb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
            <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight">Company Admin Portal</h1>
              <Badge variant="emerald">ADMINISTRATOR</Badge>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-400">Full management: events, coupons, refunds, & metrics.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <Button variant="glow" size="sm" onClick={() => setShowCreateModal(true)} className="col-span-1 justify-center text-xs">
            <PlusCircle className="w-4 h-4" /> Create Event
          </Button>

          <Button variant="secondary" size="sm" onClick={() => setShowScannerModal(true)} className="col-span-1 justify-center text-xs">
            <QrCode className="w-4 h-4 text-fuchsia-400" /> Gate Scanner
          </Button>

          <button
            onClick={handleAdminLogout}
            className="col-span-2 sm:col-span-1 p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-500/40 transition-colors flex items-center justify-center gap-1.5 text-xs font-semibold"
            title="Log Out Staff Account"
          >
            <LogOut className="w-4 h-4 text-rose-400" /> Sign Out
          </button>
        </div>
      </div>

      {/* Metric Cards (ADMIN ONLY) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-10">
        <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col gap-1 sm:gap-2">
          <span className="text-[10px] sm:text-xs font-semibold text-slate-400">Sales Revenue</span>
          <p className="text-xl sm:text-3xl font-extrabold text-emerald-400 truncate">
            ${ordersList.filter(o => o.status === "paid").reduce((acc, o) => acc + parseFloat((o.amount || "0").replace("$", "")), 0).toFixed(2)}
          </p>
          <span className="text-[9px] sm:text-[11px] text-slate-400">Total Revenue</span>
        </div>

        <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col gap-1 sm:gap-2">
          <span className="text-[10px] sm:text-xs font-semibold text-slate-400">Active Events</span>
          <p className="text-xl sm:text-3xl font-extrabold text-white">{eventsList.length}</p>
          <span className="text-[9px] sm:text-[11px] text-violet-400 font-semibold">Published</span>
        </div>

        <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col gap-1 sm:gap-2">
          <span className="text-[10px] sm:text-xs font-semibold text-slate-400">Active Coupons</span>
          <p className="text-xl sm:text-3xl font-extrabold text-violet-400">{couponsList.length}</p>
          <span className="text-[9px] sm:text-[11px] text-slate-400">Promotions</span>
        </div>

        <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col gap-1 sm:gap-2">
          <span className="text-[10px] sm:text-xs font-semibold text-slate-400">Total Bookings</span>
          <p className="text-xl sm:text-3xl font-extrabold text-fuchsia-400">{ordersList.length}</p>
          <span className="text-[9px] sm:text-[11px] text-emerald-400">Tickets Issued</span>
        </div>
      </div>

      {/* Navigation Tabs (ADMIN ONLY) */}
      <div className="flex items-center gap-1.5 sm:gap-2 border-b border-slate-800 pb-3 mb-6 sm:mb-8 overflow-x-auto whitespace-nowrap scrollbar-none">
        <button
          onClick={() => setActiveTab("events")}
          className={`px-3 sm:px-4 py-2 rounded-xl text-[11px] sm:text-xs font-bold transition-all shrink-0 ${
            activeTab === "events"
              ? "bg-violet-600 text-white"
              : "bg-slate-900 text-slate-400 hover:text-white"
          }`}
        >
          <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 inline-block mr-1.5 -mt-0.5" /> Events ({eventsList.length})
        </button>

        <button
          onClick={() => setActiveTab("coupons")}
          className={`px-3 sm:px-4 py-2 rounded-xl text-[11px] sm:text-xs font-bold transition-all shrink-0 ${
            activeTab === "coupons"
              ? "bg-violet-600 text-white"
              : "bg-slate-900 text-slate-400 hover:text-white"
          }`}
        >
          <Tag className="w-3.5 h-3.5 sm:w-4 sm:h-4 inline-block mr-1.5 -mt-0.5" /> Coupons ({couponsList.length})
        </button>

        <button
          onClick={() => setActiveTab("attendees")}
          className={`px-3 sm:px-4 py-2 rounded-xl text-[11px] sm:text-xs font-bold transition-all shrink-0 ${
            activeTab === "attendees"
              ? "bg-violet-600 text-white"
              : "bg-slate-900 text-slate-400 hover:text-white"
          }`}
        >
          <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 inline-block mr-1.5 -mt-0.5" /> Attendees ({ordersList.length})
        </button>
      </div>

      {/* TAB 1: EVENTS (ADMIN) */}
      {activeTab === "events" && (
        <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl flex flex-col gap-4 sm:gap-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-bold text-white">Event Directory</h3>
            <Button variant="secondary" size="sm" onClick={fetchEvents} className="text-xs">
              <RefreshCcw className="w-3.5 h-3.5" /> Refresh
            </Button>
          </div>

          {loadingEvents ? (
            <p className="text-xs text-slate-400 py-6 text-center">Loading events database...</p>
          ) : eventsList.length === 0 ? (
            <div className="p-8 sm:p-12 text-center flex flex-col items-center gap-3">
              <Calendar className="w-8 h-8 sm:w-10 sm:h-10 text-slate-600" />
              <p className="text-sm font-bold text-white">No active events found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:gap-4">
              {eventsList.map((evt) => (
                <div
                  key={evt.id}
                  className="p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4"
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    {evt.banner_url ? (
                      <img src={evt.banner_url} alt="Banner" className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl object-cover shrink-0" />
                    ) : (
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-violet-600/20 text-violet-400 flex items-center justify-center font-bold text-xs shrink-0">
                        EVENT
                      </div>
                    )}
                    <div className="min-w-0">
                      <h4 className="font-bold text-white text-xs sm:text-sm truncate">{evt.title}</h4>
                      <p className="text-[11px] sm:text-xs text-slate-400 truncate">{evt.venue_name} • {evt.city}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto">
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

      {/* TAB 2: COUPONS (ADMIN) */}
      {activeTab === "coupons" && (
        <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl flex flex-col gap-4 sm:gap-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-bold text-white">Promo Codes & Coupons</h3>
            <Button variant="glow" size="sm" onClick={() => setShowCouponModal(true)} className="text-xs">
              <PlusCircle className="w-4 h-4" /> Add Code
            </Button>
          </div>

          {/* Desktop Coupons Table */}
          <div className="hidden sm:block overflow-x-auto">
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

          {/* Mobile Coupons Cards */}
          <div className="flex flex-col gap-3 sm:hidden">
            {couponsList.map((c) => (
              <div key={c.id} className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex justify-between items-center">
                <div className="flex flex-col gap-0.5">
                  <span className="font-mono font-bold text-violet-400 text-sm">{c.code}</span>
                  <span className="text-[11px] text-slate-400 capitalize">{c.discount_type} • {c.times_used} uses</span>
                </div>
                <span className="font-extrabold text-white text-xs bg-violet-500/10 border border-violet-500/30 px-2.5 py-1 rounded-xl">
                  {c.discount_type === "percentage" ? `${c.discount_value}% OFF` : `$${c.discount_value} OFF`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: ATTENDEES & REFUNDS (ADMIN) */}
      {activeTab === "attendees" && (
        <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl flex flex-col gap-4 sm:gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <h3 className="text-base sm:text-lg font-bold text-white">Attendee Orders & Refunds</h3>
            <div className="w-full sm:w-64">
              <Input
                icon={Search}
                placeholder="Search attendee..."
                value={searchAttendee}
                onChange={(e) => setSearchAttendee(e.target.value)}
              />
            </div>
          </div>

          {/* Desktop Attendees Table */}
          <div className="hidden sm:block overflow-x-auto">
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
                {filteredOrders.map((ord) => (
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
                        {(ord.status || "valid").toUpperCase()}
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

          {/* Mobile Attendees Cards */}
          <div className="flex flex-col gap-3 sm:hidden">
            {filteredOrders.map((ord) => (
              <div key={ord.id} className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] text-slate-400">{ord.order_number}</span>
                  <Badge variant={ord.status === "paid" ? "emerald" : "rose"}>
                    {(ord.status || "valid").toUpperCase()}
                  </Badge>
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-white text-sm">{ord.name}</span>
                  <span className="text-xs text-slate-400">{ord.email}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <span className="font-extrabold text-emerald-400 text-sm">{ord.amount}</span>
                  {ord.status === "paid" && (
                    <Button variant="danger" size="sm" onClick={() => handleRefundOrder(ord.id)}>
                      Issue Refund
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CREATE EVENT MODAL (ADMIN ONLY) */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Event"
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

          <Button type="submit" variant="glow" size="lg" isLoading={isSubmittingEvent} className="mt-2 justify-center">
            Publish Event
          </Button>
        </form>
      </Modal>

      {/* CREATE COUPON MODAL (ADMIN ONLY) */}
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

          <Button type="submit" variant="glow" size="lg" className="mt-2 justify-center">
            Create Coupon
          </Button>
        </form>
      </Modal>

      {/* LIVE SCANNER MODAL (ADMIN ONLY MODAL TRIGGER) */}
      <QRScannerModal
        isOpen={showScannerModal}
        onClose={() => setShowScannerModal(false)}
      />
    </div>
  );
}
