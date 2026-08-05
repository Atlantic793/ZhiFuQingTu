import type { Subject } from '../types/catalog';
import { subjectIconMap } from '../utils/subjectIcons';

function SubjectChipBar({
  subjects,
  selectedId,
  onSelect,
}: {
  subjects: Subject[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2 mb-8">
      <button
        type="button"
        onClick={() => onSelect(null)}
        className={`px-3 py-1.5 rounded-claude-md text-xs font-medium transition-colors ${
          !selectedId
            ? 'bg-claude-primary text-white'
            : 'bg-white text-claude-muted hover:text-claude-ink border border-claude-hairline'
        }`}
      >
        不限学科
      </button>
      {subjects.map((subject) => (
        <button
          key={subject.id}
          type="button"
          onClick={() => onSelect(subject.id)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-claude-md text-xs font-medium transition-colors ${
            selectedId === subject.id
              ? 'bg-claude-primary text-white'
              : 'bg-white text-claude-muted hover:text-claude-ink border border-claude-hairline'
          }`}
        >
          {subjectIconMap[subject.icon]}
          {subject.name}
        </button>
      ))}
    </div>
  );
}

export default SubjectChipBar;
