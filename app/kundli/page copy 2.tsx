'use client'

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState, useCallback, useEffect } from "react"
import { User, Building2, FileText, Loader2 } from "lucide-react"
import { Toaster, toast } from 'sonner'

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

export default function Home() {
 
  const [kundliData, setKundliData] = useState<any | null>(null);
  const [loadingState, setLoadingState] = useState({
    isLoading: false,
    step: 0,
    message: ''
  });
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    dateOfBirth: '',
    timeOfBirth: '',
    birthPlace: '',
    latitude: 0,
    longitude: 0,
    companyName: '',
    companySlogan: '',
    companyYear: '',
    reportName: '',
    astrologerName: '',
    aboutReport: ''
  });

  const [isLocating, setIsLocating] = useState(false);
  const [locationSuggestions, setLocationSuggestions] = useState<LocationSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [locationError, setLocationError] = useState<string>('');

  const [chartBase64, setChartBase64] = useState<string>('');

  const validateCoordinates = (lat: number, lon: number): boolean => {
    return lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
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
    setFormData(prev => ({ ...prev, birthPlace: query }));

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

  const handleLocationSelect = (location: LocationSuggestion) => {
    const lat = parseFloat(location.lat);
    const lon = parseFloat(location.lon);
    
    if (!validateCoordinates(lat, lon)) {
      setLocationError('Invalid coordinates received');
      return;
    }

    setFormData(prev => ({
      ...prev,
      birthPlace: location.display_name,
      latitude: lat,
      longitude: lon
    }));
    setLocationSuggestions([]);
    setLocationError('');
  };

  const handleCoordinateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    const numValue = parseFloat(value);
    
    if (id === 'latitude' && (numValue < -90 || numValue > 90)) {
      setLocationError('Latitude must be between -90 and 90 degrees');
      return;
    }
    
    if (id === 'longitude' && (numValue < -180 || numValue > 180)) {
      setLocationError('Longitude must be between -180 and 180 degrees');
      return;
    }
    
    setLocationError('');
    handleInputChange(e);
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

          setFormData(prev => ({
            ...prev,
            birthPlace: data.display_name,
            latitude: latitude.toString(),
            longitude: longitude.toString()
          }));
          
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.firstName || !formData.lastName || !formData.email) {
      toast.error('Please fill in all required personal information');
      return;
    }

    if (!formData.dateOfBirth || !formData.timeOfBirth) {
      toast.error('Birth date and time are required');
      return;
    }

    if (!formData.birthPlace || !formData.latitude || !formData.longitude) {
      toast.error('Birth place with coordinates is required');
      return;
    }

    setLoadingState({
      isLoading: true,
      step: 0,
      message: "Initializing kundli generation..."
    });

    try {
      // Simulate API call with steps
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLoadingState(prev => ({
        ...prev,
        step: 1,
        message: "Calculating planetary positions..."
      }));

      await new Promise(resolve => setTimeout(resolve, 1000));
      setLoadingState(prev => ({
        ...prev,
        step: 2,
        message: "Analyzing aspects and conjunctions..."
      }));

      await new Promise(resolve => setTimeout(resolve, 1000));
      setLoadingState(prev => ({
        ...prev,
        step: 3,
        message: "Generating final report..."
      }));

      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Success notification
      toast.success('Kundli report generated successfully!');
      
      setKundliData({
        // Your kundli data here
      });
    } catch (error) {
      toast.error('Failed to generate kundli report. Please try again.');
    } finally {
      setLoadingState({
        isLoading: false,
        step: 0,
        message: ""
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const generateKundli = async () => {
    try {
      setLoadingState({
        isLoading: true,
        step: 0,
        message: "Initializing kundli generation..."
      });
      
      const response = await fetch('http://192.168.29.187:5000/generate_kundli', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date_of_birth: formData.dateOfBirth,
          time_of_birth: formData.timeOfBirth,
          latitude: formData.latitude,
          longitude: formData.longitude
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
        message: "Analyzing aspects and conjunctions..."
      });

      // Log the kundliData to check what we received from generate_kundli
      console.log('Data received from generate_kundli:', kundliData);

      const requestData = {
        kundliData: {
          name: formData.firstName + " " + formData.lastName,
          dob: formData.dateOfBirth,
          time_of_birth: formData.timeOfBirth,
          place_of_birth: formData.birthPlace || "Not specified",
          sun_sign: kundliData?.sun_sign || "Not specified",
          moon_sign: kundliData?.moon_sign || "Not specified",
          ascendant: kundliData?.ascendant || "Not specified",
          latitude: formData.latitude?.toString() || "Not specified",
          longitude: formData.longitude?.toString() || "Not specified",
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
        message: "Generating final report..."
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
      link.download = `${formData.firstName}_${formData.lastName}_report.pdf`;
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



  const handleDummySubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form Data:', formData)
  }

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

            <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
              <TabsContent value="personal" className="flex-1 overflow-auto">
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
                        <Label htmlFor="firstName" className="text-sm">First Name</Label>
                        <Input
                          id="firstName"
                          placeholder="e.g., John"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          required
                          className="h-8 text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="lastName" className="text-sm">Last Name</Label>
                        <Input
                          id="lastName"
                          placeholder="e.g., Smith"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          required
                          className="h-8 text-sm"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="email" className="text-sm">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="e.g., john.smith@example.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="h-8 text-sm"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label htmlFor="dateOfBirth" className="text-sm">Date of Birth</Label>
                        <Input
                          id="dateOfBirth"
                          type="date"
                          value={formData.dateOfBirth}
                          onChange={handleInputChange}
                          required
                          className="h-8 text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="timeOfBirth" className="text-sm">Time of Birth</Label>
                        <Input
                          id="timeOfBirth"
                          type="time"
                          value={formData.timeOfBirth}
                          onChange={handleInputChange}
                          required
                          className="h-8 text-sm"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="birthPlace" className="text-sm">Place of Birth</Label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Input
                            id="birthPlace"
                            placeholder="Search for a city..."
                            value={formData.birthPlace}
                            onChange={handleLocationSearch}
                            required
                            className="h-8 text-sm"
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
                        <Label htmlFor="latitude" className="text-sm">Latitude</Label>
                        <Input
                          id="latitude"
                          type="number"
                          step="any"
                          placeholder="e.g., 40.7128"
                          value={formData.latitude || ''}
                          onChange={handleCoordinateChange}
                          required
                          className="h-8 text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="longitude" className="text-sm">Longitude</Label>
                        <Input
                          id="longitude"
                          type="number"
                          step="any"
                          placeholder="e.g., -74.0060"
                          value={formData.longitude || ''}
                          onChange={handleCoordinateChange}
                          required
                          className="h-8 text-sm"
                        />
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
                      <Label htmlFor="companyName" className="text-sm">Company Name</Label>
                      <Input
                        id="companyName"
                        placeholder="e.g., NextGen Astrology Inc."
                        value={formData.companyName}
                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="companySlogan" className="text-sm">Company Slogan/Tagline</Label>
                      <Input
                        id="companySlogan"
                        placeholder="e.g., 'Transforming lives through Vedic Astrology'"
                        value={formData.companySlogan}
                        onChange={(e) => setFormData({ ...formData, companySlogan: e.target.value })}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="companyYear" className="text-sm">Establishment Year</Label>
                      <Input
                        id="companyYear"
                        type="number"
                        placeholder="e.g., 2015"
                        value={formData.companyYear}
                        onChange={(e) => setFormData({ ...formData, companyYear: e.target.value })}
                        className="h-8 text-sm"
                      />
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
                      <Label htmlFor="reportName" className="text-sm">Report Name</Label>
                      <Input
                        id="reportName"
                        placeholder="e.g., Comprehensive Birth Chart Analysis"
                        value={formData.reportName}
                        onChange={(e) => setFormData({ ...formData, reportName: e.target.value })}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="astrologerName" className="text-sm">Astrologer Name</Label>
                      <Input
                        id="astrologerName"
                        placeholder="e.g., John Doe"
                        value={formData.astrologerName}
                        onChange={(e) => setFormData({ ...formData, astrologerName: e.target.value })}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="aboutReport" className="text-sm">About Report</Label>
                      <Input
                        id="aboutReport"
                        placeholder="e.g., This report provides insights into your birth chart..."
                        value={formData.aboutReport}
                        onChange={(e) => setFormData({ ...formData, aboutReport: e.target.value })}
                        className="h-8 text-sm"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <div className="flex justify-end gap-3 mt-3 sticky bottom-0 bg-background/95 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/60">
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