import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { BasicDetailsForm } from '@/features/Onboarding/BasicDetailsForm';
import { TravelModeForm } from '@/features/Onboarding/TravelModeForm';
import { TravelDocumentsForm } from '@/features/Onboarding/TravelDocumentsForm';
import { EmergencyContactForm } from '@/features/Onboarding/EmergencyContactForm';
import { ConsentForm } from '@/features/Onboarding/ConsentForm';
import { FamilyMemberOnboarding } from '@/features/FamilyMembers/FamilyMemberOnboarding';
import { realApiService } from '@/api/realApiService';
import { toast } from 'sonner';

const OnboardingPage = () => {
  const navigate = useNavigate();
  const { dispatch } = useApp();
  const [currentStep, setCurrentStep] = useState(1);
  const [showFamilyOnboarding, setShowFamilyOnboarding] = useState(false);
  const [formData, setFormData] = useState({
    basicDetails: {},
    travelMode: {},
    travelDocuments: {},
    emergencyContact: {},
    consent: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalSteps = 5;
  const progress = (currentStep / totalSteps) * 100;

  const handleNext = () => {
    // Validate current step before proceeding
    if (!validateCurrentStep()) {
      return;
    }

    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1: // Basic Details
        const basicDetails = formData.basicDetails as any;
        if (!basicDetails.fullName || !basicDetails.dateOfBirth || !basicDetails.gender || 
            !basicDetails.nationality || !basicDetails.language || !basicDetails.contact) {
          toast.error('Please fill in all required fields');
          return false;
        }
        break;
      case 2: // Travel Mode
        const travelMode = formData.travelMode as any;
        if (!travelMode.preferredTravelMode) {
          toast.error('Please select a preferred travel mode');
          return false;
        }
        break;
      case 3: // Travel Documents
        const travelDocs = formData.travelDocuments as any;
        // Check if user has provided at least one travel document
        const hasPassport = travelDocs.passportNumber && travelDocs.passportNumber.trim() !== '';
        const hasGovernmentId = travelDocs.idNumber && travelDocs.idNumber.trim() !== '';
        
        if (!hasPassport && !hasGovernmentId) {
          toast.error('Please provide at least one travel document (passport number or government ID)');
          return false;
        }
        
        // If passport is provided, check if expiry date is also provided
        if (hasPassport && (!travelDocs.passportExpiry || travelDocs.passportExpiry.trim() === '')) {
          toast.error('Please provide passport expiry date');
          return false;
        }
        
        // If government ID is provided, check if ID type is also selected
        if (hasGovernmentId && (!travelDocs.idType || travelDocs.idType.trim() === '')) {
          toast.error('Please select an ID type');
          return false;
        }
        break;
      case 4: // Emergency Contact
        const emergency = formData.emergencyContact as any;
        if (!emergency.name || !emergency.contact || !emergency.relationship) {
          toast.error('Please fill in all emergency contact fields');
          return false;
        }
        break;
      case 5: // Consent
        if (!formData.consent) {
          toast.error('Please accept the terms and conditions');
          return false;
        }
        break;
    }
    return true;
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateFormData = (step: string, data: any) => {
    setFormData(prev => ({
      ...prev,
      [step]: data
    }));
  };

  // Transform frontend travel documents data to backend model structure
  const transformTravelDocuments = (travelDocs: any) => {
    const transformed: any = {};
    
    if (travelDocs.passportNumber && travelDocs.passportNumber.trim() !== '') {
      transformed.passport = {
        number: travelDocs.passportNumber,
        expiryDate: travelDocs.passportExpiry || null,
        issuingCountry: travelDocs.passportIssuingCountry || null
      };
    }
    
    if (travelDocs.idNumber && travelDocs.idNumber.trim() !== '') {
      transformed.governmentId = {
        type: travelDocs.idType,
        number: travelDocs.idNumber
      };
    }
    
    // Add additional fields that might be useful
    if (travelDocs.visaStatus) {
      transformed.visaStatus = travelDocs.visaStatus;
    }
    
    if (travelDocs.passengerType) {
      transformed.passengerType = travelDocs.passengerType;
    }
    
    return transformed;
  };

  const handleMainOnboardingComplete = () => {
    // Show family member onboarding
    setShowFamilyOnboarding(true);
  };

  const handleFamilyMembersComplete = async (familyMembers: any[]) => {
    console.log('=== handleFamilyMembersComplete called ===');
    console.log('Family members received:', familyMembers);
    console.log('Current form data:', formData);
    
    // Add a timeout fallback to prevent getting stuck
    const timeoutId = setTimeout(() => {
      console.log('Timeout fallback triggered - forcing completion');
      setIsSubmitting(false);
      toast.warning('Onboarding taking longer than expected, please try again');
    }, 15000); // 15 second timeout
    
    try {
      setIsSubmitting(true);
      console.log('Set isSubmitting to true');
      
      // Prepare onboarding data
      const onboardingData = {
        fullName: (formData.basicDetails as any)?.fullName || '',
        dateOfBirth: (formData.basicDetails as any)?.dateOfBirth || '',
        gender: (formData.basicDetails as any)?.gender || '',
        nationality: (formData.basicDetails as any)?.nationality || '',
        language: (formData.basicDetails as any)?.language || '',
        contact: (formData.basicDetails as any)?.contact || '',
        preferredTravelMode: (formData.travelMode as any)?.preferredTravelMode || 'any',
        travelDocuments: transformTravelDocuments(formData.travelDocuments),
        emergencyContact: formData.emergencyContact
      };
      
      console.log('Prepared onboarding data:', onboardingData);
      console.log('About to call realApiService.completeOnboarding...');
      
      // Send onboarding data to backend
      const response = await realApiService.completeOnboarding(onboardingData);
      console.log('Backend response received:', response);
      
      // Clear timeout since we got a response
      clearTimeout(timeoutId);
      
      if (response.success) {
        console.log('Onboarding successful, updating user data...');
        // Update local state with user data from backend
        const userData = {
          id: response.data.user.id,
          email: response.data.user.email,
          fullName: response.data.user.fullName,
          isOnboarded: response.data.user.isOnboarded
        };

        dispatch({ type: 'SET_USER', payload: userData as any });
        console.log('User data dispatched, userData:', userData);
        
        // Save family members to backend if any
        if (familyMembers.length > 0) {
          console.log('Saving family members to backend...');
          try {
            await realApiService.addFamilyMembers(userData.id, familyMembers);
            dispatch({ type: 'SET_FAMILY_MEMBERS', payload: familyMembers });
            toast.success('Family members saved successfully!');
            console.log('Family members saved successfully');
          } catch (error: any) {
            console.error('Failed to save family members:', error);
            toast.warning('Onboarding completed but failed to save family members');
          }
        }
        
        toast.success('Onboarding completed successfully!');
        console.log('Navigating to chat page...');
        navigate('/chat');
      }
    } catch (error: any) {
      console.error('Onboarding error:', error);
      clearTimeout(timeoutId);
      toast.error(error.message || 'Failed to complete onboarding');
    } finally {
      console.log('Setting isSubmitting to false');
      setIsSubmitting(false);
    }
  };

  const handleSkipFamilyMembers = async () => {
    try {
      setIsSubmitting(true);
      
      // Prepare onboarding data
      const onboardingData = {
        fullName: (formData.basicDetails as any)?.fullName || '',
        dateOfBirth: (formData.basicDetails as any)?.dateOfBirth || '',
        gender: (formData.basicDetails as any)?.gender || '',
        nationality: (formData.basicDetails as any)?.nationality || '',
        language: (formData.basicDetails as any)?.language || '',
        contact: (formData.basicDetails as any)?.contact || '',
        preferredTravelMode: (formData.travelMode as any)?.preferredTravelMode || 'any',
        travelDocuments: transformTravelDocuments(formData.travelDocuments),
        emergencyContact: formData.emergencyContact
      };

      // Send onboarding data to backend
      const response = await realApiService.completeOnboarding(onboardingData);
      
      if (response.success) {
        // Update local state with user data from backend
        const User = response.data.user;
        const userData = {
          id: User.id,
          email: User.email,
          fullName: User.fullName,
          isOnboarded: User.isOnboarded
        };

        dispatch({ type: 'SET_USER', payload: userData as any });
        
        toast.success('Onboarding completed successfully!');
        navigate('/chat');
      }
    } catch (error: any) {
      console.error('Onboarding error:', error);
      toast.error(error.message || 'Failed to complete onboarding');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showFamilyOnboarding) {
    return (
      <FamilyMemberOnboarding 
        onComplete={handleFamilyMembersComplete}
        onSkip={handleSkipFamilyMembers}
        isSubmitting={isSubmitting}
      />
    );
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <BasicDetailsForm 
            data={formData.basicDetails}
            onUpdate={(data) => updateFormData('basicDetails', data)}
          />
        );
      case 2:
        return (
          <TravelModeForm 
            data={formData.travelMode}
            onUpdate={(data) => updateFormData('travelMode', data)}
          />
        );
      case 3:
        return (
          <TravelDocumentsForm 
            data={formData.travelDocuments}
            travelMode={formData.travelMode as any}
            onUpdate={(data) => updateFormData('travelDocuments', data)}
          />
        );
      case 4:
        return (
          <EmergencyContactForm 
            data={formData.emergencyContact}
            onUpdate={(data) => updateFormData('emergencyContact', data)}
          />
        );
      case 5:
        return (
          <ConsentForm 
            data={formData.consent}
            onUpdate={(data) => updateFormData('consent', data)}
          />
        );
      default:
        return null;
    }
  };

  const stepTitles = [
    'Basic Details',
    'Travel Preferences',
    'Travel Documents',
    'Emergency Contact',
    'Terms & Consent'
  ];

  const handleComplete = () => {
    handleMainOnboardingComplete();
  };

  return (
    <div className="min-h-screen bg-hero-gradient flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-gradient-to-br from-travel-sky/20 via-transparent to-travel-ocean/20"></div>
      
      <div className="relative z-10 w-full max-w-2xl">
        <Card className="travel-card">
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="ghost"
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className="hover:bg-white/10"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <span className="text-sm text-muted-foreground">
                Step {currentStep} of {totalSteps}
              </span>
            </div>
            <Progress value={progress} className="mb-4" />
            <CardTitle className="text-2xl text-center">
              {stepTitles[currentStep - 1]}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderStep()}
            <div className="flex justify-end mt-8">
              <Button
                onClick={handleNext}
                className="btn-travel"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Processing...' : (currentStep === totalSteps ? 'Complete Setup' : 'Continue')}
                {!isSubmitting && <ArrowRight className="w-4 h-4 ml-2" />}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OnboardingPage;
