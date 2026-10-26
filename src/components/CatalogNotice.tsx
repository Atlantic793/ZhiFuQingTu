import type { CatalogSource } from '../services/catalogService';

const COPY: Record<Exclude<CatalogSource, 'db'>, string> = {
  'mock-fallback': '数据加载失败，当前显示的是示例数据（可能尚未连接数据库或网络异常）',
  error: '数据加载失败，请检查数据库连接或稍后重试',
};

/** 目录/列表数据发生静默降级时，页面顶部明确提示（mock 回退 / 加载失败三种态之二） */
export default function CatalogNotice({ source }: { source?: CatalogSource | null }) {
  if (!source || source === 'db') return null;
  return (
    <div
      role="alert"
      className="mb-5 flex items-center gap-2 rounded-claude-md border px-4 py-2.5 text-sm"
      style={{
        borderColor: '#e8d48a',
        background: '#fdf6e0',
        color: '#7a5c10',
        boxShadow: 'inset 0 1px 4px rgba(232, 185, 74, 0.12), 0 1px 6px rgba(0, 0, 0, 0.04)',
      }}
    >
      {/* 与 claude.accent-amber 同源的眼球信号 */}
      <span
        aria-hidden
        className="inline-block w-2 h-2 rounded-full flex-shrink-0"
        style={{ background: '#e8b94a', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.15)' }}
      />
      {COPY[source]}
    </div>
  );
}
