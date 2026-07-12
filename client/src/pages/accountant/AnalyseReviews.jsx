/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useContext, useState } from 'react';
import AccountantContext from '../../context/AccountantContext';
import Header from '../../components/common/Header';
import ItemsNotUpdated from '../../components/common/ItemsNotUpdated';
import ReviewAnalysisSkeleton from '../../components/accountant/reviewAnalysis/ReviewAnalysisSkeleton';
import AnalyzedItemCard from '../../components/accountant/reviewAnalysis/AnalyzedItemCard';
import toast from 'react-hot-toast';

export default function AnalyseReviews() {
  const { 
    reviewAnalysis, 
    loadingAnalysis, 
    fetchOrGenerateReviewAnalysis 
  } = useContext(AccountantContext);

  const [refreshing, setRefreshing] = useState(false);
  // Navigation states: 'complimented' | 'complained' | 'actions'
  const [activeTab, setActiveTab] = useState('complimented');

  useEffect(() => {
    const initLoad = async () => {
      try {
        await fetchOrGenerateReviewAnalysis(false);
      } catch (err) {
        toast.error(err.message);
      }
    };
    initLoad();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchOrGenerateReviewAnalysis(true);
      toast.success("AI review analysis refreshed!");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setRefreshing(false);
    }
  };

  if (loadingAnalysis && !refreshing) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] bg-linear-to-br from-green-50 via-green-50/40 to-white pt-16 pb-28 px-4 md:px-8">
        <Header heading="AI Review Insights" subheading="Processing operational metrics..." />
        <ReviewAnalysisSkeleton />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-linear-to-br from-green-50 via-green-50/40 to-white pt-16 pb-28 px-4 md:px-8">
      <Header 
        heading="Student's Review Insights" 
        subheading="Current menu analytics based on recent student reviews" 
      />

      <div className="max-w-7xl mx-auto">
        {!reviewAnalysis ? (
          <ItemsNotUpdated 
            heading="Insufficient Data Available" 
            subheading="Not enough student feedback have been submitted over the last 7 days." 
          />
        ) : (
          <div className="space-y-6 animate-in fade-in duration-500">
            
            {/* Control Bar Actions Layer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-2xl border border-gray-100 p-4 shadow-xs">
              <div className="text-center sm:text-left">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Total Reviews Processed</p>
                <p className="text-sm font-black text-gray-700 flex flex-col md:flex-row md:items-center">
                  {reviewAnalysis.totalReviewsAnalyzed} Forms Verified
                  <span className="font-normal text-gray-400 ml-0 md:ml-2 text-xs">
                    (Last Compiled: {new Date(reviewAnalysis.lastAnalyzedAt).toLocaleString('en-IN', {year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit'})})
                  </span>
                </p>
              </div>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="w-full sm:w-auto px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-bold shadow-md shadow-green-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {refreshing ? (
                  <>
                    <i className="fa-solid fa-circle-notch fa-spin"></i>
                    <span>Compiling Data...</span>
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-wand-magic-sparkles"></i>
                    <span>Analyse Fresh</span>
                  </>
                )}
              </button>
            </div>

            {/* Tab Controller Navigation Layout */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-100/50 overflow-hidden">
              <div className="flex border-b border-b-gray-200 bg-gray-50/50">
                {[
                  { key: 'complimented', icon: 'fa-face-smile', label: 'Compliments' },
                  { key: 'complained', icon: 'fa-face-frown-open', label: 'Complaints' },
                  { key: 'actions', icon: 'fa-bolt', label: 'Actions' }
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex-1 py-4 font-bold text-xs md:text-base capitalize border-b-2 transition-colors flex flex-col items-center justify-center gap-2 md:flex-row
                      ${activeTab === tab.key 
                        ? "border-green-500 text-green-700 bg-white" 
                        : "border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                      }`}
                  >
                    <i className={`fa-solid ${tab.icon} text-sm`}></i>
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Dynamic Tab Body Render Sections */}
              <div className="p-4 md:p-6 min-h-60">
                {activeTab === 'complimented' && (
                  <div className="space-y-4 animate-in fade-in duration-300">
                    <h3 className="text-base font-bold text-gray-700 mb-2 uppercase tracking-wide">Top Appreciated Items</h3>
                    {reviewAnalysis.topComplimentedItems.length ? (
                      reviewAnalysis.topComplimentedItems.map((item, idx) => (
                        <AnalyzedItemCard key={idx} item={item} type="compliment" />
                      ))
                    ) : (
                      <p className="text-sm italic text-gray-400 text-center py-6">No any highly complimented item.</p>
                    )}
                  </div>
                )}

                {activeTab === 'complained' && (
                  <div className="space-y-4 animate-in fade-in duration-300">
                    <h3 className="text-base font-bold text-gray-700 mb-2 uppercase tracking-wide">Critical Student Problems</h3>
                    {reviewAnalysis.topComplainedItems.length ? (
                      reviewAnalysis.topComplainedItems.map((item, idx) => (
                        <AnalyzedItemCard key={idx} item={item} type="complaint" />
                      ))
                    ) : (
                      <p className="text-sm italic text-gray-400 text-center py-6">No major problem found.</p>
                    )}
                  </div>
                )}

                {activeTab === 'actions' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
                    {[
                      {
                        title: 'Culinary Corrections',
                        icon: 'fa-screwdriver-wrench',
                        iconColor: 'text-amber-500',
                        items: reviewAnalysis.needsBetterManagement,
                        itemBg: 'bg-amber-100/30 border-amber-100/50',
                        bulletColor: 'text-amber-500'
                      },
                      {
                        title: 'Items to Remove / Replace',
                        icon: 'fa-triangle-exclamation',
                        iconColor: 'text-red-500',
                        items: reviewAnalysis.completelyReplaceOrRemove,
                        itemBg: 'bg-red-100/30 border-red-100/50',
                        bulletColor: 'text-red-500'
                      }
                    ].map((section, index) => (
                      <div key={index} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs">
                        <h4 className="font-bold text-gray-800 text-sm md:text-base mb-4 flex items-center gap-2 border-b pb-2">
                          <i className={`fa-solid ${section.icon} ${section.iconColor}`}></i> {section.title}
                        </h4>
                        <ul className="space-y-2">
                          {section.items.map((point, i) => (
                            <li key={i} className={`text-xs md:text-sm text-gray-600 font-medium flex items-center gap-2 ${section.itemBg} p-2.5 rounded-xl border`}>
                              <span className={`${section.bulletColor} text-2xl`}>•</span>
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}