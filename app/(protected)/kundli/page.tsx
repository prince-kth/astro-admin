'use client'

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState, useCallback, useEffect } from "react"
import { User, Building2, FileText, Loader2, Star, Sparkles, Coins, Wallet, ScrollText, Circle, HandCoins, Search } from "lucide-react"
import { Toaster, toast } from 'sonner'
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"

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

const REPORT_ENDPOINTS = {
  "Chakra Healing Report": "chakra-healing",
  "Fortune Report": "yearly-fortune",
  "Lucky 13 Reports": "lucky-13",
  "Vedic 4 Report": "vedic4",
  "Wealth Comprehensive Report": "wealth-comprehensive",
  "Wealth Report": "wealth",
  "Yogas & Doshas": "yogas-doshas"
} as const;

// Report metadata with icons and styling
const REPORT_METADATA = {
  "Chakra Healing Report": {
    icon: Circle,
    description: "Discover your energy centers and healing potential",
    color: "from-purple-500/20 to-pink-500/20",
    borderColor: "hover:border-purple-500/50",
    price: 499
  },
  "Fortune Report": {
    icon: Sparkles,
    description: "Unveil your destiny and future prospects",
    color: "from-yellow-500/20 to-orange-500/20",
    borderColor: "hover:border-yellow-500/50",
    price: 999
  },
  "Lucky 13 Reports": {
    icon: Star,
    description: "Explore your 13 key lucky elements",
    color: "from-green-500/20 to-emerald-500/20",
    borderColor: "hover:border-green-500/50",
    price: 1299
  },
  "Vedic 4 Report": {
    icon: HandCoins,
    description: "Traditional Vedic astrology insights",
    color: "from-blue-500/20 to-indigo-500/20",
    borderColor: "hover:border-blue-500/50",
    price: 799
  },
  "Wealth Comprehensive Report": {
    icon: Coins,
    description: "Detailed analysis of wealth potential",
    color: "from-amber-500/20 to-yellow-500/20",
    borderColor: "hover:border-amber-500/50",
    price: 1499
  },
  "Wealth Report": {
    icon: Wallet,
    description: "Quick overview of financial prospects",
    color: "from-emerald-500/20 to-green-500/20",
    borderColor: "hover:border-emerald-500/50",
    price: 699
  },
  "Yogas & Doshas": {
    icon: ScrollText,
    description: "Analysis of astrological combinations",
    color: "from-red-500/20 to-rose-500/20",
    borderColor: "hover:border-red-500/50",
    price: 899
  }
} as const;

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

type User = {
  id: number;
  name: string;
  email: string;
  phoneNumber: string;
  countryCode: string;
  package: "Basic" | "Premium";
  walletBalance: number;
  city: string;
  country: string;
  status: "Active" | "Blocked";
  dateOfBirth: string;
  timeOfBirth: string;
  birthPlace: string;
  latitude: number;
  longitude: number;
  createdAt: string;
  updatedAt: string;
  _count?: {
    reports: number;
    transactions: number;
  };
};

export default function Home() {
  const router = useRouter();
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
  const [selectedReport, setSelectedReport] = useState<typeof REPORT_TYPES[number] | null>(null);
  const [step, setStep] = useState<'user-type' | 'existing-user' | 'select-report' | 'form'>('user-type');
  const [previousStep, setPreviousStep] = useState<'user-type' | 'existing-user' | 'select-report'>('user-type');

  // Add state for existing users
  const [existingUsers, setExistingUsers] = useState<Array<User>>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoadingUsers(true);
      const response = await fetch('/api/users/list');
      const data = await response.json();
      
      if (response.ok) {
        // The API returns the users array directly, not wrapped in a users object
        setExistingUsers(data.map((user: any) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          phoneNumber: user.phoneNumber,
          countryCode: user.countryCode,
          package: user.package,
          walletBalance: user.walletBalance,
          city: user.city,
          country: user.country,
          status: user.status,
          dateOfBirth: user.dateOfBirth,
          timeOfBirth: user.timeOfBirth,
          birthPlace: user.birthPlace,
          latitude: user.latitude,
          longitude: user.longitude,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          _count: user._count,
          reports: user._count?.reports || 0,
          transactions: user._count?.transactions || 0
        })));
      } else {
        const errorMessage = data.error || 'Failed to fetch users';
        console.error('Error response:', data);
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const filteredUsers = existingUsers.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.phoneNumber.includes(searchQuery)
  );

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
        switch (error.code) {
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

  // Handle user selection
  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
    form.reset({
      ...form.getValues(),
      phoneNumber: user.phoneNumber,
      firstName: user.name.split(' ')[0],
      lastName: user.name.split(' ').slice(1).join(' '),
      email: user.email,
      dateOfBirth: user.dateOfBirth,
      timeOfBirth: user.timeOfBirth,
      birthPlace: user.birthPlace,
      latitude: user.latitude.toString(),
      longitude: user.longitude.toString()
    });
    setStep('select-report');
  };

  const generateKundli = async () => {
    try {
      setLoadingState({
        isLoading: true,
        step: 0,
        message: "Connecting with celestial energies..."
      });

      const response = await fetch(process.env.NEXT_PUBLIC_GENERATE_KUNDLI_URL as string, {
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
        message: "Channeling ancient astrological wisdom..."
      });

      // Log the kundliData to check what we received from generate_kundli
      console.log('Data received from generate_kundli:', kundliData);

      const selectedReportType = form.getValues('reportType');
      const endpoint = REPORT_ENDPOINTS[selectedReportType];
      const apiEndpoint = `/api/openai/${endpoint}`;
      console.log(`Data being sent to ${apiEndpoint}:`, kundliData);

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
      console.log(`Data being sent to ${apiEndpoint}:`, requestData);

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      // Log the response from the API
      const analysisData = await response.json();
      console.log(`Response received from ${apiEndpoint}:`, analysisData);

      setLoadingState({
        isLoading: true,
        step: 3,
        message: "Crafting your personalized cosmic blueprint..."
      });

      // Use the previously declared selectedReportType
      const pdfData = {
        ...analysisData,
        fortune_report: {
          ...analysisData.fortune_report,
          company_details: {
            ...analysisData.fortune_report?.company_details,
            report_name: selectedReportType
          }
        }
      };

      const pdfResponse = await fetch('/api/pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pdfData)
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
    <div className={`
      flex 
      flex-col 
      bg-gradient-to-b 
      from-background 
      to-muted/50 
      min-h-screen
    `}>
      <Toaster position="top-right" expand={false} richColors />
      <div className="flex-1 p-8">
        <div className="text-center space-y-2 mb-8">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            Astrological Reports
          </h1>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            {step === 'user-type'
              ? "Let's start by finding out if you're a new or existing user"
              : step === 'existing-user'
                ? "Search for your existing details"
                : step === 'select-report'
                  ? "Choose from our collection of mystical reports to unveil your cosmic destiny"
                  : "Fill in your details for an accurate reading"}
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
                        className={`w-2 h-2 rounded-full transition-all duration-500 ${step <= loadingState.step
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
          <div className="container mx-auto max-w-7xl">
            {step === 'user-type' && (
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card
                  className="relative overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-50"
                  onClick={() => {
                    router.push('/users');
                  }}
                >
                  <CardHeader>
                    <User className="w-12 h-12 text-primary mb-4" />
                    <CardTitle>New User</CardTitle>
                    <CardDescription>First time getting an astrological report? Start here!</CardDescription>
                  </CardHeader>
                </Card>

                <Card
                  className="relative overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-100"
                  onClick={() => {
                    setPreviousStep('user-type');
                    setStep('existing-user');
                  }}
                >
                  <CardHeader>
                    <Search className="w-12 h-12 text-primary mb-4" />
                    <CardTitle>Existing User</CardTitle>
                    <CardDescription>Already have your details with us? Find them here!</CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            )}

            {step === 'existing-user' && (
              <motion.div
                className="max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Find Your Details</CardTitle>
                    <CardDescription>Search by name or phone number</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Search by name or phone number"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="flex-1"
                        />
                        <Button
                          variant="outline"
                          onClick={() => {
                            setStep('user-type');
                            setSearchQuery('');
                          }}
                        >
                          Back
                        </Button>
                      </div>

                      <div className="space-y-2">
                        {isLoadingUsers ? (
                          <div className="text-center py-4">
                            <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                            <p className="text-sm text-muted-foreground mt-2">Loading users...</p>
                          </div>
                        ) : filteredUsers.length > 0 ? (
                          filteredUsers.map((user) => (
                            <Card
                              key={user.id}
                              className="cursor-pointer hover:bg-muted/50 transition-colors"
                              onClick={() => {
                                handleUserSelect(user);
                                setPreviousStep('existing-user');
                                setStep('select-report');
                              }}
                            >
                              <CardHeader className="p-4">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <CardTitle className="text-base">{user.name}</CardTitle>
                                    <CardDescription>{user.phoneNumber}</CardDescription>
                                  </div>
                                  <Button variant="ghost" size="icon">
                                    <User className="w-4 h-4" />
                                  </Button>
                                </div>
                              </CardHeader>
                            </Card>
                          ))
                        ) : searchQuery ? (
                          <p className="text-center text-muted-foreground py-4">No users found</p>
                        ) : null}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {step === 'select-report' && (
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                {REPORT_TYPES.map((reportType) => {
                  const metadata = REPORT_METADATA[reportType];
                  const canAfford = selectedUser && selectedUser.walletBalance >= metadata.price;
                  return (
                    <motion.div
                      key={reportType}
                      whileHover={canAfford ? { scale: 1.05, y: -5 } : {}}
                      whileTap={canAfford ? { scale: 0.98 } : {}}
                      onClick={() => {
                        if (!selectedUser) {
                          toast.error('Please select a user first');
                          setStep('user-type');
                          return;
                        }
                        if (canAfford) {
                          setSelectedReport(reportType);
                          setStep('form');
                        } else {
                          toast.error(`Insufficient balance. Available: ₹${selectedUser.walletBalance.toFixed(2)}`);
                        }
                      }}
                      style={{
                        '--bg-image': `url('/assets/${reportType.toLowerCase().replace(/\s+/g, '-')}.png')`
                      } as any}
                      className={`
                        relative
                        cursor-pointer 
                        rounded-xl 
                        p-8
                        overflow-hidden
                        bg-gradient-to-br 
                        ${metadata.color}
                        border 
                        border-white/10 
                        transition-all 
                        duration-200
                        ${metadata.borderColor}
                        flex 
                        flex-col 
                        items-center 
                        text-center 
                        space-y-4 
                        group
                        hover:shadow-2xl
                        hover:shadow-primary/20
                        backdrop-blur-sm
                        before:absolute
                        before:inset-0
                        before:bg-[image:var(--bg-image)]
                        before:bg-cover
                        before:bg-center
                        before:opacity-20
                        before:mix-blend-overlay
                        before:transition-all
                        before:duration-200
                        hover:before:opacity-40
                        hover:before:scale-110
                        after:absolute
                        after:inset-0
                        after:bg-gradient-to-b
                        after:from-transparent
                        after:via-black/20
                        after:to-black/40
                        after:opacity-70
                        after:transition-opacity
                        after:duration-200
                        hover:after:opacity-60
                        ${!canAfford ? 'opacity-50 cursor-not-allowed hover:scale-100' : ''}
                      `}
                    >
                      <div className="relative z-10 p-4 rounded-full bg-white/10 backdrop-blur-sm ring-1 ring-white/20 shadow-lg transition-transform duration-500 group-hover:scale-110 group-hover:ring-white/30">
                        <metadata.icon className="w-10 h-10 transition-colors duration-200 text-white/80 group-hover:text-white" />
                      </div>
                      <div className="relative z-10 space-y-2">
                        <h3 className="text-xl font-semibold tracking-tight text-white group-hover:text-white/90">{reportType}</h3>
                        <p className="text-sm text-white/70 group-hover:text-white/80 transition-colors duration-200">{metadata.description}</p>
                        <div className="flex items-center justify-center gap-2 mt-4">
                          <Coins className="w-4 h-4 text-white/70" />
                          <span className="text-lg font-bold text-white">₹{metadata.price}</span>
                        </div>
                        {selectedUser && (
                          <div className="text-sm text-white/60">
                            Balance: ₹{selectedUser.walletBalance.toFixed(2)}
                          </div>
                        )}
                      </div>
                      {!canAfford && selectedUser && (
                        <div className="absolute inset-0 bg-background/90 backdrop-blur-sm flex items-center justify-center z-20">
                          <div className="text-center px-4">
                            <p className="text-base font-medium text-destructive">Insufficient Balance</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              Available: ₹{selectedUser.walletBalance.toFixed(2)}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                              Required: ₹{metadata.price}
                            </p>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </motion.div>
            )}

            {step === 'form' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-3xl mx-auto"
              >
                <Card className="mb-4">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div>
                      <CardTitle>Selected: {selectedReport}</CardTitle>
                      <CardDescription>{selectedReport ? REPORT_METADATA[selectedReport].description : ''}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        onClick={() => setStep(previousStep)}
                        className="flex items-center gap-2"
                      >
                        Back
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setStep('select-report')}
                      >
                        Change Report
                      </Button>
                    </div>
                  </CardHeader>
                </Card>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 flex flex-col min-h-0">
                  <Tabs defaultValue="personal" className="flex-1 flex flex-col">
                    {/* <TabsList className="grid grid-cols-3 w-full max-w-sm mx-auto mb-4">
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
                    </TabsList> */}

                    <TabsContent value="personal" className="flex-1 overflow-auto">
                      {/* <Card className="shadow-sm">
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
                      </Card> */}

                      <Card className="shadow-sm">
                        <CardHeader className="pb-3 sticky top-0 bg-card z-10">
                          <CardTitle className="text-lg">Personal Information</CardTitle>
                          <CardDescription className="text-xs">
                            Please provide accurate birth details for precise calculations
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {/* {existingUsers.length > 0 && (
                            <div className="space-y-1">
                              <Label htmlFor="existingUser">Select Existing User</Label>
                              <Select onValueChange={(phoneNumber) => fetchUserDetails(phoneNumber)}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Choose an existing user" />
                                </SelectTrigger>
                                <SelectContent>
                                  {existingUsers.map((user) => (
                                    <SelectItem key={user.phoneNumber} value={user.phoneNumber}>
                                      {user.name} ({user.phoneNumber})
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <p className="text-xs text-muted-foreground mt-1">
                                Or fill in the details manually below
                              </p>
                            </div>
                          )} */}

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
                  </Tabs>
                </form>
              </motion.div>
            )}
          </div>

        )}
      </div>

    </div>
  );
}