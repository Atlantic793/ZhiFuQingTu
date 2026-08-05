type ClayBlobProps = {
  color?: 'blue' | 'pink' | 'peach' | 'yellow' | 'lavender' | 'mint';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

const gradients: Record<string, string> = {
  blue: 'radial-gradient(circle at 40% 35%, #a8d8ea 0%, transparent 70%)',
  pink: 'radial-gradient(circle at 40% 35%, #f0a8b8 0%, transparent 70%)',
  peach: 'radial-gradient(circle at 40% 35%, #fcc8a8 0%, transparent 70%)',
  yellow: 'radial-gradient(circle at 40% 35%, #f8e8a0 0%, transparent 70%)',
  lavender: 'radial-gradient(circle at 40% 35%, #d4b8e0 0%, transparent 70%)',
  mint: 'radial-gradient(circle at 40% 35%, #a8e0c8 0%, transparent 70%)',
};

const sizes = { sm: 'w-16 h-16', md: 'w-24 h-24', lg: 'w-36 h-36' };

const rounds = [
  'rounded-[55%_45%_50%_50%]',
  'rounded-[45%_55%_55%_45%]',
  'rounded-[50%_55%_45%_50%]',
  'rounded-[55%_40%_55%_45%]',
  'rounded-[55%_45%_40%_60%]',
  'rounded-[50%_50%_45%_55%]',
];

function ClayBlob({ color = 'blue', size = 'md', className = '' }: ClayBlobProps) {
  const round = rounds[Math.abs(color.length) % rounds.length];
  return (
    <div
      className={`pointer-events-none ${sizes[size]} ${round} ${className}`}
      style={{
        background: gradients[color],
        boxShadow: 'inset 0 -5px 10px rgba(0,0,0,0.06), inset 0 3px 8px rgba(255,255,255,0.5)',
      }}
    />
  );
}

export default ClayBlob;
