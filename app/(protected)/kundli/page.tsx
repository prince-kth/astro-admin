'use client'

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState, useCallback, useEffect } from "react"
import { User, Building2, FileText, Loader2 } from "lucide-react"
import { Toaster, toast } from 'sonner'
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

interface LocationSuggestion {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

const REPORT_TYPES = [
  "Chakra Healing Report",
  "Fortune Report",
  "Lucky 13 Reports",
  "Vedic 4 Report",
  "Wealth Comprehensive Report",
  "Wealth Report",
  "Yogas & Doshas"
] as const;

// Zod validation schema
const kundliFormSchema = z.object({
  reportType: z.enum(REPORT_TYPES),
  phoneNumber: z.string()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number must not exceed 15 digits")
    .regex(/^\+?\d+$/, "Invalid phone number format"),
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  timeOfBirth: z.string().min(1, "Time of birth is required"),
  birthPlace: z.string().min(1, "Birth place is required"),
  latitude: z.string(),
  longitude: z.string(),
  companyName: z.string().optional(),
  companySlogan: z.string().optional(),
  companyYear: z.string().optional().refine((year) => {
    if (!year) return true;
    const num = parseInt(year);
    return !isNaN(num) && num > 1800 && num <= new Date().getFullYear();
  }, "Please enter a valid establishment year"),
  reportName: z.string().optional(),
  astrologerName: z.string().optional(),
  aboutReport: z.string().optional(),
});

type KundliFormValues = z.infer<typeof kundliFormSchema>;

export default function Home() {
  const [locationSuggestions, setLocationSuggestions] = useState<LocationSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [kundliData, setKundliData] = useState<any | null>(null);
  const [loadingState, setLoadingState] = useState({
    isLoading: false,
    step: 0,
    message: ""
  });

  // Initialize form with empty values for date/time
  const form = useForm<KundliFormValues>({
    resolver: zodResolver(kundliFormSchema),
    defaultValues: {
      reportType: "Chakra Healing Report",
      phoneNumber: "",
      firstName: "",
      lastName: "",
      email: "",
      dateOfBirth: "",
      timeOfBirth: "",
      birthPlace: "",
      latitude: "",
      longitude: "",
      companyName: "",
      companySlogan: "",
      companyYear: "",
      reportName: "",
      astrologerName: "",
      aboutReport: "",
    }
  });

  // Set date and time after component mounts
  useEffect(() => {
    const currentDate = new Date().toISOString().split('T')[0];
    const currentTime = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata', hour12: false, hour: '2-digit', minute: '2-digit' });
    
    form.setValue("dateOfBirth", currentDate);
    form.setValue("timeOfBirth", currentTime);
  }, []);

  const handleSubmit = async (data: KundliFormValues) => {
    try {
      setLoadingState({
        isLoading: true,
        step: 0,
        message: "Validating input data..."
      });

      // Additional custom validations if needed
      if (!data.birthPlace || !data.latitude || !data.longitude) {
        toast.error("Please select a valid birth place with coordinates");
        return;
      }

      // API call for kundli generation
      setLoadingState({
        isLoading: true,
        step: 1,
        message: "Generating kundli..."
      });

      const kundliResponse = await fetch('http://192.168.29.187:5000/generate_kundli', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date_of_birth: data.dateOfBirth,
          time_of_birth: data.timeOfBirth,
          lat: parseFloat(data.latitude),
          lon: parseFloat(data.longitude),
          tz: "Asia/Kolkata", // You might want to make this dynamic
        }),
      });

      console.log('Kundli Response Status:', kundliResponse.status);
      
      if (!kundliResponse.ok) {
        const errorData = await kundliResponse.json();
        console.error('Kundli API Error:', errorData);
        throw new Error(errorData.message || 'Failed to generate kundli');
      }

      const kundliResult = await kundliResponse.json();
      console.log('Kundli Result:', kundliResult);
      setKundliData(kundliResult);

      // API call for report generation
      setLoadingState({
        isLoading: true,
        step: 2,
        message: "Generating report..."
      });

      const reportResponse = await fetch('/api/pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          kundliData: kundliResult,
          userData: {
            name: `${data.firstName} ${data.lastName}`,
            email: data.email,
            birthDetails: {
              date: data.dateOfBirth,
              time: data.timeOfBirth,
              place: data.birthPlace,
            },
            company: {
              name: data.companyName,
              slogan: data.companySlogan,
              year: data.companyYear,
            },
            report: {
              name: data.reportName,
              astrologer: data.astrologerName,
              about: data.aboutReport,
            },
          },
        }),
      });

      if (!reportResponse.ok) {
        const errorData = await reportResponse.json();
        throw new Error(errorData.message || 'Failed to generate report');
      }

      const reportBlob = await reportResponse.blob();
      const reportUrl = window.URL.createObjectURL(reportBlob);
      
      // Success notification and download
      toast.success('Report generated successfully!', {
        action: {
          label: 'Download',
          onClick: () => {
            const a = document.createElement('a');
            a.href = reportUrl;
            a.download = `${data.firstName}_${data.lastName}_kundli_report.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(reportUrl);
          },
        },
      });

    } catch (error) {
      console.error('Error generating kundli:', error);
      toast.error('Failed to generate kundli');
      setLoadingState({ isLoading: false, step: 0, message: '' });
    } finally {
      setLoadingState({
        isLoading: false,
        step: 0,
        message: ""
      });
    }
  };

  // Update the form when location is selected
  const handleLocationSelect = (location: LocationSuggestion) => {
    form.setValue('birthPlace', location.display_name);
    form.setValue('latitude', location.lat);
    form.setValue('longitude', location.lon);
    setLocationSuggestions([]);
  };

  const searchLocations = async (query: string) => {
    if (!query || query.length < 3) {
      setLocationSuggestions([]);
      setLocationError('');
      return;
    }

    setIsSearching(true);
    setLocationError('');
    
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          query
        )}&format=json&limit=5`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch location suggestions');
      }
      
      const data = await response.json();
      setLocationSuggestions(data);
      
      if (data.length === 0) {
        setLocationError('No locations found');
      }
    } catch (error) {
      console.error('Error searching locations:', error);
      setLocationError('Failed to search locations. Please try again.');
      setLocationSuggestions([]);
    } finally {
      setIsSearching(false);
    }
  };

  const debouncedSearch = useCallback(
    debounce((query: string) => searchLocations(query), 500),
    []
  );

  const handleLocationSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    form.setValue('birthPlace', query);

    if (query.length < 3) {
      setLocationSuggestions([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}`
      );
      const data = await response.json();
      setLocationSuggestions(data);
    } catch (error) {
      toast.error('Failed to fetch location suggestions');
    } finally {
      setIsSearching(false);
    }
  };

  const getCurrentLocation = () => {
    setIsLocating(true);
    setLocationError('');

    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();

          form.setValue('birthPlace', data.display_name);
          form.setValue('latitude', latitude.toString());
          form.setValue('longitude', longitude.toString());
          
          toast.success('Current location detected successfully');
        } catch (error) {
          toast.error('Failed to fetch location details');
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        let errorMessage = 'Failed to get your location';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
        }
        toast.error(errorMessage);
        setIsLocating(false);
      }
    );
  };

  return (
    <div className="flex flex-col bg-gradient-to-b from-background to-muted/50" style={{ height: '70vh', width: '77vw' }}>
      <Toaster position="top-right" expand={false} richColors />
      <div className="flex-1 p-4 flex flex-col w-full">
        <div className="text-center space-y-1 mb-4">
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            Kundli Generator
          </h1>
          <p className="text-sm text-muted-foreground">
            Generate detailed astrological reports based on birth details
          </p>
        </div>

        {loadingState.isLoading ? (
          <Card className="flex-1 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="h-full flex items-center justify-center">
              <div className="flex flex-col items-center justify-center space-y-8">
                {/* Cosmic Loading Animation */}
                <div className="relative w-32 h-32">
                  <div className="absolute inset-0 border-2 border-primary/30 rounded-full animate-spin-slow"></div>
                  <div className="absolute inset-2 border-2 border-primary/40 rounded-full animate-spin-reverse">
                    <div className="absolute -top-1 left-1/2 w-2 h-2 bg-primary/60 rounded-full"></div>
                    <div className="absolute top-1/2 -right-1 w-2 h-2 bg-primary/60 rounded-full"></div>
                    <div className="absolute -bottom-1 left-1/2 w-2 h-2 bg-primary/60 rounded-full"></div>
                  </div>
                  <div className="absolute inset-4 bg-gradient-to-br from-primary/20 to-primary/30 rounded-full animate-pulse"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <span className="text-lg font-semibold text-primary">
                        {loadingState.step + 1}/4
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-center space-y-4">
                  <h3 className="text-xl font-semibold text-foreground">
                    Unveiling Your Cosmic Blueprint
                  </h3>
                  <p className="text-muted-foreground animate-pulse max-w-md mx-auto">
                    {loadingState.message}
                  </p>
                  <div className="flex justify-center gap-2 mt-4">
                    {[0, 1, 2, 3].map((step) => (
                      <div
                        key={step}
                        className={`w-2 h-2 rounded-full transition-all duration-500 ${
                          step <= loadingState.step
                            ? 'bg-primary scale-100'
                            : 'bg-primary/30 scale-75'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="personal" className="flex-1 flex flex-col">
            <TabsList className="grid grid-cols-3 w-full max-w-sm mx-auto mb-4">
              <TabsTrigger value="personal" className="flex items-center gap-1 text-sm">
                <User className="w-3 h-3" />
                Personal
              </TabsTrigger>
              <TabsTrigger value="company" className="flex items-center gap-1 text-sm">
                <Building2 className="w-3 h-3" />
                Company
              </TabsTrigger>
              <TabsTrigger value="report" className="flex items-center gap-1 text-sm">
                <FileText className="w-3 h-3" />
                Report
              </TabsTrigger>
            </TabsList>

            <form onSubmit={form.handleSubmit(handleSubmit)} className="flex-1 flex flex-col min-h-0">
              <TabsContent value="personal" className="flex-1 overflow-auto">
                <Card className="shadow-sm">
                  <CardHeader className="pb-3 sticky top-0 bg-card z-10">
                    <CardTitle className="text-lg">Report Selection</CardTitle>
                    <CardDescription className="text-xs">
                      Choose the type of report you want to generate
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid gap-2">
                      <Label htmlFor="reportType">Report Type</Label>
                      <Select 
                        {...form.register("reportType")}
                        onValueChange={(value) => form.setValue("reportType", value as typeof REPORT_TYPES[number])}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a report type" />
                        </SelectTrigger>
                        <SelectContent>
                          {REPORT_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-sm">
                  <CardHeader className="pb-3 sticky top-0 bg-card z-10">
                    <CardTitle className="text-lg">Personal Information</CardTitle>
                    <CardDescription className="text-xs">
                      Please provide accurate birth details for precise calculations
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          placeholder="e.g. Dave"
                          {...form.register("firstName")}
                        />
                        {form.formState.errors.firstName && (
                          <p className="text-xs text-destructive">{form.formState.errors.firstName.message}</p>
                        )}
                      </div>
                      <div className="space-y-1">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        placeholder="e.g. Dyno"
                        {...form.register("lastName")}
                      />
                      {form.formState.errors.lastName && (
                        <p className="text-xs text-destructive">{form.formState.errors.lastName.message}</p>
                      )}
                    </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                        <Label htmlFor="phoneNumber">Phone Number</Label>
                        <Input
                          id="phoneNumber"
                          placeholder="e.g. +919876543210"
                          {...form.register("phoneNumber")}
                        />
                        {form.formState.errors.phoneNumber && (
                          <p className="text-xs text-destructive">{form.formState.errors.phoneNumber.message}</p>
                        )}
                      </div>

                   

                    <div className="space-y-1">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="e.g. davedyno@gmail.com"
                        {...form.register("email")}
                      />
                      {form.formState.errors.email && (
                        <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
                      )}
                    </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label htmlFor="dateOfBirth">Date of Birth</Label>
                        <Input
                          id="dateOfBirth"
                          type="date"
                          {...form.register("dateOfBirth")}
                        />
                        {form.formState.errors.dateOfBirth && (
                          <p className="text-xs text-destructive">{form.formState.errors.dateOfBirth.message}</p>
                        )}
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="timeOfBirth">Time of Birth</Label>
                        <Input
                          id="timeOfBirth"
                          type="time"
                          {...form.register("timeOfBirth")}
                        />
                        {form.formState.errors.timeOfBirth && (
                          <p className="text-xs text-destructive">{form.formState.errors.timeOfBirth.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="birthPlace">Place of Birth</Label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Input
                            id="birthPlace"
                            placeholder="Search for a city..."
                            {...form.register("birthPlace")}
                          />
                          {isSearching && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                            </div>
                          )}
                          {locationSuggestions.length > 0 && (
                            <div className="absolute z-10 w-full mt-1 bg-card rounded-md shadow-lg border">
                              <ul className="py-1">
                                {locationSuggestions.map((location) => (
                                  <li
                                    key={location.place_id}
                                    className="px-3 py-2 hover:bg-muted cursor-pointer text-sm"
                                    onClick={() => handleLocationSelect(location)}
                                  >
                                    {location.display_name}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={getCurrentLocation}
                          disabled={isLocating}
                        >
                          {isLocating ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            '📍'
                          )}
                          {isLocating ? 'Locating...' : 'Current'}
                        </Button>
                      </div>
                      {locationError && (
                        <p className="text-destructive text-sm mt-1">{locationError}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label htmlFor="latitude">Latitude</Label>
                        <Input
                          id="latitude"
                          type="number"
                          step="any"
                          placeholder="e.g., 40.7128"
                          {...form.register("latitude")}
                        />
                        {form.formState.errors.latitude && (
                          <p className="text-xs text-destructive">{form.formState.errors.latitude.message}</p>
                        )}
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="longitude">Longitude</Label>
                        <Input
                          id="longitude"
                          type="number"
                          step="any"
                          placeholder="e.g., -74.0060"
                          {...form.register("longitude")}
                        />
                        {form.formState.errors.longitude && (
                          <p className="text-xs text-destructive">{form.formState.errors.longitude.message}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="company" className="flex-1 overflow-auto">
                <Card className="shadow-sm">
                  <CardHeader className="pb-3 sticky top-0 bg-card z-10">
                    <CardTitle className="text-lg">Company Information</CardTitle>
                    <CardDescription className="text-xs">
                      Add your company details for the report branding
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-1">
                      <Label htmlFor="companyName">Company Name</Label>
                      <Input
                        id="companyName"
                        placeholder="e.g., NextGen Astrology Inc."
                        {...form.register("companyName")}
                      />
                      {form.formState.errors.companyName && (
                        <p className="text-xs text-destructive">{form.formState.errors.companyName.message}</p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="companySlogan">Company Slogan/Tagline</Label>
                      <Input
                        id="companySlogan"
                        placeholder="e.g., 'Transforming lives through Vedic Astrology'"
                        {...form.register("companySlogan")}
                      />
                      {form.formState.errors.companySlogan && (
                        <p className="text-xs text-destructive">{form.formState.errors.companySlogan.message}</p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="companyYear">Establishment Year</Label>
                      <Input
                        id="companyYear"
                        type="number"
                        placeholder="e.g., 2015"
                        {...form.register("companyYear")}
                      />
                      {form.formState.errors.companyYear && (
                        <p className="text-xs text-destructive">{form.formState.errors.companyYear.message}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="report" className="flex-1 overflow-auto">
                <Card className="shadow-sm">
                  <CardHeader className="pb-3 sticky top-0 bg-card z-10">
                    <CardTitle className="text-lg">Report Template</CardTitle>
                    <CardDescription className="text-xs">
                      Customize how your report will look
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-1">
                      <Label htmlFor="reportName">Report Name</Label>
                      <Input
                        id="reportName"
                        placeholder="e.g., Comprehensive Birth Chart Analysis"
                        {...form.register("reportName")}
                      />
                      {form.formState.errors.reportName && (
                        <p className="text-xs text-destructive">{form.formState.errors.reportName.message}</p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="astrologerName">Astrologer Name</Label>
                      <Input
                        id="astrologerName"
                        placeholder="e.g., John Doe"
                        {...form.register("astrologerName")}
                      />
                      {form.formState.errors.astrologerName && (
                        <p className="text-xs text-destructive">{form.formState.errors.astrologerName.message}</p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="aboutReport">About Report</Label>
                      <Input
                        id="aboutReport"
                        placeholder="e.g., This report provides insights into your birth chart..."
                        {...form.register("aboutReport")}
                      />
                      {form.formState.errors.aboutReport && (
                        <p className="text-xs text-destructive">{form.formState.errors.aboutReport.message}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <div className="flex justify-end gap-3 mt-3 sticky bottom-0 ">
                <Button
                  type="submit"
                  size="sm"
                  className="min-w-[120px]"
                  disabled={loadingState.isLoading}
                >
                  {loadingState.isLoading ? (
                    <>
                      <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                      {loadingState.message}
                    </>
                  ) : (
                    'Generate Report'
                  )}
                </Button>
              </div>
            </form>
          </Tabs>
        )}
      </div>
    </div>
  )
}