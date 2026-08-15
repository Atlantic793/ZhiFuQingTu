import {
  Atom,
  Brain,
  Briefcase,
  Calculator,
  Cpu,
  Dna,
  FlaskConical,
  Palette,
  TrendingUp,
} from 'lucide-react';

export const subjectIconMap: Record<string, React.ReactNode> = {
  Cpu: <Cpu className="w-4 h-4" />,
  Calculator: <Calculator className="w-4 h-4" />,
  Atom: <Atom className="w-4 h-4" />,
  FlaskConical: <FlaskConical className="w-4 h-4" />,
  Dna: <Dna className="w-4 h-4" />,
  TrendingUp: <TrendingUp className="w-4 h-4" />,
  Briefcase: <Briefcase className="w-4 h-4" />,
  Palette: <Palette className="w-4 h-4" />,
  Brain: <Brain className="w-4 h-4" />,
};
