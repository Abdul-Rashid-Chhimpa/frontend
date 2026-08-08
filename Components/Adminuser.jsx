import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  Users,
  Search,
  Filter,
  ShieldBan,
  ShieldCheck,
  Mail,
  Phone,
  Calendar,
  ShoppingBag,
  IndianRupee,
  MoreVertical,
  Eye,
  X,
  UserRound,
  RefreshCw,
  MapPin,
  Trash2,
} from "lucide-react";

const API_BASE = "https://backend-3-axez.onrender.com/api";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  // ---------- MAP BACKEND USER → UI ----------
  const mapUser = (u) => ({
    _id: u._id,
    name: u.name || "Unknown",
    email: u.email || "N/A",
    phone: u.mobile || u.phone || "N/A",
    address: u.address || "",
    city: u.city || "",
    state: u.state || "",
    pincode: u.pincode || "",
    country: u.country || "India",
    createdAt: u.createdAt,
    lastLogin: u.updatedAt || u.createdAt,
    orders: u.orders ?? u.orderCount ?? 0,
    totalSpent: u.totalSpent ?? u.spent ?? 0,
    status: u.status === "blocked" || u.isBlocked === true ? "blocked" : "active",
    role: u.role || "user",
  });

  // ---------- FETCH USERS ----------
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const { data } = await axios.get(`${API_BASE}/users`);

      if (data.success) {
        const mapped = (data.users || []).map(mapUser);
        setUsers(mapped);
      } else {
        setUsers([]);
        setError(data.message || "Failed to load users");
      }
    } catch (err) {
      console.error(err);
      setUsers([]);
      setError(
        err.response?.data?.message ||
          "Users load nahi ho paye. API check karo (GET /api/users)"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ---------- FILTER ----------
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        user.name.toLowerCase().includes(q) ||
        user.email.toLowerCase().includes(q) ||
        String(user.phone).includes(q) ||
        (user.city || "").toLowerCase().includes(q);

      const matchStatus =
        statusFilter === "all" || user.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [users, search, statusFilter]);

  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => u.status === "active").length;
    const blocked = users.filter((u) => u.status === "blocked").length;
    const totalRevenue = users.reduce(
      (sum, u) => sum + (Number(u.totalSpent) || 0),
      0
    );
    return { total, active, blocked, totalRevenue };
  }, [users]);

  // ---------- BLOCK / UNBLOCK ----------
  const toggleBlock = async (id) => {
    try {
      setActionLoading(id);

      const { data } = await axios.patch(
        `${API_BASE}/users/${id}/toggle-block`
      );

      if (data.success) {
        const newStatus =
          data.user?.status ||
          (users.find((u) => u._id === id)?.status === "active"
            ? "blocked"
            : "active");

        setUsers((prev) =>
          prev.map((u) => (u._id === id ? { ...u, status: newStatus } : u))
        );

        if (selectedUser?._id === id) {
          setSelectedUser((prev) =>
            prev ? { ...prev, status: newStatus } : null
          );
        }
      } else {
        alert(data.message || "Action failed");
      }
    } catch (err) {
      console.error(err);
      alert(
        err.response?.data?.message ||
          "Block/Unblock fail. API check karo (PATCH /api/users/:id/toggle-block)"
      );
    } finally {
      setActionLoading(null);
      setMenuOpenId(null);
    }
  };
  // ---------- DELETE USER ----------
const handleDelete = async (id, name) => {
  const ok = window.confirm(
    `Delete user "${name}"?\n\nYe action permanent hai. Database se data hat jayega.`
  );
  if (!ok) return;

  try {
    setActionLoading(id);
    const { data } = await axios.delete(`${API_BASE}/users/${id}`);

    if (data.success) {
      setUsers((prev) => prev.filter((u) => u._id !== id));
      if (selectedUser?._id === id) setSelectedUser(null);
    } else {
      alert(data.message || "Delete failed");
    }
  } catch (err) {
    console.error(err);
    alert(
      err.response?.data?.message ||
        "Delete fail. API check karo (DELETE /api/users/:id)"
    );
  } finally {
    setActionLoading(null);
    setMenuOpenId(null);
  }
};

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const fullAddress = (user) =>
    [user.address, user.city, user.state, user.pincode, user.country]
      .filter(Boolean)
      .join(", ");

  // ---------- LOADING ----------
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 sm:w-14 sm:h-14 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-600 font-medium text-sm sm:text-base">
            Loading users...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-3 sm:p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg">
              <Users className="text-white w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-800">
                Users
              </h1>
              <p className="text-xs sm:text-sm text-gray-500">
                Manage customers & accounts
              </p>
            </div>
          </div>

          <button
            onClick={fetchUsers}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 transition shadow-sm"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 sm:mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
            {error}
            <p className="text-xs mt-1 text-red-500">
              Backend pe{" "}
              <code className="bg-red-100 px-1 rounded">GET /api/users</code>{" "}
              hona chahiye
            </p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="bg-white rounded-xl sm:rounded-2xl p-3.5 sm:p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-[11px] sm:text-xs font-medium text-gray-500 uppercase">
                Total Users
              </p>
              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                <Users size={16} className="text-indigo-600" />
              </div>
            </div>
            <p className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-800 mt-2">
              {stats.total}
            </p>
          </div>

          <div className="bg-white rounded-xl sm:rounded-2xl p-3.5 sm:p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-[11px] sm:text-xs font-medium text-gray-500 uppercase">
                Active
              </p>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                <ShieldCheck size={16} className="text-emerald-600" />
              </div>
            </div>
            <p className="text-xl sm:text-2xl md:text-3xl font-extrabold text-emerald-600 mt-2">
              {stats.active}
            </p>
          </div>

          <div className="bg-white rounded-xl sm:rounded-2xl p-3.5 sm:p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-[11px] sm:text-xs font-medium text-gray-500 uppercase">
                Blocked
              </p>
              <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                <ShieldBan size={16} className="text-red-500" />
              </div>
            </div>
            <p className="text-xl sm:text-2xl md:text-3xl font-extrabold text-red-500 mt-2">
              {stats.blocked}
            </p>
          </div>

          <div className="bg-white rounded-xl sm:rounded-2xl p-3.5 sm:p-5 border border-gray-100 shadow-sm col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between">
              <p className="text-[11px] sm:text-xs font-medium text-gray-500 uppercase">
                Total Spent
              </p>
              <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                <IndianRupee size={16} className="text-purple-600" />
              </div>
            </div>
            <p className="text-xl sm:text-2xl md:text-3xl font-extrabold text-purple-600 mt-2">
              ₹{stats.totalRevenue.toLocaleString("en-IN")}
            </p>
          </div>
        </div>

        {/* Search + Filter */}
        <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm p-3 sm:p-4 mb-5 sm:mb-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search name, email, phone or city..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto">
              <Filter
                size={16}
                className="text-gray-400 shrink-0 hidden sm:block"
              />
              {["all", "active", "blocked"].map((f) => (
                <button
                  key={f}
                  onClick={() => setStatusFilter(f)}
                  className={`px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold capitalize whitespace-nowrap transition ${
                    statusFilter === f
                      ? "bg-indigo-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">
          Showing{" "}
          <span className="font-semibold text-indigo-600">
            {filteredUsers.length}
          </span>{" "}
          users
        </p>

        {/* ========== DESKTOP TABLE ========== */}
        <div className="hidden md:block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 text-white text-sm">
                  <th className="px-4 lg:px-6 py-3.5 font-semibold">User</th>
                  <th className="px-4 lg:px-6 py-3.5 font-semibold">Contact</th>
                  <th className="px-4 lg:px-6 py-3.5 font-semibold">Orders</th>
                  <th className="px-4 lg:px-6 py-3.5 font-semibold">Spent</th>
                  <th className="px-4 lg:px-6 py-3.5 font-semibold">Joined</th>
                  <th className="px-4 lg:px-6 py-3.5 font-semibold">Status</th>
                  <th className="px-4 lg:px-6 py-3.5 font-semibold text-center">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center">
                      <td className="px-4 lg:px-6 py-4">
  <div className="flex items-center justify-center gap-2">
    <button
      onClick={() => setSelectedUser(user)}
      className="p-2 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition"
      title="View"
    >
      <Eye size={16} />
    </button>

    <button
      disabled={actionLoading === user._id}
      onClick={() => toggleBlock(user._id)}
      className={`p-2 rounded-lg transition disabled:opacity-50 ${
        user.status === "active"
          ? "bg-red-50 text-red-500 hover:bg-red-100"
          : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
      }`}
      title={user.status === "active" ? "Block" : "Unblock"}
    >
      {user.status === "active" ? (
        <ShieldBan size={16} />
      ) : (
        <ShieldCheck size={16} />
      )}
    </button>

    {/* DELETE */}
    <button
      disabled={actionLoading === user._id}
      onClick={() => handleDelete(user._id, user.name)}
      className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition disabled:opacity-50"
      title="Delete user"
    >
      <Trash2 size={16} />
    </button>
  </div>
</td>
                      <UserRound
                        size={48}
                        className="mx-auto text-gray-300 mb-3"
                      />
                      <p className="text-gray-500 font-medium">No users found</p>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr
                      key={user._id}
                      className="hover:bg-indigo-50/40 transition"
                    >
                      <td className="px-4 lg:px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-800 text-sm truncate">
                              {user.name}
                            </p>
                            <p className="text-xs text-gray-400 truncate">
                              {user.city || user.role || "—"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-4">
                        <p className="text-sm text-gray-700 flex items-center gap-1.5">
                          <Mail size={13} className="text-gray-400 shrink-0" />
                          <span className="truncate max-w-[180px]">
                            {user.email}
                          </span>
                        </p>
                        <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-1">
                          <Phone size={12} className="text-gray-400" />
                          {user.phone}
                        </p>
                      </td>
                      <td className="px-4 lg:px-6 py-4">
                        <span className="inline-flex items-center gap-1 text-sm font-semibold text-gray-700">
                          <ShoppingBag size={14} className="text-indigo-500" />
                          {user.orders}
                        </span>
                      </td>
                      <td className="px-4 lg:px-6 py-4">
                        <span className="text-sm font-bold text-indigo-700">
                          ₹{Number(user.totalSpent).toLocaleString("en-IN")}
                        </span>
                      </td>
                      <td className="px-4 lg:px-6 py-4">
                        <span className="text-sm text-gray-600 flex items-center gap-1.5">
                          <Calendar size={13} className="text-gray-400" />
                          {formatDate(user.createdAt)}
                        </span>
                      </td>
                      <td className="px-4 lg:px-6 py-4">
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                            user.status === "active"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-red-50 text-red-600"
                          }`}
                        >
                          {user.status === "active" ? "Active" : "Blocked"}
                        </span>
                      </td>
                      <td className="px-4 lg:px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setSelectedUser(user)}
                            className="p-2 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition"
                            title="View"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            disabled={actionLoading === user._id}
                            onClick={() => toggleBlock(user._id)}
                            className={`p-2 rounded-lg transition disabled:opacity-50 ${
                              user.status === "active"
                                ? "bg-red-50 text-red-500 hover:bg-red-100"
                                : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                            }`}
                            title={
                              user.status === "active" ? "Block" : "Unblock"
                            }
                          >
                            {user.status === "active" ? (
                              <ShieldBan size={16} />
                            ) : (
                              <ShieldCheck size={16} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ========== MOBILE CARDS ========== */}
        <div className="md:hidden space-y-3">
          {filteredUsers.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
              <UserRound size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500 font-medium">No users found</p>
            </div>
          ) : (
            filteredUsers.map((user) => (
              <div
                key={user._id}
                className="bg-white rounded-xl border border-gray-100 shadow-sm p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold shrink-0">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-800 text-sm truncate">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>

                  <div className="relative shrink-0">
                    <button
                      onClick={() =>
                        setMenuOpenId(menuOpenId === user._id ? null : user._id)
                      }
                      className="p-1.5 rounded-lg hover:bg-gray-100"
                    >
                      <MoreVertical size={18} className="text-gray-500" />
                    </button>

                    {menuOpenId === user._id && (
                      <div className="absolute right-0 top-9 z-20 w-36 bg-white rounded-xl border border-gray-100 shadow-xl py-1.5">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setMenuOpenId(null);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-gray-700 hover:bg-indigo-50"
                        >
                          <Eye size={15} /> View
                        </button>
                        <button
                          onClick={() => toggleBlock(user._id)}
                          className={`w-full flex items-center gap-2 px-3 py-2.5 text-sm ${
                            user.status === "active"
                              ? "text-red-600 hover:bg-red-50"
                              : "text-emerald-600 hover:bg-emerald-50"
                          }`}
                        >
                          {user.status === "active" ? (
                            <>
                              <ShieldBan size={15} /> Block
                            </>
                          ) : (
                            <>
                              <ShieldCheck size={15} /> Unblock
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                      user.status === "active"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-red-50 text-red-600"
                    }`}
                  >
                    {user.status === "active" ? "Active" : "Blocked"}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-600">
                    {user.orders} orders
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700">
                    ₹{Number(user.totalSpent).toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Phone size={12} /> {user.phone}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar size={12} /> {formatDate(user.createdAt)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ========== DETAIL MODAL ========== */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setSelectedUser(null)}
          />
          <div className="relative w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 px-5 py-5 rounded-t-2xl">
              <button
                onClick={() => setSelectedUser(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30"
              >
                <X size={18} className="text-white" />
              </button>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-white text-xl font-bold">
                  {selectedUser.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {selectedUser.name}
                  </h3>
                  <span className="inline-flex mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/20 text-white">
                    {selectedUser.status === "active" ? "Active" : "Blocked"}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-indigo-50 rounded-xl p-3.5 text-center">
                  <p className="text-xs text-indigo-500 font-medium">Orders</p>
                  <p className="text-xl font-extrabold text-indigo-700 mt-1">
                    {selectedUser.orders}
                  </p>
                </div>
                <div className="bg-purple-50 rounded-xl p-3.5 text-center">
                  <p className="text-xs text-purple-500 font-medium">Spent</p>
                  <p className="text-xl font-extrabold text-purple-700 mt-1">
                    ₹{Number(selectedUser.totalSpent).toLocaleString("en-IN")}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                  <Mail size={16} className="text-gray-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] text-gray-400 uppercase">Email</p>
                    <p className="text-sm text-gray-700 truncate">
                      {selectedUser.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                  <Phone size={16} className="text-gray-400 shrink-0" />
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase">Mobile</p>
                    <p className="text-sm text-gray-700">{selectedUser.phone}</p>
                  </div>
                </div>

                {fullAddress(selectedUser) && (
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50">
                    <MapPin size={16} className="text-gray-400 shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-[10px] text-gray-400 uppercase">
                        Address
                      </p>
                      <p className="text-sm text-gray-700">
                        {fullAddress(selectedUser)}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                  <Calendar size={16} className="text-gray-400 shrink-0" />
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase">Joined</p>
                    <p className="text-sm text-gray-700">
                      {formatDate(selectedUser.createdAt)}
                    </p>
                  </div>
                </div>
              </div>

              <button
                disabled={actionLoading === selectedUser._id}
                onClick={() => toggleBlock(selectedUser._id)}
                className={`w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 transition ${
                  selectedUser.status === "active"
                    ? "bg-red-500 hover:bg-red-600 text-white"
                    : "bg-emerald-500 hover:bg-emerald-600 text-white"
                }`}
              >
                {selectedUser.status === "active" ? (
                  <>
                    <ShieldBan size={18} /> Block User
                  </>
                ) : (
                  <>
                    <ShieldCheck size={18} /> Unblock User
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {menuOpenId && (
        <div
          className="fixed inset-0 z-10 md:hidden"
          onClick={() => setMenuOpenId(null)}
        />
      )}
    </div>
  );
};

export default AdminUsers;
