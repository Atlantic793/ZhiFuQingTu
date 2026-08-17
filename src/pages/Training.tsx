import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import JobLibrary from '../components/JobLibrary';
import TrainingChat from '../components/TrainingChat';
import InterviewLibrary from '../components/InterviewLibrary';

type TrainingTab = 'jobs' | 'interviews';

const Training = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<TrainingTab>(() => {
    const tab = searchParams.get('tab');
    if (tab === 'interviews') return tab;
    return 'jobs';
  });

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'interviews' || tab === 'jobs') {
      setActiveTab(tab);
    } else if (tab === 'courses') {
      setActiveTab('jobs');
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set('tab', 'jobs');
        return next;
      }, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const switchTab = (tab: TrainingTab) => {
    setActiveTab(tab);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('tab', tab);
      if (tab !== 'interviews') next.delete('sub');
      return next;
    }, { replace: true });
  };

  return (
    <div className="pt-16 relative">
      {/* Clay blobs */}
      <div className="fixed top-16 right-8 w-36 h-36 rounded-[55%_45%_50%_50%] pointer-events-none opacity-60"
        style={{ background: 'radial-gradient(circle at 40% 35%, #a8d8ea 0%, transparent 70%)', boxShadow: 'inset 0 -6px 12px rgba(0,0,0,0.06), inset 0 3px 8px rgba(255,255,255,0.5)' }} />
      <div className="fixed bottom-16 left-6 w-28 h-28 rounded-[45%_55%_55%_45%] pointer-events-none opacity-55"
        style={{ background: 'radial-gradient(circle at 35% 30%, #f8e8a0 0%, transparent 70%)', boxShadow: 'inset 0 -5px 10px rgba(0,0,0,0.06), inset 0 3px 8px rgba(255,255,255,0.5)' }} />
      <div className="fixed top-1/2 right-12 w-24 h-24 rounded-[50%_55%_45%_50%] pointer-events-none opacity-40"
        style={{ background: 'radial-gradient(circle at 40% 35%, #fcc8a8 0%, transparent 70%)', boxShadow: 'inset 0 -4px 8px rgba(0,0,0,0.05), inset 0 2px 6px rgba(255,255,255,0.5)' }} />
      <div className="fixed bottom-1/3 left-8 w-20 h-20 rounded-[55%_45%_40%_60%] pointer-events-none opacity-40"
        style={{ background: 'radial-gradient(circle at 35% 30%, #f8b8c8 0%, transparent 70%)', boxShadow: 'inset 0 -4px 8px rgba(0,0,0,0.05), inset 0 2px 6px rgba(255,255,255,0.5)' }} />
      <div className="fixed top-[35%] left-[40%] w-14 h-14 rounded-[50%_50%_45%_55%] pointer-events-none opacity-35"
        style={{ background: 'radial-gradient(circle at 40% 35%, #d4b8e0 0%, transparent 70%)', boxShadow: 'inset 0 -3px 6px rgba(0,0,0,0.04), inset 0 1px 4px rgba(255,255,255,0.5)' }} />
      <div className="fixed bottom-[40%] right-[30%] w-16 h-16 rounded-[55%_45%_50%_50%] pointer-events-none opacity-30"
        style={{ background: 'radial-gradient(circle at 35% 30%, #a8e0c8 0%, transparent 70%)', boxShadow: 'inset 0 -3px 6px rgba(0,0,0,0.04), inset 0 1px 4px rgba(255,255,255,0.5)' }} />

      <div className="max-w-[calc(100%-24rem)] min-w-0 pl-4 sm:pl-6 lg:pl-8">

      {/* 标签栏 — 文件夹标签风格 */}
      <div className="mt-4 mb-10 relative z-10">
        <div
          className="rounded-claude-lg pl-6 pr-4 pt-3 pb-0 w-full"
          style={{
            background: 'linear-gradient(180deg, #e8e0d2 0%, #ddd5c4 100%)',
            boxShadow: 'inset 0 -3px 10px rgba(0,0,0,0.08), inset 0 2px 6px rgba(255,255,255,0.4), 0 2px 8px rgba(0,0,0,0.05)',
          }}
        >
          <div className="flex items-end gap-2">
            <button
              type="button"
              onClick={() => switchTab('jobs')}
              className="relative px-5 py-2.5 text-sm font-semibold transition-all duration-200"
              style={
                activeTab === 'jobs'
                  ? {
                      backgroundColor: '#fff',
                      color: '#0d9488',
                      borderTopLeftRadius: '12px',
                      borderTopRightRadius: '12px',
                      borderBottomLeftRadius: '0',
                      borderBottomRightRadius: '0',
                      boxShadow:
                        '0 -2px 8px rgba(0,0,0,0.06), 0 -1px 2px rgba(0,0,0,0.04), inset 0 1px 3px rgba(255,255,255,0.9), 0 2px 0 #fff',
                      transform: 'translateY(-2px)',
                      zIndex: 10,
                    }
                  : {
                      backgroundColor: 'rgba(239,232,216,0.8)',
                      color: '#787670',
                      borderTopLeftRadius: '10px',
                      borderTopRightRadius: '10px',
                      borderBottomLeftRadius: '0',
                      borderBottomRightRadius: '0',
                      boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.4)',
                    }
              }
              onMouseEnter={(e) => {
                if (activeTab !== 'jobs') {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.filter = 'brightness(1.08)';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== 'jobs') {
                  e.currentTarget.style.transform = '';
                  e.currentTarget.style.filter = '';
                }
              }}
            >
              岗位库
            </button>
            <button
              type="button"
              onClick={() => switchTab('interviews')}
              className="relative px-5 py-2.5 text-sm font-semibold transition-all duration-200"
              style={
                activeTab === 'interviews'
                  ? {
                      backgroundColor: '#fff',
                      color: '#0d9488',
                      borderTopLeftRadius: '12px',
                      borderTopRightRadius: '12px',
                      borderBottomLeftRadius: '0',
                      borderBottomRightRadius: '0',
                      boxShadow:
                        '0 -2px 8px rgba(0,0,0,0.06), 0 -1px 2px rgba(0,0,0,0.04), inset 0 1px 3px rgba(255,255,255,0.9), 0 2px 0 #fff',
                      transform: 'translateY(-2px)',
                      zIndex: 10,
                    }
                  : {
                      backgroundColor: 'rgba(239,232,216,0.8)',
                      color: '#787670',
                      borderTopLeftRadius: '10px',
                      borderTopRightRadius: '10px',
                      borderBottomLeftRadius: '0',
                      borderBottomRightRadius: '0',
                      boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.4)',
                    }
              }
              onMouseEnter={(e) => {
                if (activeTab !== 'interviews') {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.filter = 'brightness(1.08)';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== 'interviews') {
                  e.currentTarget.style.transform = '';
                  e.currentTarget.style.filter = '';
                }
              }}
            >
              面试
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'interviews' ? <InterviewLibrary /> : <JobLibrary />}
        </div>

      <aside className="hidden lg:block fixed top-16 right-4 w-80 h-[calc(100vh-4rem)] pt-4">
        <TrainingChat />
      </aside>
    </div>
  );
};

export default Training;
