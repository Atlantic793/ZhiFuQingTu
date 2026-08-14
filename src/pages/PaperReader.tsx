import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, FileQuestion } from 'lucide-react';
import { fetchPapers, getPaperImageUrls, type KaoyanPaper } from '../services/paperService';
import { SkeletonPathways } from '../components/Skeleton';

/** 读书页布局：一屏最多显示 5 张图，超出部分分组翻页。 */
const GROUP_SIZE = 5;

const PaperReader = () => {
  const { paperId } = useParams();
  const navigate = useNavigate();
  const [paper, setPaper] = useState<KaoyanPaper | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [imagesLoading, setImagesLoading] = useState(false);
  const [groupIndex, setGroupIndex] = useState(0);
  const imagesTopRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const rows = await fetchPapers();
        if (cancelled) return;
        const found = rows.find((p) => p.id === paperId) ?? null;
        setPaper(found);
        if (!found) setError('未找到该真题，可能已下架');
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : '加载失败');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [paperId]);

  useEffect(() => {
    if (!paper) return;
    let cancelled = false;
    setImagesLoading(true);
    (async () => {
      try {
        const urls = await getPaperImageUrls(paper);
        if (!cancelled) setImageUrls(urls);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : '图片加载失败，请稍后重试');
      } finally {
        if (!cancelled) setImagesLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [paper]);

  // 每 5 张一组
  const groups = useMemo(() => {
    const out: string[][] = [];
    for (let i = 0; i < imageUrls.length; i += GROUP_SIZE) {
      out.push(imageUrls.slice(i, i + GROUP_SIZE));
    }
    return out;
  }, [imageUrls]);

  const currentGroup = groups[groupIndex] ?? [];
  const currentStartIndex = groupIndex * GROUP_SIZE;

  const goGroup = (next: number) => {
    setGroupIndex(next);
    imagesTopRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="pt-20 pb-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <button
          type="button"
          onClick={() => navigate('/pathways')}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-claude-md bg-claude-surface-card text-claude-muted hover:bg-claude-hairline hover:text-claude-ink text-sm mb-6"
        >
          <ChevronRight className="w-4 h-4 rotate-180" />
          返回考研真题
        </button>

        {loading ? (
          <SkeletonPathways />
        ) : error || !paper ? (
          <div className="text-center py-16 text-claude-muted">
            <FileQuestion className="w-10 h-10 mx-auto mb-3 text-claude-muted-soft" />
            <p className="mb-4">{error || '未找到该真题'}</p>
            <button
              type="button"
              onClick={() => navigate('/pathways')}
              className="px-5 py-2 rounded-claude-lg bg-claude-primary text-white text-sm font-medium hover:opacity-90 transition-opacity"
            >
              返回列表
            </button>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <div className="flex items-start justify-between gap-3">
                <h1 className="text-2xl font-bold text-claude-ink leading-snug">{paper.title}</h1>
                <span className="text-xs px-2.5 py-1 rounded-full bg-macaron-mint/50 text-claude-body font-medium whitespace-nowrap flex-shrink-0 mt-1">
                  {paper.year} · {paper.subject}{paper.category ? ` · ${paper.category}` : ''}
                </span>
              </div>
              <p className="text-sm text-claude-muted mt-2">
                共 {paper.filePaths.length} 张 · 每屏 {GROUP_SIZE} 张
              </p>
            </div>

            <div ref={imagesTopRef} className="scroll-mt-24">
              {imagesLoading ? (
                <div className="text-center py-16 text-claude-muted">
                  <p>图片加载中…</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {currentGroup.map((url, i) => (
                    <figure key={url} className="bg-white rounded-[16px] overflow-hidden"
                      style={{ boxShadow: 'inset 0 -3px 8px rgba(0,0,0,0.03), inset 0 2px 6px rgba(255,255,255,0.7), 0 2px 10px rgba(0,0,0,0.04)' }}>
                      <img
                        src={url}
                        alt={`${paper.title} 第 ${currentStartIndex + i + 1} 张`}
                        className="w-full h-auto block"
                      />
                      <figcaption className="px-4 py-2.5 text-xs text-claude-muted border-t border-claude-hairline">
                        第 {currentStartIndex + i + 1} 张 / 共 {imageUrls.length} 张
                      </figcaption>
                    </figure>
                  ))}
                </div>
              )}
            </div>

            {!imagesLoading && groups.length > 1 && (
              <div className="mt-8 flex items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={() => goGroup(groupIndex - 1)}
                  disabled={groupIndex === 0}
                  className="inline-flex items-center gap-1 px-4 py-2 rounded-claude-md bg-claude-surface-card text-claude-body text-sm font-medium border border-claude-hairline hover:bg-claude-surface-soft transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                  上一页
                </button>
                <span className="text-sm text-claude-muted">
                  第 {groupIndex + 1} / {groups.length} 页
                </span>
                <button
                  type="button"
                  onClick={() => goGroup(groupIndex + 1)}
                  disabled={groupIndex === groups.length - 1}
                  className="inline-flex items-center gap-1 px-4 py-2 rounded-claude-md bg-claude-primary text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  下一页
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="mt-10 text-center">
              <button
                type="button"
                onClick={() => navigate('/pathways')}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-claude-md bg-claude-surface-card text-claude-muted hover:bg-claude-hairline hover:text-claude-ink text-sm"
              >
                <ChevronRight className="w-4 h-4 rotate-180" />
                返回考研真题
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PaperReader;
