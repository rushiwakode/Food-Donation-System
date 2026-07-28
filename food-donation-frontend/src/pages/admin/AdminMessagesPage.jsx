import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { ChatBubbleLeftRightIcon, EnvelopeOpenIcon } from '@heroicons/react/24/outline';
import Badge from '../../components/common/Badge';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';
import apiClient from '../../services/apiClient';
import { formatDateTime } from '../../utils/formatters';

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState([]);
  const [pageData, setPageData] = useState({ totalPages: 0 });
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [replyingId, setReplyingId] = useState(null);
  const [replyNote, setReplyNote] = useState('');

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get('/public/contact/admin', { params: { page, size: 10 } });
      setMessages(data.data.content);
      setPageData(data.data);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  const handleReply = async () => {
    if (!replyNote.trim()) { toast.error('Please add a reply note'); return; }
    try {
      await apiClient.put(`/public/contact/admin/${replyingId}/reply`, { replyNote });
      toast.success('Marked as replied');
      setReplyingId(null);
      setReplyNote('');
      fetchMessages();
    } catch (err) {
      toast.error('Failed to update message');
    }
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-forest-900 dark:text-cream-50 mb-6">Contact Messages</h1>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-24 w-full" />)}</div>
      ) : messages.length === 0 ? (
        <EmptyState icon={ChatBubbleLeftRightIcon} title="No messages yet" description="Contact form submissions will appear here." />
      ) : (
        <div className="space-y-3">
          {messages.map((m) => (
            <div key={m.id} className="card p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-display font-semibold text-forest-900 dark:text-cream-50">{m.subject}</h3>
                  <p className="text-sm text-forest-500 dark:text-cream-300 mt-1">{m.name} · {m.email}{m.phone ? ` · ${m.phone}` : ''}</p>
                </div>
                <Badge status={m.status} />
              </div>
              <p className="text-sm text-forest-700 dark:text-cream-200 mt-3">{m.message}</p>
              <p className="text-xs text-forest-400 dark:text-cream-400 mt-2">{formatDateTime(m.createdAt)}</p>
              {m.replyNote && (
                <div className="mt-3 p-3 rounded-lg bg-forest-50 dark:bg-forest-800/50 text-sm text-forest-700 dark:text-cream-200">
                  <strong>Reply note:</strong> {m.replyNote}
                </div>
              )}
              {m.status !== 'REPLIED' && (
                <button onClick={() => setReplyingId(m.id)} className="btn-secondary !py-2 mt-3">
                  <EnvelopeOpenIcon className="w-4 h-4" /> Mark as Replied
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <Pagination pageNumber={page} totalPages={pageData.totalPages} onPageChange={setPage} />

      {replyingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest-950/50 backdrop-blur-sm" onClick={() => setReplyingId(null)}>
          <div className="glass-card bg-white dark:bg-forest-900 p-6 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display text-lg font-semibold mb-3">Reply Note</h3>
            <textarea className="input-field" rows={3} value={replyNote} onChange={(e) => setReplyNote(e.target.value)}
              placeholder="Summarize how you responded…" />
            <div className="flex gap-3 justify-end mt-4">
              <button className="btn-secondary" onClick={() => setReplyingId(null)}>Cancel</button>
              <button className="btn-primary" onClick={handleReply}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
