/**
 * 骨架屏组件 — 用于数据加载时的占位效果
 * 匹配项目的 Clay/马卡龙粘土风格
 */

interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

/** 流动光影 keyframes（注入一次即可） */
const SHIMMER_STYLE = `
@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
`;

let _injected = false;
function injectShimmer() {
  if (_injected || typeof document === 'undefined') return;
  const style = document.createElement('style');
  style.textContent = SHIMMER_STYLE;
  document.head.appendChild(style);
  _injected = true;
}

/** 基础骨架块 — 淡色底 + 流动光影 */
export function Skeleton({ className = '', style }: SkeletonProps) {
  injectShimmer();
  return (
    <div
      className={`rounded-claude-md ${className}`}
      style={{
        background:
          'linear-gradient(110deg, #e8e3da 8%, #f0ebe0 18%, #f5f0e5 30%, #e8e3da 50%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.8s ease-in-out infinite',
        boxShadow:
          'inset 0 -2px 4px rgba(0,0,0,0.02), inset 0 1px 3px rgba(255,255,255,0.4)',
        ...style,
      }}
    />
  );
}

/** 文本行骨架 */
export function SkeletonLine({ width = '100%', className = '' }: { width?: string; className?: string }) {
  return <Skeleton className={`h-4 ${className}`} style={{ width }} />;
}

/** 标题骨架（更粗） */
export function SkeletonTitle({ width = '60%', className = '' }: { width?: string; className?: string }) {
  return <Skeleton className={`h-6 ${className}`} style={{ width }} />;
}

/** 圆形骨架 */
export function SkeletonCircle({ size = 40, className = '' }: { size?: number; className?: string }) {
  return (
    <Skeleton
      className={`rounded-full ${className}`}
      style={{ width: size, height: size }}
    />
  );
}

// ========== 页面级骨架组合 ==========

/** 评分页 - 专题网格骨架 */
export function SkeletonTopicGrid() {
  injectShimmer();
  return (
    <div className="mt-4">
      {/* 装饰面板 + 标签骨架 */}
      <div className="mb-8">
        <div
          className="rounded-claude-lg pl-6 pr-4 pt-3 pb-0"
          style={{
            background: 'linear-gradient(180deg, #e8e0d2 0%, #ddd5c4 100%)',
            boxShadow: 'inset 0 -3px 10px rgba(0,0,0,0.08), inset 0 2px 6px rgba(255,255,255,0.4), 0 2px 8px rgba(0,0,0,0.05)',
          }}
        >
          <div className="flex flex-wrap items-end gap-1">
            {['64px', '72px', '68px', '76px', '60px', '80px', '70px', '74px', '66px'].map((w, i) => (
              <div
                key={i}
                style={{
                  width: w,
                  height: '32px',
                  background: 'linear-gradient(110deg, #ddd5c4 8%, #ebe6d6 18%, #f0ebe0 30%, #ddd5c4 50%)',
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 1.8s ease-in-out infinite',
                  borderTopLeftRadius: '8px',
                  borderTopRightRadius: '8px',
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 专题卡片网格 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="relative aspect-square rounded-claude-lg overflow-hidden"
            style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.04)' }}
          >
            {/* 封面图区域 */}
            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(110deg, #e8e3da 8%, #f0ebe0 18%, #f5f0e5 30%, #e8e3da 50%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.8s ease-in-out infinite',
              }}
            />
            {/* 底部毛玻璃名称栏 */}
            <div
              className="absolute bottom-0 left-0 right-0 px-5 py-4 min-h-[5rem] flex items-center z-10"
              style={{
                backgroundColor: 'rgba(255,255,255,0.85)',
                backdropFilter: 'blur(8px)',
              }}
            >
              <div
                style={{
                  width: '65%',
                  height: '20px',
                  borderRadius: '8px',
                  background: 'linear-gradient(110deg, #e8e3da 8%, #f0ebe0 18%, #f5f0e5 30%, #e8e3da 50%)',
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 1.8s ease-in-out infinite',
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** 评分页 - 课程列表骨架 */
export function SkeletonCourseList() {
  return (
    <div className="mt-6">
      {/* 标题区域 */}
      <header className="mb-8 text-center">
        <div className="flex justify-center mb-2">
          <SkeletonTitle width="30%" />
        </div>
        <div className="flex justify-center">
          <SkeletonLine width="50%" />
        </div>
      </header>

      {/* 搜索栏 + 排序按钮 */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <Skeleton className="w-64 h-12 rounded-claude-md" />
        <Skeleton className="w-40 h-12 rounded-claude-md" />
      </div>

      {/* 课程卡片网格 */}
      <div className="grid grid-cols-1 min-[480px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-[16px] overflow-hidden bg-white"
            style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.04)' }}>
            {/* 封面图占位 */}
            <Skeleton className="w-full aspect-[16/10] rounded-none rounded-t-claude-lg" />
            {/* 底部毛玻璃标题栏 */}
            <div
              className="p-3 pt-2 space-y-2"
              style={{
                backgroundColor: 'rgba(255,255,255,0.85)',
                backdropFilter: 'blur(8px)',
              }}
            >
              <SkeletonLine width="90%" />
              <SkeletonLine width="60%" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** 评分页 - 课程详情骨架 */
export function SkeletonCourseDetail() {
  return (
    <div className="mt-6 max-w-4xl mx-auto">
      {/* 返回按钮 */}
      <Skeleton className="w-28 h-10 rounded-claude-md mb-4" />

      <div className="bg-claude-canvas rounded-claude-xl border border-claude-hairline overflow-hidden mb-8">
        {/* 封面视频区 */}
        <Skeleton className="w-full aspect-video rounded-none" />

        <div className="p-6 md:p-8 space-y-6">
          {/* 标题 */}
          <SkeletonTitle width="70%" />
          {/* UP主 / BV 信息 */}
          <SkeletonLine width="40%" />
          {/* 评分信息 */}
          <div className="flex gap-4">
            <Skeleton className="w-48 h-6 rounded-claude-md" />
            <Skeleton className="w-36 h-6 rounded-claude-md" />
          </div>
          {/* 简介 */}
          <div className="space-y-2">
            <Skeleton className="w-16 h-5 rounded-claude-md" />
            <SkeletonLine width="100%" />
            <SkeletonLine width="85%" />
            <SkeletonLine width="60%" />
          </div>
          {/* 课程目录 */}
          <div className="space-y-2">
            <Skeleton className="w-28 h-5 rounded-claude-md" />
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="w-full h-11 rounded-claude-md" />
            ))}
          </div>
          {/* 源站口碑 */}
          <div className="p-5 rounded-claude-lg border border-dashed border-claude-hairline-soft space-y-2">
            <Skeleton className="w-20 h-5 rounded-claude-md" />
            <SkeletonLine width="90%" />
            <SkeletonLine width="75%" />
          </div>
          {/* 评价区域 */}
          <div className="space-y-3">
            <Skeleton className="w-28 h-5 rounded-claude-md" />
            <div className="flex gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="w-8 h-8 rounded-claude-md" />
              ))}
            </div>
            <Skeleton className="w-full h-24 rounded-claude-md" />
            <Skeleton className="w-28 h-11 rounded-claude-md" />
          </div>
          {/* 评价列表 */}
          <div className="space-y-3">
            <Skeleton className="w-32 h-5 rounded-claude-md" />
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="w-full h-20 rounded-claude-md" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/** 实训页 - 公司/课程列表骨架 */
export function SkeletonTrainingList() {
  return (
    <div className="space-y-8">
        {Array.from({ length: 3 }).map((_, ci) => (
        <div
          key={ci}
          className="bg-macaron-mint/50 rounded-[24px] overflow-hidden"
          style={{ boxShadow: 'inset 0 -4px 10px rgba(0,0,0,0.03), inset 0 2px 8px rgba(255,255,255,0.7), 0 2px 12px rgba(0,0,0,0.04)' }}
        >
          {/* 公司名称栏 */}
          <div className="p-6 border-b border-claude-hairline">
            <div className="flex items-center gap-2">
              <Skeleton className="w-32 h-7 rounded-claude-md" />
              <Skeleton className="w-20 h-5 rounded-claude-md" />
            </div>
          </div>
          {/* 课程卡片 */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-[16px] overflow-hidden bg-white"
                  style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.04)' }}>
                  <Skeleton className="w-full aspect-video rounded-none" />
                  <div
                    className="p-4 space-y-2"
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.85)',
                      backdropFilter: 'blur(8px)',
                    }}
                  >
                    <SkeletonLine width="80%" />
                    <SkeletonLine width="100%" />
                    <SkeletonLine width="55%" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/** 岗位库骨架 */
export function SkeletonJobLibrary() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col gap-4 mb-8">
        {/* 搜索框 */}
        <Skeleton className="max-w-md w-full h-10 rounded-claude-md" />

        {/* 筛选行 — 标签文字保留，按钮骨架 */}
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap gap-2">
            <span className="text-xs text-claude-muted self-center mr-1">实习/校招</span>
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="w-16 h-8 rounded-claude-md" />
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="text-xs text-claude-muted self-center mr-1">站点</span>
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="w-16 h-8 rounded-claude-md" />
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="text-xs text-claude-muted self-center mr-1">适合专业</span>
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="w-16 h-8 rounded-claude-md" />
            ))}
          </div>
        </div>
      </div>

      {/* 岗位卡片网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-[16px] overflow-hidden bg-white"
            style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.04)' }}>
            <div
              className="p-5 space-y-3"
              style={{
                backgroundColor: 'rgba(255,255,255,0.85)',
                backdropFilter: 'blur(8px)',
              }}
            >
              {/* 标题 + 标签 */}
              <div className="flex items-start justify-between gap-3">
                <SkeletonLine width="65%" />
                <Skeleton className="w-10 h-5 rounded-full" />
              </div>
              {/* 公司/地点/分类 */}
              <div className="flex gap-4">
                <Skeleton className="w-16 h-4 rounded-claude-md" />
                <Skeleton className="w-20 h-4 rounded-claude-md" />
                <Skeleton className="w-14 h-4 rounded-claude-md" />
              </div>
              {/* 专业标签 */}
              <div className="flex gap-1.5">
                <Skeleton className="w-16 h-5 rounded-full" />
                <Skeleton className="w-12 h-5 rounded-full" />
                <Skeleton className="w-14 h-5 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
