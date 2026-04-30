import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SUPPORTED_LANGUAGES } from "@/data/languages";

interface LanguageSelectProps {
  value: string | null;
  onChange: (code: string | null) => void;
  allowClear?: boolean;
  placeholder?: string;
}

const LanguageSelect = ({
  value,
  onChange,
  allowClear = true,
  placeholder = "Select preferred language",
}: LanguageSelectProps) => {
  return (
    <Select
      value={value ?? "__none"}
      onValueChange={(v) => onChange(v === "__none" ? null : v)}
    >
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {allowClear && (
          <SelectItem value="__none">No preference</SelectItem>
        )}
        {SUPPORTED_LANGUAGES.map((lang) => (
          <SelectItem key={lang.code} value={lang.code}>
            {lang.name}
            {lang.nativeName !== lang.name ? ` · ${lang.nativeName}` : ""}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default LanguageSelect;