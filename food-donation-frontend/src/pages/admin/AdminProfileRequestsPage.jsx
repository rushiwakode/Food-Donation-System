import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import {
  EnvelopeIcon, PhoneIcon, ClockIcon, CheckIcon, XMarkIcon,
  UserCircleIcon, CheckBadgeIcon, ExclamationTriangleIcon,
  MagnifyingGlassIcon, ArrowPathIcon, EyeIcon,
} from '@heroicons/react/24/outline';
import profileService from '../../services/profileService';
import { formatDateTime, initials } from '../../utils/formatters';

const STATUS_META = {
  PENDING:   { color: 'badge-warning',  label: 'Pending',   icon: ClockIcon,              dot: 'bg-amber-400'   },
  APPROVED:  { color: 'badge-info',     label: 'Approved',  icon: CheckIcon,              dot: 'bg-blue-400'    },
  REJECTED:  { color: 'badge-danger',   label: 'Rejected',  icon: XMarkIcon,              dot: 'bg-red-400'     },
  OTP_SENT:  { color: 'badge-purple',   label: 'OTP Sent',  icon: EnvelopeIcon,           dot: 'bg-purple-400'  },
  COMPLETED: { color: 'badge-success',  label: 'Completed', icon: CheckBadgeIcon,         dot: 'bg-emerald-400' },
  EXPIRED:   { color: 'badge-neutral',  label: 'Expired',   icon: ExclamationTriangleIcon,dot: 'bg-slate-400'   },
};

const STATUS_TABS = ['ALL', 'PENDING', 'OTP_SENT', 'COMPLETED', 'REJECTED', 'EXPIRED'];

export default function AdminProfileRequestsPage() {
  const [requests, setRequests]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [activeTab, setActiveTab]     = useState('PENDING');
  const [page, setPage]               = useState(0);
  const [totalPages, setTotalPages]   = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [search, setSearch]           = useState('');
  const [selected, setSelected]       = useState(null); // request being actioned
  const [actionType, setActionType]   = useState(null); // 'approve' | 'reject'
  const [adminNote, setAdminNote]     = useState('');
  const [actioning, setActioning]     = useState(false);
  const [detailView, setDetailView]   = useState(null);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const result = await profileService.getAllChangeRequests({
        status: activeTab === 'ALL' ? undefined : activeTab,
        page,
        size: 10,
      });
      setRequests(result.content || []);
      setTotalPages(result.totalPages || 0);
      setTotalElements(result.totalElements || 0);
    } catch {
      toast.error('Failed to load change requests');
    } finally {
      setLoading(false);
    }
  }, [activeTab, page]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Reset page when tab changes
  useEffect(() => {
    setPage(0);
  }, [activeTab]);

  const openAction = (req, type) => {
    setSelected(req);
    setActionType(type);
    setAdminNote(type === 'approve' ? 'Request approved. OTP will be sent.' : '');
  };

  const closeAction = () => {
    setSelected(null);
    setActionType(null);
    setAdminNote('');
  };

  const handleAction = async () => {
    if (!selected) return;
    if (actionType === 'reject' && !adminNote.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    setActioning(true);
    try {
      if (actionType === 'approve') {
        await profileService.approveChangeRequest(selected.id, adminNote || 'Approved');
        toast.success(`✅ Request approved — OTP sent to ${selected.requestedValue}`);
      } else {
        await profileService.rejectChangeRequest(selected.id, adminNote);
        toast.success('Request rejected and user notified');
      }
      closeAction();
      fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Action failed');
    } finally {
      setActioning(false);
    }
  };

  const filtered = search.trim()
    ? requests.filter(r =>
        r.userFullName?.toLowerCase().includes(search.toLowerCase()) ||
        r.userEmail?.toLowerCase().includes(search.toLowerCase()) ||
        r.requestedValue?.toLowerCase().includes(search.toLowerCase())
      )
    : requests;

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── HEADER ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-glow-sm">
              <UserCircleIcon className="w-5 h-5 text-white" />
            </span>
            Contact Change Requests
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            {totalElements} total requests — review, approve or reject below
          </p>
        </div>
        <button onClick={fetchRequests} className="btn-secondary !py-2">
          <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* ── SEARCH + TABS ───────────────────────────────────── */}
      <div className="space-y-3">
        <div className="relative">
          <MagnifyingGlassIcon className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="input-field pl-11"
            placeholder="Search by name, email, or requested value…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {STATUS_TABS.map(tab => {
            const meta = STATUS_META[tab];
            return (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setPage(0); }}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                  activeTab === tab
                    ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-glow-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-primary-300'
                }`}
              >
                {meta && (
                  <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                )}
                {tab}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── REQUEST LIST ────────────────────────────────────── */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="card p-5 flex gap-4">
              <div className="skeleton w-12 h-12 rounded-xl shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-4 w-1/3" />
                <div className="skeleton h-3 w-1/2" />
                <div className="skeleton h-3 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center mx-auto mb-4">
            <CheckBadgeIcon className="w-7 h-7 text-primary-300 dark:text-primary-600" />
          </div>
          <h3 className="font-display text-lg font-semibold text-slate-800 dark:text-slate-200 mb-1">
            No requests found
          </h3>
          <p className="text-slate-400 text-sm">
            {activeTab === 'PENDING'
              ? 'No pending requests — all caught up!'
              : 'No requests match this filter.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((req, i) => {
            const meta = STATUS_META[req.status] || STATUS_META.PENDING;
            const StatusIcon = meta.icon;
            const isPending = req.status === 'PENDING';

            return (
              <motion.div
                key={req.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className={`card p-5 transition-all duration-200 ${
                  isPending ? 'border-l-4 border-l-amber-400' : ''
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

                  {/* Left — user + request info */}
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-glow-sm">
                      {initials(req.userFullName)}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-slate-900 dark:text-white text-sm">
                          {req.userFullName}
                        </p>
                        <span className={`badge ${meta.color} flex items-center gap-1`}>
                          <StatusIcon className="w-3 h-3" />
                          {meta.label}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                        {req.userEmail}
                      </p>

                      {/* Change details */}
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs">
                          {req.fieldType === 'EMAIL'
                            ? <EnvelopeIcon className="w-3.5 h-3.5 text-slate-400" />
                            : <PhoneIcon    className="w-3.5 h-3.5 text-slate-400" />}
                          <span className="text-slate-500 dark:text-slate-400 font-medium">
                            {req.fieldType}
                          </span>
                        </div>
                        <span className="text-xs text-slate-400">
                          <span className="line-through text-slate-300 dark:text-slate-600">{req.currentValue}</span>
                          {' → '}
                          <span className="font-semibold text-primary-600 dark:text-primary-400">
                            {req.requestedValue}
                          </span>
                        </span>
                      </div>

                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-2">
                        <span className="font-medium">Reason: </span>{req.reason}
                      </p>

                      {req.adminNote && (
                        <p className={`text-xs mt-1 font-medium ${
                          req.status === 'REJECTED'
                            ? 'text-danger-600 dark:text-danger-400'
                            : 'text-emerald-600 dark:text-emerald-400'
                        }`}>
                          Admin note: {req.adminNote}
                        </p>
                      )}

                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5">
                        Submitted: {formatDateTime(req.createdAt)}
                        {req.reviewedAt && ` · Reviewed: ${formatDateTime(req.reviewedAt)}`}
                      </p>
                    </div>
                  </div>

                  {/* Right — action buttons */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setDetailView(req)}
                      className="btn-icon !w-9 !h-9"
                      title="View details"
                    >
                      <EyeIcon className="w-4 h-4" />
                    </button>

                    {isPending && (
                      <>
                        <button
                          onClick={() => openAction(req, 'approve')}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-600 text-white transition-colors shadow-sm"
                        >
                          <CheckIcon className="w-3.5 h-3.5" /> Approve
                        </button>
                        <button
                          onClick={() => openAction(req, 'reject')}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-danger-500 hover:bg-danger-600 text-white transition-colors shadow-sm"
                        >
                          <XMarkIcon className="w-3.5 h-3.5" /> Reject
                        </button>
                      </>
                    )}

                    {req.status === 'OTP_SENT' && (
                      <span className="text-xs text-purple-600 dark:text-purple-400 font-medium px-2">
                        Awaiting OTP verification
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ── PAGINATION ──────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            disabled={page === 0}
            onClick={() => setPage(p => p - 1)}
            className="btn-secondary !py-2 !px-4 text-sm disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-sm text-slate-500 dark:text-slate-400 px-3">
            Page {page + 1} of {totalPages}
          </span>
          <button
            disabled={page >= totalPages - 1}
            onClick={() => setPage(p => p + 1)}
            className="btn-secondary !py-2 !px-4 text-sm disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          ACTION MODAL — Approve / Reject
      ══════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {selected && actionType && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeAction}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-premium border border-slate-100 dark:border-slate-800 p-6 max-w-md w-full"
              onClick={e => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center gap-3 mb-5">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                  actionType === 'approve'
                    ? 'bg-emerald-100 dark:bg-emerald-900/30'
                    : 'bg-danger-100 dark:bg-danger-900/30'
                }`}>
                  {actionType === 'approve'
                    ? <CheckIcon  className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    : <XMarkIcon  className="w-5 h-5 text-danger-600 dark:text-danger-400" />}
                </div>
                <div>
                  <h3 className="font-display font-semibold text-slate-900 dark:text-white text-lg">
                    {actionType === 'approve' ? 'Approve Request' : 'Reject Request'}
                  </h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    Request #{selected.id} by {selected.userFullName}
                  </p>
                </div>
              </div>

              {/* Request Summary */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 mb-4 space-y-1.5 text-sm">
                <div className="flex items-center gap-2">
                  {selected.fieldType === 'EMAIL'
                    ? <EnvelopeIcon className="w-4 h-4 text-slate-400" />
                    : <PhoneIcon    className="w-4 h-4 text-slate-400" />}
                  <span className="text-slate-500 dark:text-slate-400 text-xs">{selected.fieldType} change</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  <span className="font-medium">From: </span>{selected.currentValue}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  <span className="font-medium">To: </span>
                  <span className="text-primary-600 dark:text-primary-400 font-semibold">
                    {selected.requestedValue}
                  </span>
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-medium">Reason: </span>{selected.reason}
                </p>
              </div>

              {/* Approve info */}
              {actionType === 'approve' && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 mb-4">
                  <CheckBadgeIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                  <p className="text-xs text-emerald-700 dark:text-emerald-400">
                    Approving will immediately send a 6-digit OTP to{' '}
                    <strong>{selected.requestedValue}</strong>. The user must verify it to complete the change.
                  </p>
                </div>
              )}

              {/* Admin Note */}
              <div className="mb-5">
                <label className="label-field">
                  {actionType === 'approve' ? 'Note to User (optional)' : 'Reason for Rejection *'}
                </label>
                <textarea
                  rows={3}
                  className={`input-field ${actionType === 'reject' && !adminNote.trim() ? 'input-error' : ''}`}
                  placeholder={
                    actionType === 'approve'
                      ? 'e.g. Verified your identity — OTP sent.'
                      : 'e.g. Provided reason is insufficient. Please contact support.'
                  }
                  value={adminNote}
                  onChange={e => setAdminNote(e.target.value)}
                />
                {actionType === 'reject' && !adminNote.trim() && (
                  <p className="error-text">Rejection reason is required</p>
                )}
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button onClick={closeAction} className="btn-secondary flex-1 justify-center">
                  Cancel
                </button>
                <button
                  onClick={handleAction}
                  disabled={actioning}
                  className={`flex-1 justify-center inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white transition-all duration-200 active:scale-95 ${
                    actionType === 'approve'
                      ? 'bg-emerald-500 hover:bg-emerald-600 shadow-md'
                      : 'bg-danger-500 hover:bg-danger-600 shadow-md'
                  }`}
                >
                  {actioning ? (
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  ) : actionType === 'approve' ? (
                    <><CheckIcon className="w-4 h-4" /> Approve & Send OTP</>
                  ) : (
                    <><XMarkIcon className="w-4 h-4" /> Reject Request</>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════════
          DETAIL MODAL — View full request info
      ══════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {detailView && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDetailView(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-premium border border-slate-100 dark:border-slate-800 p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-display font-semibold text-slate-900 dark:text-white">
                  Request #{detailView.id} — Full Details
                </h3>
                <button onClick={() => setDetailView(null)} className="btn-icon !w-8 !h-8">
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-sm">
                <DetailRow label="User"           value={detailView.userFullName} />
                <DetailRow label="Email"          value={detailView.userEmail} />
                <DetailRow label="Field"          value={detailView.fieldType} />
                <DetailRow label="Current Value"  value={detailView.currentValue} />
                <DetailRow label="Requested Value" value={detailView.requestedValue} highlight />
                <DetailRow label="Reason"         value={detailView.reason} />
                <DetailRow label="Status"         value={detailView.status} />
                {detailView.adminNote && (
                  <DetailRow label="Admin Note"   value={detailView.adminNote} />
                )}
                {detailView.reviewedBy && (
                  <DetailRow label="Reviewed By"  value={detailView.reviewedBy} />
                )}
                <DetailRow label="Submitted"      value={formatDateTime(detailView.createdAt)} />
                {detailView.reviewedAt && (
                  <DetailRow label="Reviewed At"  value={formatDateTime(detailView.reviewedAt)} />
                )}
                {detailView.otpSentAt && (
                  <DetailRow label="OTP Sent At"  value={formatDateTime(detailView.otpSentAt)} />
                )}
                <DetailRow
                  label="OTP Verified"
                  value={detailView.otpVerified ? 'Yes ✅' : 'No'}
                />
              </div>

              {detailView.status === 'PENDING' && (
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => { setDetailView(null); openAction(detailView, 'approve'); }}
                    className="flex-1 btn-primary justify-center text-sm"
                  >
                    <CheckIcon className="w-4 h-4" /> Approve
                  </button>
                  <button
                    onClick={() => { setDetailView(null); openAction(detailView, 'reject'); }}
                    className="flex-1 btn-danger justify-center text-sm"
                  >
                    <XMarkIcon className="w-4 h-4" /> Reject
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DetailRow({ label, value, highlight }) {
  return (
    <div className="flex gap-3 py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
      <span className="text-slate-400 dark:text-slate-500 font-medium min-w-[120px] shrink-0 text-xs uppercase tracking-wide">
        {label}
      </span>
      <span className={`${highlight ? 'text-primary-600 dark:text-primary-400 font-semibold' : 'text-slate-700 dark:text-slate-300'} break-all`}>
        {value || '—'}
      </span>
    </div>
  );
}