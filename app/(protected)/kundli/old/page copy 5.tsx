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

  const validateCoordinates = (lat: string, lon: string): boolean => {
    const numLat = parseFloat(lat);
    const numLon = parseFloat(lon);
    if (isNaN(numLat) || isNaN(numLon)) {
      return false;
    }
    return numLat >= -90 && numLat <= 90 && numLon >= -180 && numLon <= 180;
  };

  const handleLocationSearch = useCallback(
    debounce(async (searchTerm: string) => {
      if (!searchTerm || searchTerm.length < 3) {
        setLocationSuggestions([]);
        return;
      }

      setIsSearching(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            searchTerm
          )}&limit=5`
        );
        const data = await response.json();
        
        const suggestions: LocationSuggestion[] = data.map((item: any) => ({
          place_id: item.place_id,
          display_name: item.display_name,
          lat: item.lat,
          lon: item.lon,
        }));
        
        setLocationSuggestions(suggestions);
      } catch (error) {
        console.error('Error searching for locations:', error);
        toast.error('Failed to search for locations');
      } finally {
        setIsSearching(false);
      }
    }, 500),
    []
  );

  const handleLocationSelect = (suggestion: LocationSuggestion) => {
    form.setValue('birthPlace', suggestion.display_name);
    form.setValue('latitude', suggestion.lat);
    form.setValue('longitude', suggestion.lon);
    setLocationSuggestions([]);
  };

  const handleCoordinateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    
    if (id === 'latitude' && !validateCoordinates(value, form.getValues('longitude'))) {
      setLocationError('Latitude must be between -90 and 90 degrees');
      return;
    }
    
    if (id === 'longitude' && !validateCoordinates(form.getValues('latitude'), value)) {
      setLocationError('Longitude must be between -180 and 180 degrees');
      return;
    }
    
    setLocationError('');
    form.setValue(id as keyof KundliFormValues, value);
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      return;
    }

    // Check if we're in a secure context
    if (window.location.protocol === 'http:' && window.location.hostname !== 'localhost') {
      setLocationError('Geolocation requires a secure connection (HTTPS). Please enter your location manually or try again when deployed with HTTPS.');
      return;
    }

    setIsLocating(true);
    setLocationError('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          // Reverse geocoding using Nominatim API (OpenStreetMap)
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          
          if (!response.ok) {
            throw new Error('Failed to get location details');
          }

          const data = await response.json();
          
          // Format address components
          const city = data.address.city || data.address.town || data.address.village || '';
          const state = data.address.state || '';
          const country = data.address.country || '';
          const formattedPlace = [city, state, country].filter(Boolean).join(', ');

          if (!formattedPlace) {
            throw new Error('Could not determine location name');
          }

          form.setValue('latitude', latitude.toString());
          form.setValue('longitude', longitude.toString());
          form.setValue('birthPlace', formattedPlace);
        } catch (error) {
          console.error('Error getting location details:', error);
          setLocationError('Could not get location details. Please enter your location manually.');
          // Don't update coordinates if we couldn't get a proper location
        }
        setIsLocating(false);
      },
      (error) => {
        setIsLocating(false);
        switch(error.code) {
          case error.PERMISSION_DENIED:
            setLocationError('Location permission denied. Please enter your location manually.');
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError('Location information unavailable. Please enter your location manually.');
            break;
          case error.TIMEOUT:
            setLocationError('Location request timed out. Please try again or enter manually.');
            break;
          default:
            setLocationError('Error getting location. Please enter your location manually.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  // Enhanced loading messages with more mystical tone
  const loadingMessages = [
    "Connecting with celestial energies...",
    "Mapping the cosmic alignments of your birth moment...",
    "Channeling ancient astrological wisdom...",
    "Crafting your personalized cosmic blueprint..."
  ];

  const generateKundli = async () => {
    try {
      setLoadingState({
        isLoading: true,
        step: 0,
        message: loadingMessages[0]
      });
      
      const response = await fetch('http://192.168.29.187:5000/generate_kundli', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date_of_birth: form.getValues('dateOfBirth'),
          time_of_birth: form.getValues('timeOfBirth'),
          latitude: form.getValues('latitude'),
          longitude: form.getValues('longitude')
        })
      });

      const data = await response.json();
      setKundliData(data);
      return data;
    } catch (error) {
      setLoadingState({ isLoading: false, step: 0, message: '' });
      console.error('Error generating kundli:', error);
      throw error;
    }
  };

  const generateAstrologyReport = async (kundliData: any) => {
    try {
      setLoadingState({
        isLoading: true,
        step: 2,
        message: loadingMessages[2]
      });

      // Log the kundliData to check what we received from generate_kundli
      console.log('Data received from generate_kundli:', kundliData);

      const requestData = {
        kundliData: {
          name: form.getValues('firstName') + " " + form.getValues('lastName'),
          dob: form.getValues('dateOfBirth'),
          time_of_birth: form.getValues('timeOfBirth'),
          place_of_birth: form.getValues('birthPlace') || "Not specified",
          sun_sign: kundliData?.sun_sign || "Not specified",
          moon_sign: kundliData?.moon_sign || "Not specified",
          ascendant: kundliData?.ascendant || "Not specified",
          latitude: form.getValues('latitude') || "Not specified",
          longitude: form.getValues('longitude') || "Not specified",
          timezone: "Asia/Kolkata",
          sunrise_time: kundliData?.sunrise_time || "Not specified",
          sunset_time: kundliData?.sunset_time || "Not specified",
          ayanamsa: "Lahiri",
          kundli_data: kundliData,
        }
      };

      // Log the data we're about to send to the API
      console.log('Data being sent to /api/openai:', requestData);

      const response = await fetch('/api/openai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });
      
      // Log the response from the API
      const analysisData = await response.json();
      console.log('Response received from /api/openai:', analysisData);
      
      setLoadingState({
        isLoading: true,
        step: 3,
        message: loadingMessages[3]
      });

      const pdfResponse = await fetch('/api/pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(analysisData)
      });

      if (!pdfResponse.ok) {
        throw new Error('Failed to generate PDF');
      }

      // Create a blob from the PDF data
      const pdfBlob = await pdfResponse.blob();
      
      // Create a download link and trigger it
      const downloadUrl = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${form.getValues('firstName')}_${form.getValues('lastName')}_report.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      setLoadingState({ isLoading: false, step: 0, message: '' });
    } catch (error) {
      setLoadingState({ isLoading: false, step: 0, message: '' });
      console.error('Error generating report:', error);
    }
  };

  const onSubmit = async (data: KundliFormValues) => {
    try {
      const kundliResult = await generateKundli();
      await generateAstrologyReport(kundliResult);
    } catch (error) {
      console.error('Error in form submission:', error);
      toast.error('Failed to generate report. Please try again.');
    }
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

            <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 flex flex-col min-h-0">
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
                            onChange={(e) => {
                              form.setValue('birthPlace', e.target.value);
                              handleLocationSearch(e.target.value);
                            }}
                          />
                          {isSearching && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                            </div>
                          )}
                          {locationSuggestions.length > 0 && (
                            <div className="absolute z-10 mt-1 w-full rounded-md border bg-popover p-2 shadow-md">
                              {locationSuggestions.map((suggestion) => (
                                <button
                                  key={suggestion.place_id}
                                  className="w-full rounded px-2 py-1 text-left hover:bg-accent hover:text-accent-foreground"
                                  onClick={() => handleLocationSelect(suggestion)}
                                  type="button"
                                >
                                  {suggestion.display_name}
                                </button>
                              ))}
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
                          onChange={handleCoordinateChange}
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
                          onChange={handleCoordinateChange}
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