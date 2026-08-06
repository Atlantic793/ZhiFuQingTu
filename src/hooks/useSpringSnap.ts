import { useCallback, useEffect, useRef } from 'react';

/**
 * 弹簧物理参数
 *
 * stiffness  — 刚度，越大回弹越快（默认 170）
 * damping   — 阻尼，越大过冲越小、停得越快（默认 16）
 * mass      — 质量，越大惯性越大（默认 1）
 */
interface SpringConfig {
  stiffness?: number;
  damping?: number;
  mass?: number;
}

/** 检查用户是否开启了"减少动态效果" */
function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * 以 requestAnimationFrame 驱动的弹簧物理模拟。
 *
 * 用法：
 *   const snapTo = useSpringSnap(elementRef, x, y, { stiffness: 170, damping: 16 });
 *   // 调用 snapTo(newX, newY) 触发弹簧动画
 *   // 传入 { instant: true } 直接跳转（reduced-motion 场景）
 */
export function useSpringSnap(
  ref: React.RefObject<HTMLElement | null>,
  _targetX: number,
  _targetY: number,
  config: SpringConfig = {},
) {
  const { stiffness = 170, damping = 16, mass = 1 } = config;
  const rafRef = useRef<number | null>(null);
  const velocityRef = useRef({ x: 0, y: 0 });
  const targetRef = useRef({ x: _targetX, y: _targetY });

  // 更新目标值引用
  targetRef.current = { x: _targetX, y: _targetY };

  const snapTo = useCallback(
    (targetX: number, targetY: number, opts?: { instant?: boolean }) => {
      const el = ref.current;
      if (!el) return;

      targetRef.current = { x: targetX, y: targetY };

      // 减少动态效果：直接跳转
      if (opts?.instant || prefersReducedMotion()) {
        el.style.transform = `translate3d(${targetX}px, ${targetY}px, 0)`;
        velocityRef.current = { x: 0, y: 0 };
        return;
      }

      // 取消上一帧动画
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }

      const startTime = performance.now();
      // 从当前计算值（getComputedStyle）读取精确的 transform 位移
      const style = window.getComputedStyle(el);
      const matrix = new DOMMatrixReadOnly(style.transform);
      const startX = matrix.m41;
      const startY = matrix.m42;
      const v0 = { ...velocityRef.current };

      const tick = (now: number) => {
        const dt = Math.min((now - startTime) / 1000, 0.064); // 上限 64ms 防跳帧
        const elapsed = dt;

        // 弹簧力：F = -k * (x - target) - c * v
        const dx = startX - targetX;
        const dy = startY - targetY;

        // 半隐式欧拉积分
        // v(t+dt) = v(t) + dt * (-k * dx - c * v(t)) / m
        // x(t+dt) = x(t) + dt * v(t+dt)
        const ax = (-stiffness * dx - damping * v0.x) / mass;
        const ay = (-stiffness * dy - damping * v0.y) / mass;

        v0.x += ax * elapsed;
        v0.y += ay * elapsed;

        const newX = startX + v0.x * elapsed;
        const newY = startY + v0.y * elapsed;

        el.style.transform = `translate3d(${newX}px, ${newY}px, 0)`;

        // 判断是否接近静止（位移 < 0.5px 且 速度 < 1px/s）
        const distX = Math.abs(newX - targetX);
        const distY = Math.abs(newY - targetY);
        const speed = Math.sqrt(v0.x * v0.x + v0.y * v0.y);

        if (distX < 0.5 && distY < 0.5 && speed < 1) {
          // 精确归位
          el.style.transform = `translate3d(${targetX}px, ${targetY}px, 0)`;
          v0.x = 0;
          v0.y = 0;
          velocityRef.current = { x: 0, y: 0 };
          rafRef.current = null;
          return;
        }

        velocityRef.current = { x: v0.x, y: v0.y };
        rafRef.current = requestAnimationFrame(tick);
      };

      rafRef.current = requestAnimationFrame(tick);
    },
    [ref, stiffness, damping, mass],
  );

  // 清理
  useEffect(() => {
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return snapTo;
}
