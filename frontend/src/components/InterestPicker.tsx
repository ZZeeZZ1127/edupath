import { useEffect, useMemo, useState } from 'react';
import { CheckIcon, PlusIcon, SearchIcon, SparklesIcon, XIcon } from 'lucide-react';
import { toast } from 'sonner';
import { INTEREST_CATALOG } from '../data/interestCatalog';
import {
  createCustomInterest,
  interestExistsInDatabase,
  searchInterests,
  type InterestSearchResult,
} from '../services/interests';

interface InterestPickerProps {
  selected: string[];
  onChange: (interests: string[]) => void;
}

export default function InterestPicker({ selected, onChange }: InterestPickerProps) {
  const [query, setQuery] = useState(``);
  const [results, setResults] = useState<InterestSearchResult[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setResults([]);
      return;
    }

    let cancelled = false;
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const matches = await searchInterests(q);
        if (!cancelled) setResults(matches);
      } finally {
        if (!cancelled) setSearching(false);
      }
    }, 200);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  const exactMatch = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return false;
    return (
      results.some((r) => r.name.toLowerCase() === q) ||
      selected.some((s) => s.toLowerCase() === q) ||
      interestExistsInDatabase(query)
    );
  }, [query, results, selected]);

  const showCreate =
    query.trim().length >= 2 && !exactMatch && !searching;

  const addInterest = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (selected.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      toast.info(`"${trimmed}" is already selected`);
      return;
    }
    onChange([...selected, trimmed]);
    setQuery(``);
    setResults([]);
  };

  const handleCreate = async () => {
    const name = query.trim();
    if (!name) return;
    try {
      const saved = await createCustomInterest(name);
      addInterest(saved);
      toast.success(`Added "${saved}" to your interests`);
    } catch {
      toast.error(`Could not add interest`);
    }
  };

  const popular = INTEREST_CATALOG.slice(0, 12);

  return (
    <div className="space-y-4">
      <div className="relative">
        <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === `Enter` && showCreate) {
              e.preventDefault();
              void handleCreate();
            }
          }}
          placeholder="Search interests or type to create your own…"
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          aria-label="Search interests"
          aria-expanded={query.trim().length > 0}
          aria-controls="interest-search-results"
        />
      </div>

      {query.trim() && (
        <div
          id="interest-search-results"
          className="rounded-xl border border-border bg-card shadow-custom overflow-hidden"
        >
          {searching && (
            <p className="px-4 py-3 text-sm text-muted-foreground">Searching database…</p>
          )}
          {!searching && results.length > 0 && (
            <ul className="max-h-48 overflow-y-auto divide-y divide-border">
              {results.map((item) => {
                const isSelected = selected.some(
                  (s) => s.toLowerCase() === item.name.toLowerCase()
                );
                return (
                  <li key={`${item.source}-${item.name}`}>
                    <button
                      type="button"
                      onClick={() => addInterest(item.name)}
                      disabled={isSelected}
                      className="w-full flex items-center justify-between gap-3 px-4 py-2.5 text-left text-sm hover:bg-muted/80 disabled:opacity-50 transition-colors"
                    >
                      <span className="font-medium text-foreground">{item.name}</span>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {item.source === `database` ? `In database` : `Your custom`}
                        {isSelected && ` · Added`}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
          {!searching && results.length === 0 && !showCreate && (
            <p className="px-4 py-3 text-sm text-muted-foreground">No matches in the database.</p>
          )}
          {showCreate && (
            <button
              type="button"
              onClick={() => void handleCreate()}
              className="w-full flex items-center gap-2 px-4 py-3 text-sm font-medium text-primary hover:bg-accent border-t border-border transition-colors"
            >
              <PlusIcon className="w-4 h-4 shrink-0" />
              Create &ldquo;{query.trim()}&rdquo;
            </button>
          )}
        </div>
      )}

      {selected.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Your interests
          </p>
          <div className="flex flex-wrap gap-2">
            {selected.map((interest) => (
              <span
                key={interest}
                className="inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1.5 rounded-full bg-primary text-primary-foreground text-sm font-medium"
              >
                <CheckIcon className="w-3.5 h-3.5" />
                {interest}
                <button
                  type="button"
                  onClick={() => onChange(selected.filter((i) => i !== interest))}
                  className="p-0.5 rounded-full hover:bg-white/20 transition-colors"
                  aria-label={`Remove ${interest}`}
                >
                  <XIcon className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="text-xs text-muted-foreground mb-2">Popular from our database</p>
        <div className="flex flex-wrap gap-2">
          {popular.map((interest) => {
            const active = selected.some((s) => s.toLowerCase() === interest.toLowerCase());
            return (
              <button
                key={interest}
                type="button"
                onClick={() => (active ? onChange(selected.filter((i) => i !== interest)) : addInterest(interest))}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  active
                    ? `bg-primary text-primary-foreground border-primary`
                    : `bg-card text-foreground border-border hover:border-primary`
                }`}
              >
                {interest}
              </button>
            );
          })}
        </div>
      </div>

      {selected.length > 0 && (
        <div className="p-3 rounded-xl bg-accent text-sm text-accent-foreground">
          <SparklesIcon className="w-4 h-4 inline mr-1.5" />
          {selected.length} interest{selected.length > 1 ? `s` : ``} selected — great start!
        </div>
      )}
    </div>
  );
}
