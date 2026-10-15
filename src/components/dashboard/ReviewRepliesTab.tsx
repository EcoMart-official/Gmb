import React, { useState } from 'react';
import {
  MessageSquareCode,
  Sparkles,
  Star,
  CheckCircle2,
  Clock,
  Send,
  Edit3,
  RefreshCw,
  PlusCircle,
  ShieldCheck,
  Filter,
  Sliders,
  Check,
} from 'lucide-react';
import { CustomerReview, BusinessSettings } from '../../types';
import { api } from '../../lib/api';
import { useToast } from '../../context/ToastContext';

interface ReviewRepliesTabProps {
  reviews: CustomerReview[];
  settings: BusinessSettings;
  onRefreshReviews: () => void;
  onUpdateSettings: (newSettings: BusinessSettings) => void;
}

export function ReviewRepliesTab({
  reviews,
  settings,
  onRefreshReviews,
  onUpdateSettings,
}: ReviewRepliesTabProps) {
  const { showSuccess, showError } = useToast();

  const [ratingFilter, setRatingFilter] = useState<'all' | '5' | '4' | 'critical'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'drafted' | 'published'>('all');

  const [autoReplyEnabled, setAutoReplyEnabled] = useState(settings.autoReplyEnabled);
  const [autoReplyMode, setAutoReplyMode] = useState(settings.autoReplyMode || 'approval');
  const [minStarRating, setMinStarRating] = useState(settings.minStarRating || 4);
  const [delayMinutes, setDelayMinutes] = useState(settings.responseDelayMinutes || 5);
  const [savingRules, setSavingRules] = useState(false);

  const [generatingForId, setGeneratingForId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [publishingId, setPublishingId] = useState<string | null>(null);

  const [showTestModal, setShowTestModal] = useState(false);
  const [testAuthor, setTestAuthor] = useState('Jordan Lee');
  const [testRating, setTestRating] = useState(5);
  const [testReviewText, setTestReviewText] = useState('Outstanding coffee and sourdough bread! The morning staff is always cheerful.');
  const [simulating, setSimulating] = useState(false);

  const handleSaveAutomationRules = async () => {
    setSavingRules(true);
    try {
      const res = await api.updateBusinessSettings({
        autoReplyEnabled,
        autoReplyMode,
        minStarRating,
        responseDelayMinutes: delayMinutes,
      });

      if (res.error) {
        showError(res.error);
      } else {
        showSuccess('Review automation rules saved.');
        onUpdateSettings(res.settings);
      }
    } catch {
      showError('Failed to save automation rules.');
    } finally {
      setSavingRules(false);
    }
  };

  const handleGenerateAiReply = async (review: CustomerReview) => {
    setGeneratingForId(review.id);
    try {
      const res = await api.generateReply({
        authorName: review.authorName,
        starRating: review.starRating,
        reviewText: review.reviewText,
        tone: settings.brandTone,
      });

      if (res.success && res.reply) {
        setReplyDrafts((prev) => ({ ...prev, [review.id]: res.reply }));
        setEditingId(review.id);
        showSuccess('AI reply drafted using Gemini 3.8 Flash.');
      } else {
        showError(res.error || 'Failed to generate AI reply.');
      }
    } catch {
      showError('Network error while requesting AI reply.');
    } finally {
      setGeneratingForId(null);
    }
  };

  const handlePublishReply = async (reviewId: string, action: 'publish' | 'draft') => {
    const textToSubmit = replyDrafts[reviewId] ?? '';
    if (!textToSubmit.trim()) {
      showError('Reply text cannot be empty.');
      return;
    }

    setPublishingId(reviewId);
    try {
      const res = await api.submitReply(reviewId, textToSubmit, action);
      if (res.success) {
        showSuccess(action === 'publish' ? 'Reply published to Google Maps!' : 'Reply draft saved.');
        setEditingId(null);
        onRefreshReviews();
      }
    } catch {
      showError('Failed to publish reply.');
    } finally {
      setPublishingId(null);
    }
  };

  const handleSimulateReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setSimulating(true);
    try {
      const res = await api.testIncomingReview({
        authorName: testAuthor,
        starRating: testRating,
        reviewText: testReviewText,
      });

      if (res.success) {
        showSuccess(res.message);
        setShowTestModal(false);
        onRefreshReviews();
      }
    } catch {
      showError('Failed to simulate test review.');
    } finally {
      setSimulating(false);
    }
  };

  const filteredReviews = reviews.filter((r) => {
    if (ratingFilter === '5' && r.starRating !== 5) return false;
    if (ratingFilter === '4' && r.starRating !== 4) return false;
    if (ratingFilter === 'critical' && r.starRating > 3) return false;

    if (statusFilter === 'pending' && r.replyStatus !== 'pending') return false;
    if (statusFilter === 'drafted' && r.replyStatus !== 'drafted') return false;
    if (statusFilter === 'published' && r.replyStatus !== 'published') return false;

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-white border border-[#dadce0] rounded-xl p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#e8f0fe] text-[#1a73e8] flex items-center justify-center shrink-0">
              <MessageSquareCode className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#202124]">
                Customer Reviews & Gemini Auto-Replies
              </h2>
              <p className="text-xs sm:text-sm text-[#5f6368] mt-0.5">
                Monitor incoming reviews, generate empathetic owner replies tailored to your brand voice with Gemini 3.8 Flash, or enable automated replies.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowTestModal(true)}
              className="px-3.5 py-2 bg-white hover:bg-[#f8f9fa] border border-[#dadce0] text-[#1a73e8] font-medium rounded-md text-xs flex items-center gap-2 transition-colors cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Simulate New Review</span>
            </button>
            <button
              onClick={onRefreshReviews}
              className="p-2 border border-[#dadce0] rounded-md text-[#5f6368] hover:text-[#202124] hover:bg-[#f8f9fa] transition-colors"
              title="Refresh reviews"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Auto-Reply Rules Configuration Card */}
      <div className="bg-white border border-[#dadce0] rounded-xl p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#dadce0] pb-4">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#1a73e8]" />
            <h3 className="font-bold text-sm text-[#202124]">
              AI Auto-Reply Policy & Guardrails
            </h3>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs font-medium text-[#202124] cursor-pointer">
              <input
                type="checkbox"
                checked={autoReplyEnabled}
                onChange={(e) => setAutoReplyEnabled(e.target.checked)}
                className="w-4 h-4 text-[#1a73e8] rounded border-[#dadce0] focus:ring-[#1a73e8]"
              />
              <span>Enable Automatic Replies</span>
            </label>

            <button
              onClick={handleSaveAutomationRules}
              disabled={savingRules}
              className="px-3.5 py-1.5 bg-[#1a73e8] hover:bg-[#1557b0] text-white rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              {savingRules ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              <span>Save Rules</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 bg-[#f8f9fa] rounded-lg border border-[#dadce0] space-y-1.5">
            <span className="font-semibold text-[#5f6368] uppercase tracking-wider text-[11px]">
              Publishing Mode
            </span>
            <select
              value={autoReplyMode}
              onChange={(e) => setAutoReplyMode(e.target.value as 'automatic' | 'approval')}
              className="w-full px-2.5 py-1.5 bg-white border border-[#dadce0] rounded-md text-[#202124]"
            >
              <option value="approval">Draft Only (Require Manual Approval)</option>
              <option value="automatic">Instant Auto-Publish to Google Maps</option>
            </select>
            <p className="text-[11px] text-[#5f6368]">
              {autoReplyMode === 'approval'
                ? 'AI prepares drafts for you to review before publishing.'
                : 'Replies post directly to Google once generated.'}
            </p>
          </div>

          <div className="p-3.5 bg-[#f8f9fa] rounded-lg border border-[#dadce0] space-y-1.5">
            <span className="font-semibold text-[#5f6368] uppercase tracking-wider text-[11px]">
              Star Rating Filter
            </span>
            <select
              value={minStarRating}
              onChange={(e) => setMinStarRating(parseInt(e.target.value, 10))}
              className="w-full px-2.5 py-1.5 bg-white border border-[#dadce0] rounded-md text-[#202124]"
            >
              <option value="5">Only 5-Star Reviews</option>
              <option value="4">4 and 5-Star Reviews (Recommended)</option>
              <option value="1">All Ratings (1 to 5 Stars)</option>
            </select>
            <p className="text-[11px] text-[#5f6368]">
              Critical reviews below the threshold are held for human owner review.
            </p>
          </div>

          <div className="p-3.5 bg-[#f8f9fa] rounded-lg border border-[#dadce0] space-y-1.5">
            <span className="font-semibold text-[#5f6368] uppercase tracking-wider text-[11px]">
              Response Timing Buffer
            </span>
            <select
              value={delayMinutes}
              onChange={(e) => setDelayMinutes(parseInt(e.target.value, 10))}
              className="w-full px-2.5 py-1.5 bg-white border border-[#dadce0] rounded-md text-[#202124]"
            >
              <option value="1">Immediate (1 minute)</option>
              <option value="5">Organic Delay (5 minutes)</option>
              <option value="30">30 minutes</option>
              <option value="120">2 hours</option>
            </select>
            <p className="text-[11px] text-[#5f6368]">
              Adds a delay so responses appear naturally timed.
            </p>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-3.5 rounded-lg border border-[#dadce0] text-xs">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#5f6368]" />
          <span className="font-semibold text-[#202124]">Ratings:</span>
          <div className="flex gap-1.5">
            {[
              { id: 'all', label: 'All Ratings' },
              { id: '5', label: '5 Stars' },
              { id: '4', label: '4 Stars' },
              { id: 'critical', label: '1-3 Stars' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setRatingFilter(f.id as any)}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  ratingFilter === f.id
                    ? 'bg-[#1a73e8] text-white'
                    : 'bg-[#f1f3f4] text-[#3c4043] hover:bg-[#e8eaed]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[#5f6368]">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-2.5 py-1 bg-white border border-[#dadce0] rounded-md text-[#3c4043] font-medium"
          >
            <option value="all">All Reviews ({reviews.length})</option>
            <option value="pending">Pending Reply</option>
            <option value="drafted">Drafted</option>
            <option value="published">Published</option>
          </select>
        </div>
      </div>

      {/* Reviews Feed */}
      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <div className="bg-white border border-[#dadce0] rounded-xl p-10 text-center text-[#5f6368]">
            <MessageSquareCode className="w-10 h-10 mx-auto text-[#dadce0] mb-2" />
            <p className="font-medium text-sm">No reviews match the selected filter criteria.</p>
          </div>
        ) : (
          filteredReviews.map((review) => {
            const isEditing = editingId === review.id;
            const currentDraft = replyDrafts[review.id] ?? review.replyText ?? '';

            return (
              <div
                key={review.id}
                className="bg-white border border-[#dadce0] rounded-xl p-5 sm:p-6 shadow-xs space-y-4"
              >
                {/* Author & Rating Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#1a73e8] text-white flex items-center justify-center font-bold text-sm shrink-0">
                      {review.authorName.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-[#202124]">
                        {review.authorName}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <div className="flex text-[#f9ab00]">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${
                                i < review.starRating
                                  ? 'fill-current'
                                  : 'text-[#dadce0]'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-[#5f6368]">
                          {new Date(review.reviewDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {review.replyStatus === 'published' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#e6f4ea] text-[#137333] border border-[#ceead6]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Reply Published {review.autoReplied && '(Auto)'}</span>
                      </span>
                    )}
                    {review.replyStatus === 'drafted' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#e8f0fe] text-[#1a73e8] border border-[#d2e3fc]">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Draft Ready</span>
                      </span>
                    )}
                    {review.replyStatus === 'pending' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#fef7e0] text-[#b06000] border border-[#feefc3]">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Pending Response</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Review Text */}
                <p className="text-sm text-[#3c4043] leading-relaxed bg-[#f8f9fa] p-3.5 rounded-lg border border-[#dadce0]">
                  "{review.reviewText}"
                </p>

                {/* Owner Reply Area */}
                <div className="pt-2 border-t border-[#dadce0]">
                  {isEditing ? (
                    <div className="space-y-3 bg-[#f8f9fa] p-4 rounded-lg border border-[#dadce0]">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-[#1a73e8] flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5" /> Owner Reply Draft
                        </span>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="text-[#5f6368] hover:text-[#202124]"
                        >
                          Cancel
                        </button>
                      </div>

                      <textarea
                        rows={3}
                        value={currentDraft}
                        onChange={(e) =>
                          setReplyDrafts({ ...replyDrafts, [review.id]: e.target.value })
                        }
                        className="w-full p-3 bg-white border border-[#dadce0] rounded-md text-xs text-[#202124] focus:outline-none focus:border-[#1a73e8]"
                      />

                      <div className="flex items-center justify-end gap-2 text-xs">
                        <button
                          onClick={() => handlePublishReply(review.id, 'draft')}
                          disabled={publishingId === review.id}
                          className="px-3 py-1.5 border border-[#dadce0] bg-white rounded-md text-[#3c4043] font-medium hover:bg-[#f8f9fa]"
                        >
                          Save Draft
                        </button>
                        <button
                          onClick={() => handlePublishReply(review.id, 'publish')}
                          disabled={publishingId === review.id}
                          className="px-4 py-1.5 bg-[#1a73e8] hover:bg-[#1557b0] text-white rounded-md font-medium flex items-center gap-1.5"
                        >
                          {publishingId === review.id ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Send className="w-3.5 h-3.5" />
                          )}
                          <span>Publish to Google Maps</span>
                        </button>
                      </div>
                    </div>
                  ) : review.replyText ? (
                    <div className="bg-[#f8f9fa] p-4 rounded-lg border border-[#dadce0]">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-[#202124] flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-[#1a73e8]" />
                          <span>Owner Response:</span>
                        </span>
                        <button
                          onClick={() => {
                            setReplyDrafts({ ...replyDrafts, [review.id]: review.replyText! });
                            setEditingId(review.id);
                          }}
                          className="text-xs text-[#1a73e8] hover:underline flex items-center gap-1"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                      </div>
                      <p className="text-xs text-[#3c4043] leading-relaxed">
                        {review.replyText}
                      </p>
                      {review.replyDate && (
                        <div className="text-[11px] text-[#5f6368] mt-2">
                          Published: {new Date(review.replyDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[#5f6368]">
                        No reply posted yet for this review.
                      </span>
                      <button
                        onClick={() => handleGenerateAiReply(review)}
                        disabled={generatingForId === review.id}
                        className="px-3.5 py-1.5 bg-[#1a73e8] hover:bg-[#1557b0] text-white rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        {generatingForId === review.id ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Sparkles className="w-3.5 h-3.5" />
                        )}
                        <span>Draft AI Reply with Gemini</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Simulator Modal */}
      {showTestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white border border-[#dadce0] rounded-xl max-w-lg w-full p-6 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#dadce0]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#1a73e8]" />
                <h3 className="font-bold text-base text-[#202124]">
                  Simulate New Google Review
                </h3>
              </div>
              <button
                onClick={() => setShowTestModal(false)}
                className="text-[#5f6368] hover:text-[#202124] text-sm p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSimulateReview} className="mt-4 space-y-3.5 text-xs">
              <p className="text-[#5f6368]">
                Test how your Gemini AI auto-reply system acts when a real customer posts a new Google Maps review.
              </p>

              <div>
                <label className="block font-semibold text-[#202124] mb-1">
                  Customer Author Name
                </label>
                <input
                  type="text"
                  required
                  value={testAuthor}
                  onChange={(e) => setTestAuthor(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#dadce0] rounded-md text-[#202124] focus:outline-none focus:border-[#1a73e8]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#202124] mb-1">
                  Star Rating
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setTestRating(star)}
                      className={`flex-1 py-1.5 rounded-md border font-bold flex items-center justify-center gap-1 ${
                        testRating === star
                          ? 'bg-[#1a73e8] text-white border-[#1a73e8]'
                          : 'bg-white border-[#dadce0] text-[#3c4043]'
                      }`}
                    >
                      <span>{star}</span>
                      <Star className="w-3 h-3 fill-current" />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#202124] mb-1">
                  Review Text
                </label>
                <textarea
                  rows={3}
                  required
                  value={testReviewText}
                  onChange={(e) => setTestReviewText(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#dadce0] rounded-md text-[#202124] focus:outline-none focus:border-[#1a73e8]"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowTestModal(false)}
                  className="px-4 py-2 border border-[#dadce0] rounded-md text-[#5f6368] font-medium hover:bg-[#f8f9fa]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={simulating}
                  className="px-4 py-2 bg-[#1a73e8] hover:bg-[#1557b0] text-white rounded-md font-medium flex items-center gap-1.5"
                >
                  {simulating && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Trigger Simulated Review</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
