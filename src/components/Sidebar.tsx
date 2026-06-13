import type { FilterKey } from "../types";

interface SidebarProps {
  activeFilter: FilterKey;
  onFilterChange: (value: FilterKey) => void;
  onAdd: () => void;
  labels: {
    sections: string;
    description: string;
    categories: string;
    addGame: string;
    importExecutableAndCover: string;
    filters: { key: FilterKey; label: string; hint: string }[];
  };
}

export function Sidebar({
  activeFilter,
  onFilterChange,
  onAdd,
  labels
}: SidebarProps) {
  return (
    <aside className="flex h-full w-[270px] shrink-0 flex-col rounded-[28px] border border-white/10 bg-white/5 px-5 py-6 shadow-glass backdrop-blur-2xl">
      <div className="mb-8">
        <div className="mb-2 text-xs uppercase tracking-[0.45em] text-white/35">
          {labels.sections}
        </div>
        <p className="max-w-[180px] text-sm leading-6 text-white/45">
          {labels.description}
        </p>
      </div>

      <div className="mb-3 text-xs uppercase tracking-[0.35em] text-white/30">
        {labels.categories}
      </div>
      <div className="flex flex-col gap-2">
        {labels.filters.map((filter) => {
          const active = activeFilter === filter.key;
          return (
            <button
              key={filter.key}
              type="button"
              onClick={() => onFilterChange(filter.key)}
              className={`group relative overflow-hidden rounded-2xl border px-4 py-3 text-left transition ${
                active
                  ? "border-white/15 bg-gradient-to-r from-[#ffb4c8]/25 to-[#c4b5fd]/20 text-white shadow-card"
                  : "border-transparent bg-white/[0.035] text-white/70 hover:border-white/10 hover:bg-white/[0.07]"
              }`}
            >
              <div className="text-sm">{filter.label}</div>
              <div className="text-xs tracking-[0.22em] text-white/35 group-hover:text-white/45">
                {filter.hint}
              </div>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={onAdd}
        className="mt-auto rounded-2xl border border-[#ffb4c8]/30 bg-gradient-to-r from-[#ffb4c8]/25 to-[#c4b5fd]/25 px-4 py-4 text-left text-white shadow-card transition hover:scale-[1.01] hover:from-[#ffb4c8]/35 hover:to-[#c4b5fd]/35"
      >
        <div className="text-lg font-light">+ {labels.addGame}</div>
        <div className="mt-1 text-xs uppercase tracking-[0.28em] text-white/45">
          {labels.importExecutableAndCover}
        </div>
      </button>
    </aside>
  );
}
