import { useState, useMemo } from "react";
import { countries, Country } from "@/data/countries";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, Globe } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

interface CountrySelectProps {
  value: string | null;
  onChange: (code: string | null) => void;
  placeholder?: string;
  allowClear?: boolean;
}

const CountrySelect = ({
  value,
  onChange,
  placeholder = "Select country",
  allowClear = false,
}: CountrySelectProps) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = useMemo(
    () =>
      countries.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase())
      ),
    [search]
  );

  const selected = countries.find((c) => c.code === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-start gap-2 font-normal"
        >
          {selected ? (
            <>
              <span>{selected.flag}</span>
              <span>{selected.name}</span>
            </>
          ) : (
            <>
              <Globe className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">{placeholder}</span>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0" align="start">
        <div className="p-2 border-b border-border">
          <Input
            placeholder="Search countries..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8"
            autoFocus
          />
        </div>
        <ScrollArea className="h-[240px]">
          <div className="p-1">
            {allowClear && value && (
              <button
                className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-muted/50 text-muted-foreground"
                onClick={() => {
                  onChange(null);
                  setOpen(false);
                  setSearch("");
                }}
              >
                Clear selection
              </button>
            )}
            {filtered.map((country) => (
              <button
                key={country.code}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors ${
                  value === country.code
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-muted/50"
                }`}
                onClick={() => {
                  onChange(country.code);
                  setOpen(false);
                  setSearch("");
                }}
              >
                <span>{country.flag}</span>
                <span className="flex-1 text-left">{country.name}</span>
                {value === country.code && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No countries found.
              </p>
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

export default CountrySelect;
