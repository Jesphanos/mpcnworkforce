import { useState, useEffect } from "react";
import { Globe, Clock, Phone, Languages, Save, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { PhoneVerificationDialog } from "./PhoneVerificationDialog";

const COUNTRIES = [
  { code: "US", name: "United States", dialCode: "+1" },
  { code: "GB", name: "United Kingdom", dialCode: "+44" },
  { code: "CA", name: "Canada", dialCode: "+1" },
  { code: "AU", name: "Australia", dialCode: "+61" },
  { code: "DE", name: "Germany", dialCode: "+49" },
  { code: "FR", name: "France", dialCode: "+33" },
  { code: "IN", name: "India", dialCode: "+91" },
  { code: "NG", name: "Nigeria", dialCode: "+234" },
  { code: "ZA", name: "South Africa", dialCode: "+27" },
  { code: "KE", name: "Kenya", dialCode: "+254" },
  { code: "GH", name: "Ghana", dialCode: "+233" },
  { code: "PH", name: "Philippines", dialCode: "+63" },
  { code: "PK", name: "Pakistan", dialCode: "+92" },
  { code: "BD", name: "Bangladesh", dialCode: "+880" },
  { code: "BR", name: "Brazil", dialCode: "+55" },
  { code: "MX", name: "Mexico", dialCode: "+52" },
  { code: "JP", name: "Japan", dialCode: "+81" },
  { code: "CN", name: "China", dialCode: "+86" },
  { code: "SG", name: "Singapore", dialCode: "+65" },
  { code: "AE", name: "United Arab Emirates", dialCode: "+971" },
].sort((a, b) => a.name.localeCompare(b.name));

const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "pt", name: "Portuguese" },
  { code: "ar", name: "Arabic" },
  { code: "hi", name: "Hindi" },
  { code: "zh", name: "Chinese" },
  { code: "ja", name: "Japanese" },
  { code: "sw", name: "Swahili" },
];

const TIMEZONES = [
  // Africa
  "Africa/Abidjan",
  "Africa/Accra",
  "Africa/Addis_Ababa",
  "Africa/Cairo",
  "Africa/Casablanca",
  "Africa/Johannesburg",
  "Africa/Lagos",
  "Africa/Nairobi",
  "Africa/Tunis",
  // Americas
  "America/Anchorage",
  "America/Argentina/Buenos_Aires",
  "America/Bogota",
  "America/Chicago",
  "America/Denver",
  "America/Halifax",
  "America/Lima",
  "America/Los_Angeles",
  "America/Mexico_City",
  "America/New_York",
  "America/Phoenix",
  "America/Santiago",
  "America/Sao_Paulo",
  "America/Toronto",
  "America/Vancouver",
  // Asia
  "Asia/Almaty",
  "Asia/Bangkok",
  "Asia/Dhaka",
  "Asia/Dubai",
  "Asia/Ho_Chi_Minh",
  "Asia/Hong_Kong",
  "Asia/Istanbul",
  "Asia/Jakarta",
  "Asia/Jerusalem",
  "Asia/Karachi",
  "Asia/Kolkata",
  "Asia/Kuala_Lumpur",
  "Asia/Manila",
  "Asia/Riyadh",
  "Asia/Seoul",
  "Asia/Shanghai",
  "Asia/Singapore",
  "Asia/Taipei",
  "Asia/Tehran",
  "Asia/Tokyo",
  // Australia & Pacific
  "Australia/Adelaide",
  "Australia/Brisbane",
  "Australia/Darwin",
  "Australia/Melbourne",
  "Australia/Perth",
  "Australia/Sydney",
  "Pacific/Auckland",
  "Pacific/Fiji",
  "Pacific/Honolulu",
  // Europe
  "Europe/Amsterdam",
  "Europe/Athens",
  "Europe/Berlin",
  "Europe/Brussels",
  "Europe/Dublin",
  "Europe/Helsinki",
  "Europe/Lisbon",
  "Europe/London",
  "Europe/Madrid",
  "Europe/Moscow",
  "Europe/Oslo",
  "Europe/Paris",
  "Europe/Rome",
  "Europe/Stockholm",
  "Europe/Vienna",
  "Europe/Warsaw",
  "Europe/Zurich",
];

export function InternationalSettingsSection() {
  const { user, profile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  
  const [form, setForm] = useState({
    country: profile?.country || "",
    timezone: profile?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
    language_preference: profile?.language_preference || "en",
    phone_number: "",
  });
  
  // Fetch current phone number
  useEffect(() => {
    async function fetchPhone() {
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("phone_number")
        .eq("id", user.id)
        .single();
      if (data?.phone_number) {
        setForm(f => ({ ...f, phone_number: data.phone_number || "" }));
      }
    }
    fetchPhone();
  }, [user]);
  
  // Update form when profile changes
  useEffect(() => {
    if (profile) {
      setForm(f => ({
        ...f,
        country: profile.country || "",
        timezone: profile.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
        language_preference: profile.language_preference || "en",
      }));
    }
  }, [profile]);
  
  const selectedCountry = COUNTRIES.find(c => c.code === form.country);
  
  const handleSave = async () => {
    if (!user) return;
    
    setIsSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        country: form.country || null,
        timezone: form.timezone || null,
        language_preference: form.language_preference || null,
        phone_number: form.phone_number || null,
      })
      .eq("id", user.id);
    
    setIsSaving(false);
    
    if (error) {
      toast.error("Failed to update settings");
    } else {
      toast.success("International settings updated");
      setIsEditing(false);
    }
  };
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            International Settings
          </CardTitle>
          <CardDescription>
            Configure your timezone, country, and regional preferences
          </CardDescription>
        </div>
        {!isEditing && (
          <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
            Edit
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-muted-foreground" />
              Country
            </Label>
            {isEditing ? (
              <Select
                value={form.country}
                onValueChange={(value) => setForm({ ...form, country: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map((country) => (
                    <SelectItem key={country.code} value={country.code}>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="text-foreground py-2">
                {selectedCountry?.name || "Not set"}
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              Timezone
            </Label>
            {isEditing ? (
              <Select
                value={form.timezone}
                onValueChange={(value) => setForm({ ...form, timezone: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {TIMEZONES.map((tz) => (
                    <SelectItem key={tz} value={tz}>
                      {tz.replace(/_/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="text-foreground py-2">{form.timezone || "Not set"}</p>
            )}
          </div>
        </div>
        
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Languages className="h-4 w-4 text-muted-foreground" />
              Language Preference
            </Label>
            {isEditing ? (
              <Select
                value={form.language_preference}
                onValueChange={(value) => setForm({ ...form, language_preference: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="text-foreground py-2">
                {LANGUAGES.find(l => l.code === form.language_preference)?.name || "English"}
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              Phone Number
            </Label>
            {isEditing ? (
              <div className="flex gap-2">
                <div className="w-24 shrink-0">
                  <Input
                    value={selectedCountry?.dialCode || ""}
                    disabled
                    className="text-center bg-muted"
                    placeholder="+1"
                  />
                </div>
                <Input
                  type="tel"
                  value={form.phone_number.replace(/^\+\d+\s?/, "")}
                  onChange={(e) => {
                    const num = e.target.value.replace(/[^\d]/g, "");
                    const full = selectedCountry ? `${selectedCountry.dialCode} ${num}` : num;
                    setForm({ ...form, phone_number: full });
                  }}
                  placeholder="Phone number"
                />
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <p className="text-foreground py-2">
                  {form.phone_number || "Not set"}
                </p>
                {form.phone_number && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowVerification(true)}
                    className="gap-1"
                  >
                    <ShieldCheck className="h-3 w-3" />
                    Verify
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
        
        {isEditing && (
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsEditing(false);
                setForm({
                  country: profile?.country || "",
                  timezone: profile?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
                  language_preference: profile?.language_preference || "en",
                  phone_number: form.phone_number,
                });
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Settings
            </Button>
          </div>
        )}
        
        <PhoneVerificationDialog
          open={showVerification}
          onOpenChange={setShowVerification}
          phoneNumber={form.phone_number}
          onVerified={() => {
            toast.success("Phone number verified successfully!");
          }}
        />
      </CardContent>
    </Card>
  );
}
