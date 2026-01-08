import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Phone } from "lucide-react";

const COUNTRIES = [
  { code: "US", name: "United States", dialCode: "+1", flag: "🇺🇸" },
  { code: "GB", name: "United Kingdom", dialCode: "+44", flag: "🇬🇧" },
  { code: "CA", name: "Canada", dialCode: "+1", flag: "🇨🇦" },
  { code: "AU", name: "Australia", dialCode: "+61", flag: "🇦🇺" },
  { code: "DE", name: "Germany", dialCode: "+49", flag: "🇩🇪" },
  { code: "FR", name: "France", dialCode: "+33", flag: "🇫🇷" },
  { code: "IN", name: "India", dialCode: "+91", flag: "🇮🇳" },
  { code: "NG", name: "Nigeria", dialCode: "+234", flag: "🇳🇬" },
  { code: "ZA", name: "South Africa", dialCode: "+27", flag: "🇿🇦" },
  { code: "KE", name: "Kenya", dialCode: "+254", flag: "🇰🇪" },
  { code: "GH", name: "Ghana", dialCode: "+233", flag: "🇬🇭" },
  { code: "PH", name: "Philippines", dialCode: "+63", flag: "🇵🇭" },
  { code: "PK", name: "Pakistan", dialCode: "+92", flag: "🇵🇰" },
  { code: "BD", name: "Bangladesh", dialCode: "+880", flag: "🇧🇩" },
  { code: "BR", name: "Brazil", dialCode: "+55", flag: "🇧🇷" },
  { code: "MX", name: "Mexico", dialCode: "+52", flag: "🇲🇽" },
  { code: "JP", name: "Japan", dialCode: "+81", flag: "🇯🇵" },
  { code: "CN", name: "China", dialCode: "+86", flag: "🇨🇳" },
  { code: "SG", name: "Singapore", dialCode: "+65", flag: "🇸🇬" },
  { code: "AE", name: "UAE", dialCode: "+971", flag: "🇦🇪" },
].sort((a, b) => a.name.localeCompare(b.name));

interface SignupPhoneFieldProps {
  countryCode: string;
  phoneNumber: string;
  onCountryChange: (code: string) => void;
  onPhoneChange: (phone: string) => void;
}

export function SignupPhoneField({
  countryCode,
  phoneNumber,
  onCountryChange,
  onPhoneChange,
}: SignupPhoneFieldProps) {
  const selectedCountry = COUNTRIES.find(c => c.code === countryCode);
  
  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2">
        <Phone className="h-4 w-4" />
        Phone Number (Optional)
      </Label>
      <div className="flex gap-2">
        <Select value={countryCode} onValueChange={onCountryChange}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Country">
              {selectedCountry && (
                <span className="flex items-center gap-1.5">
                  <span>{selectedCountry.flag}</span>
                  <span className="text-muted-foreground">{selectedCountry.dialCode}</span>
                </span>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {COUNTRIES.map((country) => (
              <SelectItem key={country.code} value={country.code}>
                <span className="flex items-center gap-2">
                  <span>{country.flag}</span>
                  <span>{country.name}</span>
                  <span className="text-muted-foreground">{country.dialCode}</span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="tel"
          placeholder="Phone number"
          value={phoneNumber}
          onChange={(e) => {
            // Only allow digits
            const cleaned = e.target.value.replace(/[^\d]/g, "");
            onPhoneChange(cleaned);
          }}
          className="flex-1"
        />
      </div>
      <p className="text-xs text-muted-foreground">
        For international coordination and notifications
      </p>
    </div>
  );
}

export { COUNTRIES };
