import { useCallback, useRef, useState } from 'react';
import { useSpringSnap } from '../hooks/useSpringSnap';

interface DraggableCardProps {
  /** 卡片内容 */
  children: React.ReactNode;
  /** 额外的 className */
  className?: string;
  /** 拖拽阈值（px），超过此距离松手不回弹（0 = 始终回弹） */
  threshold?: number;
  style?: React.CSSProperties;
  onMouseEnter?: (e: React.MouseEvent) => void;
  onMouseLeave?: (e: React.MouseEvent) => void;
}

/**
 * 可拖拽卡片 — 松手后带弹簧回弹至原位。
 *
 * 只调整位移，不改卡片内容和拖拽规则。
 * 用户开启"减少动态效果"时直接回到目标位置。
 */
export default function DraggableCard({
  children,
  className = '',
  threshold = 0,
  style,
  onMouseEnter,
  onMouseLeave,
}: DraggableCardProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const snapTo = useSpringSnap(cardRef, 0, 0, { stiffness: 170, damping: 16 });
  const [isDragging, setIsDragging] = useState(false);
  const originRef = useRef({ x: 0, y: 0 });
  const offsetRef = useRef({ x: 0, y: 0 });
  const hasMovedRef = useRef(false);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      // 不拦截内部链接/按钮点击
      const target = e.target as HTMLElement;
      if (target.closest('a, button, input, select, textarea')) return;

      e.preventDefault();
      const el = cardRef.current;
      if (!el) return;

      el.setPointerCapture(e.pointerId);
      originRef.current = { x: e.clientX, y: e.clientY };
      // 从当前 transform 读取已有偏移
      const style = window.getComputedStyle(el);
      const matrix = new DOMMatrixReadOnly(style.transform);
      offsetRef.current = { x: matrix.m41, y: matrix.m42 };
      hasMovedRef.current = false;
    },
    [],
  );

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    const el = cardRef.current;
    if (!el || !el.hasPointerCapture(e.pointerId)) return;

    const dy = e.clientY - originRef.current.y + offsetRef.current.y;

    if (Math.abs(dy) > 1) {
      hasMovedRef.current = true;
      setIsDragging(true);
    }

    // 仅纵向拖拽，横向始终为 0
    el.style.transform = `translate3d(0px, ${dy}px, 0)`;
  }, []);

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      const el = cardRef.current;
      if (!el) return;

      el.releasePointerCapture(e.pointerId);
      setIsDragging(false);

      if (!hasMovedRef.current) {
        // 没有实际移动，不触发回弹
        return;
      }

      const dy = e.clientY - originRef.current.y + offsetRef.current.y;

      if (threshold > 0 && Math.abs(dy) > threshold) {
        // 超过阈值：保持在当前位置，不回弹
        offsetRef.current = { x: 0, y: dy };
        return;
      }

      // 弹簧回弹到 (0, 0)
      snapTo(0, 0);
      offsetRef.current = { x: 0, y: 0 };
    },
    [snapTo, threshold],
  );

  return (
    <div
      ref={cardRef}
      className={`touch-none select-none ${isDragging ? 'cursor-grabbing z-20' : 'cursor-grab'} ${className}`}
      style={{
        ...style,
        willChange: isDragging ? 'transform' : undefined,
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {children}
    </div>
  );
}
