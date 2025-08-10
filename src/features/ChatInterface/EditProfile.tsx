import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  User, Mail, Phone, Calendar, Globe, Plane, 
  MapPin, Shield, Camera, Save, X, ArrowLeft,
  CheckCircle, AlertCircle
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { realApiService } from '@/api/realApiService';
import { useToast } from '@/hooks/use-toast';

interface EditProfileProps {
  onClose: () => void;
  onProfileUpdated: () => void;
}

export const EditProfile: React.FC<EditProfileProps> = ({ onClose, onProfileUpdated }) => {
  const { state, dispatch } = useApp();
  const { user } = state;
  const { toast } = useToast();
  const apiService = realApiService;

  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    dateOfBirth: user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
    gender: user?.gender || '',
    nationality: user?.nationality || '',
    language: user?.language || '',
    contact: user?.contact || user?.phone || '', // Handle both contact and phone fields
    preferredTravelMode: user?.preferredTravelMode || 'any',
    emergencyContact: {
      name: user?.emergencyContact?.name || '',
      relationship: user?.emergencyContact?.relationship || '',
      contact: user?.emergencyContact?.contact || '',
      email: user?.emergencyContact?.email || ''
    },
    travelDocuments: {
      passport: {
        number: user?.travelDocuments?.passport?.number || '',
        expiryDate: user?.travelDocuments?.passport?.expiryDate ? 
          new Date(user.travelDocuments.passport.expiryDate).toISOString().split('T')[0] : '',
        issuingCountry: user?.travelDocuments?.passport?.issuingCountry || ''
      },
      visa: {
        number: user?.travelDocuments?.visa?.number || '',
        expiryDate: user?.travelDocuments?.visa?.expiryDate ? 
          new Date(user.travelDocuments.visa.expiryDate).toISOString().split('T')[0] : '',
        issuingCountry: user?.travelDocuments?.visa?.issuingCountry || ''
      },
      governmentId: {
        type: user?.travelDocuments?.governmentId?.type || 'aadhar',
        number: user?.travelDocuments?.governmentId?.number || ''
      },
      visaStatus: user?.travelDocuments?.visaStatus || 'not-required',
      passengerType: user?.travelDocuments?.passengerType || 'general'
    },
    preferences: {
      budgetRange: {
        min: user?.preferences?.budgetRange?.min || 10000,
        max: user?.preferences?.budgetRange?.max || 1000000
      },
      travelStyle: user?.preferences?.travelStyle || 'comfort',
      interests: user?.preferences?.interests || []
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
    { value: 'prefer-not-to-say', label: 'Prefer not to say' }
  ];

  const travelModeOptions = [
    { value: 'flight', label: 'Flight' },
    { value: 'train', label: 'Train' },
    { value: 'bus', label: 'Bus' },
    { value: 'any', label: 'Any' }
  ];

  const governmentIdTypes = [
    { value: 'aadhar', label: 'Aadhar Card' },
    { value: 'driving-license', label: 'Driving License' },
    { value: 'voter-id', label: 'Voter ID' },
    { value: 'pan', label: 'PAN Card' },
    { value: 'national-id', label: 'National ID' }
  ];

  const visaStatusOptions = [
    { value: 'not-required', label: 'Not Required' },
    { value: 'valid', label: 'Valid' },
    { value: 'apply', label: 'Need to Apply' },
    { value: 'on-arrival', label: 'On Arrival' }
  ];

  const passengerTypeOptions = [
    { value: 'general', label: 'General' },
    { value: 'senior-citizen', label: 'Senior Citizen' },
    { value: 'student', label: 'Student' },
    { value: 'military', label: 'Military' }
  ];

  const travelStyleOptions = [
    { value: 'budget', label: 'Budget' },
    { value: 'comfort', label: 'Comfort' },
    { value: 'luxury', label: 'Luxury' }
  ];

  const interestOptions = [
    { value: 'adventure', label: 'Adventure' },
    { value: 'culture', label: 'Culture' },
    { value: 'relaxation', label: 'Relaxation' },
    { value: 'food', label: 'Food' },
    { value: 'shopping', label: 'Shopping' },
    { value: 'nature', label: 'Nature' },
    { value: 'history', label: 'History' }
  ];

  const handleInputChange = (field: string, value: any, nestedField?: string) => {
    if (nestedField) {
      setFormData(prev => ({
        ...prev,
        [field]: {
          ...prev[field as keyof typeof prev],
          [nestedField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleNestedInputChange = (field: string, subField: string, value: any, subSubField?: string) => {
    if (subSubField) {
      setFormData(prev => ({
        ...prev,
        [field]: {
          ...prev[field as keyof typeof prev],
          [subField]: {
            ...(prev[field as keyof typeof prev] as any)?.[subField],
            [subSubField]: value
          }
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: {
          ...prev[field as keyof typeof prev],
          [subField]: value
        }
      }));
    }
  };

  const validateForm = () => {
    console.log('Validating form...');
    const newErrors: any = {};
    
    // Only validate fields that the user has actually filled in
    // All fields are optional - user can edit only what they want
    
    // Clear any previous errors
    setErrors({});
    
    // If user provided a full name, validate it's not empty
    if (formData.fullName && formData.fullName.trim() !== '' && formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters';
    }
    
    // If user provided a contact number, validate it's a valid format
    if (formData.contact && formData.contact.trim() !== '' && !/^[\+]?[1-9][\d]{0,15}$/.test(formData.contact.trim())) {
      newErrors.contact = 'Please enter a valid contact number';
    }
    
    // If user provided a date of birth, validate it's not in the future
    if (formData.dateOfBirth && formData.dateOfBirth.trim() !== '' && new Date(formData.dateOfBirth) > new Date()) {
      newErrors.dateOfBirth = 'Date of birth cannot be in the future';
    }
    
    // If user provided emergency contact details, validate they're complete if any field is filled
    if ((formData.emergencyContact.name && formData.emergencyContact.name.trim() !== '') || 
        (formData.emergencyContact.relationship && formData.emergencyContact.relationship.trim() !== '') || 
        (formData.emergencyContact.contact && formData.emergencyContact.contact.trim() !== '')) {
      if (!formData.emergencyContact.name || formData.emergencyContact.name.trim() === '') {
        newErrors.emergencyContact = 'Emergency contact name is required if providing emergency contact details';
      }
      if (!formData.emergencyContact.contact || formData.emergencyContact.contact.trim() === '') {
        newErrors.emergencyContact = 'Emergency contact number is required if providing emergency contact details';
      }
    }
    
    // If user provided budget range, validate min is less than max
    if (formData.preferences.budgetRange.min > 0 && formData.preferences.budgetRange.max > 0) {
      if (formData.preferences.budgetRange.min >= formData.preferences.budgetRange.max) {
        newErrors.budgetRange = 'Minimum budget must be less than maximum budget';
      }
    }
    
    console.log('Validation errors found:', newErrors);
    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;
    console.log('Form is valid:', isValid);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Form submission started');
    console.log('Form data:', formData);
    
    if (!validateForm()) {
      console.log('Form validation failed');
      return;
    }

    console.log('Form validation passed, proceeding with API call');
    setIsLoading(true);
    
    try {
      // Prepare the data according to the backend API structure
      // The backend expects these fields at the top level
      const profileData = {
        fullName: formData.fullName,
        contact: formData.contact, // Changed from phone to contact
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        nationality: formData.nationality,
        language: formData.language,
        preferredTravelMode: formData.preferredTravelMode,
        emergencyContact: formData.emergencyContact,
        preferences: {
          budgetRange: formData.preferences.budgetRange,
          travelStyle: formData.preferences.travelStyle,
          interests: formData.preferences.interests,
          travelDocuments: formData.travelDocuments
        }
      };

      console.log('Sending profile data:', profileData);

      // Use the new extended method that matches the backend controller
      const response = await apiService.updateUserProfileExtended(profileData);

      console.log('API response:', response);

      if (response.success) {
        // Update the user in context with the new data from response.data
        const updatedUserData = {
          fullName: response.data.fullName || formData.fullName,
          contact: response.data.contact || formData.contact,
          dateOfBirth: response.data.dateOfBirth || formData.dateOfBirth,
          gender: response.data.gender || formData.gender,
          nationality: response.data.nationality || formData.nationality,
          language: response.data.language || formData.language,
          preferredTravelMode: response.data.preferredTravelMode || formData.preferredTravelMode,
          emergencyContact: response.data.emergencyContact || formData.emergencyContact,
          travelDocuments: response.data.travelDocuments || formData.travelDocuments,
          preferences: {
            budgetRange: response.data.preferences?.budgetRange || formData.preferences.budgetRange,
            travelStyle: response.data.preferences?.travelStyle || formData.preferences.travelStyle,
            interests: response.data.preferences?.interests || formData.preferences.interests
          }
        };

        console.log('Updating user context with:', updatedUserData);

        dispatch({ 
          type: 'UPDATE_USER', 
          payload: updatedUserData
        });

        toast({
          title: "Profile Updated",
          description: "Your profile has been updated successfully!",
          variant: "default",
        });

        // Close the modal and notify parent
        onProfileUpdated();
        onClose();
      } else {
        // Handle API error response
        console.error('API returned error:', response);
        toast({
          title: "Update Failed",
          description: response.message || "Failed to update profile. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInterestToggle = (interest: string) => {
    const currentInterests = formData.preferences.interests;
    const newInterests = currentInterests.includes(interest)
      ? currentInterests.filter(i => i !== interest)
      : [...currentInterests, interest];
    
    handleInputChange('preferences', { ...formData.preferences, interests: newInterests });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="icon" onClick={onClose}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <CardTitle className="text-xl">Edit Profile</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Update your personal information and travel preferences
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Picture Section */}
            <div className="text-center space-y-4">
              <Avatar className="w-24 h-24 mx-auto ring-4 ring-primary/20">
                <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white text-2xl">
                  {formData.fullName.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <Button variant="outline" size="sm">
                <Camera className="w-4 h-4 mr-2" />
                Change Photo
              </Button>
            </div>

            <Separator />

            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center">
                <User className="w-5 h-5 mr-2" />
                Basic Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    placeholder="Enter your full name (optional)"
                    className={errors.fullName ? 'border-red-500' : ''}
                  />
                  {errors.fullName && (
                    <p className="text-sm text-red-500 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.fullName}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact">Contact Number</Label>
                  <Input
                    id="contact"
                    value={formData.contact}
                    onChange={(e) => handleInputChange('contact', e.target.value)}
                    placeholder="Enter your contact number (optional)"
                    className={errors.contact ? 'border-red-500' : ''}
                  />
                  {errors.contact && (
                    <p className="text-sm text-red-500 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.contact}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                    className={errors.dateOfBirth ? 'border-red-500' : ''}
                  />
                  {errors.dateOfBirth && (
                    <p className="text-sm text-red-500 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.dateOfBirth}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                      <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nationality">Nationality</Label>
                  <Input
                    id="nationality"
                    value={formData.nationality}
                    onChange={(e) => handleInputChange('nationality', e.target.value)}
                    placeholder="Enter your nationality (optional)"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language">Preferred Language</Label>
                  <Input
                    id="language"
                    value={formData.language}
                    onChange={(e) => handleInputChange('language', e.target.value)}
                    placeholder="Enter your preferred language (optional)"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="preferredTravelMode">Preferred Travel Mode</Label>
                  <Select value={formData.preferredTravelMode} onValueChange={(value) => handleInputChange('preferredTravelMode', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select travel mode (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="flight">Flight</SelectItem>
                      <SelectItem value="train">Train</SelectItem>
                      <SelectItem value="bus">Bus</SelectItem>
                      <SelectItem value="any">Any</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Separator />

            {/* Emergency Contact */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Emergency Contact
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emergencyName">Emergency Contact Name</Label>
                  <Input
                    id="emergencyName"
                    value={formData.emergencyContact.name}
                    onChange={(e) => handleInputChange('emergencyContact', { ...formData.emergencyContact, name: e.target.value })}
                    placeholder="Enter emergency contact name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergencyRelationship">Relationship</Label>
                  <Input
                    id="emergencyRelationship"
                    value={formData.emergencyContact.relationship}
                    onChange={(e) => handleInputChange('emergencyContact', { ...formData.emergencyContact, relationship: e.target.value })}
                    placeholder="e.g., Spouse, Parent, Friend"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergencyContact">Emergency Contact Number</Label>
                  <Input
                    id="emergencyContact"
                    value={formData.emergencyContact.contact}
                    onChange={(e) => handleInputChange('emergencyContact', { ...formData.emergencyContact, contact: e.target.value })}
                    placeholder="Enter emergency contact number"
                    className={errors.emergencyContact ? 'border-red-500' : ''}
                  />
                  {errors.emergencyContact && (
                    <p className="text-sm text-red-500 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.emergencyContact}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergencyEmail">Emergency Contact Email</Label>
                  <Input
                    id="emergencyEmail"
                    type="email"
                    value={formData.emergencyContact.email}
                    onChange={(e) => handleInputChange('emergencyContact', { ...formData.emergencyContact, email: e.target.value })}
                    placeholder="Enter emergency contact email"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Travel Documents */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center">
                <Globe className="w-5 h-5 mr-2" />
                Travel Documents
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="passportNumber">Passport Number</Label>
                  <Input
                    id="passportNumber"
                    value={formData.travelDocuments.passport.number}
                    onChange={(e) => handleNestedInputChange('travelDocuments', 'passport', 'number', e.target.value)}
                    placeholder="Enter passport number"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="passportExpiry">Passport Expiry Date</Label>
                  <Input
                    id="passportExpiry"
                    type="date"
                    value={formData.travelDocuments.passport.expiryDate}
                    onChange={(e) => handleNestedInputChange('travelDocuments', 'passport', 'expiryDate', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="passportCountry">Passport Issuing Country</Label>
                  <Input
                    id="passportCountry"
                    value={formData.travelDocuments.passport.issuingCountry}
                    onChange={(e) => handleNestedInputChange('travelDocuments', 'passport', 'issuingCountry', e.target.value)}
                    placeholder="Enter issuing country"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="visaStatus">Visa Status</Label>
                  <Select value={formData.travelDocuments.visaStatus} onValueChange={(value) => handleNestedInputChange('travelDocuments', 'visaStatus', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select visa status" />
                    </SelectTrigger>
                    <SelectContent>
                      {visaStatusOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="passengerType">Passenger Type</Label>
                  <Select value={formData.travelDocuments.passengerType} onValueChange={(value) => handleNestedInputChange('travelDocuments', 'passengerType', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select passenger type" />
                    </SelectTrigger>
                    <SelectContent>
                      {passengerTypeOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="governmentIdType">Government ID Type</Label>
                  <Select value={formData.travelDocuments.governmentId.type} onValueChange={(value) => handleNestedInputChange('travelDocuments', 'governmentId', 'type', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select ID type" />
                    </SelectTrigger>
                    <SelectContent>
                      {governmentIdTypes.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Separator />

            {/* Travel Preferences */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center">
                <Plane className="w-5 h-5 mr-2" />
                Travel Preferences
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="travelStyle">Travel Style</Label>
                  <Select value={formData.preferences.travelStyle} onValueChange={(value) => handleNestedInputChange('preferences', 'travelStyle', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select travel style" />
                    </SelectTrigger>
                    <SelectContent>
                      {travelStyleOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Budget Range (₹)</Label>
                  <div className="flex space-x-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={formData.preferences.budgetRange.min}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 0;
                        handleNestedInputChange('preferences', 'budgetRange', 'min', value);
                      }}
                    />
                    <span className="flex items-center">to</span>
                    <Input
                      type="number"
                      placeholder="Max"
                      value={formData.preferences.budgetRange.max}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 0;
                        handleNestedInputChange('preferences', 'budgetRange', 'max', value);
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Travel Interests</Label>
                <div className="flex flex-wrap gap-2">
                  {interestOptions.map(interest => (
                    <Badge
                      key={interest.value}
                      variant={formData.preferences.interests.includes(interest.value) ? "default" : "outline"}
                      className="cursor-pointer hover:bg-primary/10"
                      onClick={() => handleInterestToggle(interest.value)}
                    >
                      {interest.label}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-6 border-t">
              <Button variant="outline" onClick={onClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
