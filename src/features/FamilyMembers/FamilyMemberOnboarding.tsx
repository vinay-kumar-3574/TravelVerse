
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, ArrowRight, Plus, Minus } from 'lucide-react';
import { BasicDetailsForm } from '@/features/Onboarding/BasicDetailsForm';
import { TravelDocumentsForm } from '@/features/Onboarding/TravelDocumentsForm';
import { toast } from 'sonner';

interface FamilyMemberData {
  id: string;
  fullName: string;
  dateOfBirth: string;
  gender: string;
  nationality: string;
  language: string;
  contact: string;
  relationship: string;
  travelDocuments: any;
}

interface FamilyMemberOnboardingProps {
  onComplete: (members: FamilyMemberData[]) => void;
  onSkip: () => void;
  isSubmitting?: boolean;
}

export const FamilyMemberOnboarding: React.FC<FamilyMemberOnboardingProps> = ({ onComplete, onSkip, isSubmitting = false }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [memberCount, setMemberCount] = useState(1);
  const [currentMemberIndex, setCurrentMemberIndex] = useState(0);
  const [familyMembers, setFamilyMembers] = useState<FamilyMemberData[]>([]);
  const [currentMemberData, setCurrentMemberData] = useState<FamilyMemberData>({
    id: `temp-${Date.now()}`,
    fullName: '',
    dateOfBirth: '',
    gender: '',
    nationality: '',
    language: '',
    contact: '',
    relationship: '',
    travelDocuments: {}
  });

  const totalSteps = 2;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const handleCountSubmit = () => {
    if (memberCount < 1) {
      toast.error('Please enter a valid number of family members');
      return;
    }
    setCurrentStep(1);
  };

  const handleMemberDataUpdate = (field: string, data: any) => {
    console.log('handleMemberDataUpdate called with field:', field, 'data:', data);
    
    if (field === 'basicDetails') {
      setCurrentMemberData(prev => {
        const updated = { ...prev, ...data };
        console.log('Updated basic details:', updated);
        return updated;
      });
    } else if (field === 'travelDocuments') {
      setCurrentMemberData(prev => {
        const updated = { ...prev, travelDocuments: data };
        console.log('Updated travel documents:', updated);
        return updated;
      });
    } else {
      setCurrentMemberData(prev => {
        const updated = { ...prev, [field]: data };
        console.log('Updated field:', field, 'value:', data, 'result:', updated);
        return updated;
      });
    }
  };

  const handleNextMember = async () => {
    console.log('handleNextMember called with currentMemberData:', currentMemberData);
    console.log('currentMemberIndex:', currentMemberIndex, 'memberCount:', memberCount);
    
    // Validate current member data before proceeding
    if (!validateCurrentMember()) {
      console.log('Validation failed');
      return;
    }

    console.log('Validation passed, proceeding...');

    if (currentMemberIndex < memberCount - 1) {
      // Save current member and move to next
      const updatedMembers = [...familyMembers];
      updatedMembers[currentMemberIndex] = { ...currentMemberData };
      setFamilyMembers(updatedMembers);
      
      console.log('Moving to next member, updated members:', updatedMembers);
      
      // Move to next member
      setCurrentMemberIndex(currentMemberIndex + 1);
      setCurrentMemberData({
        id: `temp-${Date.now()}`,
        fullName: '',
        dateOfBirth: '',
        gender: '',
        nationality: '',
        language: '',
        contact: '',
        relationship: '',
        travelDocuments: {}
      });
    } else {
      // Complete onboarding - Fix: properly construct the final array
      console.log('=== COMPLETING FAMILY MEMBER ONBOARDING ===');
      console.log('Current familyMembers array:', familyMembers);
      console.log('Current member index:', currentMemberIndex);
      console.log('Current member data:', currentMemberData);
      
      const finalMembers = [...familyMembers];
      finalMembers[currentMemberIndex] = { ...currentMemberData };
      
      // Filter out any undefined or empty entries
      const cleanMembers = finalMembers.filter(member => 
        member && member.fullName && member.relationship
      );
      
      console.log('Final clean members array:', cleanMembers);
      console.log('About to call onComplete...');
      
      try {
        // Call onComplete with the family members data and await it
        console.log('Calling onComplete with members:', cleanMembers);
        await onComplete(cleanMembers);
        console.log('onComplete completed successfully');
        
      } catch (error) {
        console.error('Error calling onComplete:', error);
        toast.error('Failed to complete family member onboarding');
      }
    }
  };

  const validateCurrentMember = () => {
    console.log('Validating current member:', currentMemberData);
    
    // Validate basic details
    if (!currentMemberData.relationship || !currentMemberData.fullName || 
        !currentMemberData.dateOfBirth || !currentMemberData.gender || 
        !currentMemberData.nationality || !currentMemberData.language || 
        !currentMemberData.contact) {
      console.log('Basic details validation failed');
      console.log('Missing fields:', {
        relationship: !currentMemberData.relationship,
        fullName: !currentMemberData.fullName,
        dateOfBirth: !currentMemberData.dateOfBirth,
        gender: !currentMemberData.gender,
        nationality: !currentMemberData.nationality,
        language: !currentMemberData.language,
        contact: !currentMemberData.contact
      });
      toast.error('Please fill in all required fields for this family member');
      return false;
    }

    // Validate travel documents - make this more flexible
    const travelDocs = currentMemberData.travelDocuments || {};
    console.log('Travel documents to validate:', travelDocs);
    
    // Check if any travel documents are provided (optional)
    const hasAnyDocuments = Object.keys(travelDocs).length > 0 && 
      Object.values(travelDocs).some(value => value && value.toString().trim() !== '');
    
    if (hasAnyDocuments) {
      // If passport is provided, check if expiry date is also provided
      if (travelDocs.passportNumber && travelDocs.passportNumber.trim() !== '') {
        if (!travelDocs.passportExpiry || travelDocs.passportExpiry.trim() === '') {
          console.log('Passport expiry date missing');
          toast.error('Please provide passport expiry date for this family member');
          return false;
        }
      }
      
      // If government ID is provided, check if ID type is also selected
      if (travelDocs.idNumber && travelDocs.idNumber.trim() !== '') {
        if (!travelDocs.idType || travelDocs.idType.trim() === '') {
          console.log('Government ID type missing');
          toast.error('Please select an ID type for this family member');
          return false;
        }
      }
    }

    console.log('All validations passed');
    return true;
  };

  const renderStepContent = () => {
    if (currentStep === 0) {
      return (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold mb-2">Add Family Members</h3>
            <p className="text-muted-foreground">How many family members will be traveling with you?</p>
          </div>
          
          <div className="flex items-center justify-center space-x-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setMemberCount(Math.max(0, memberCount - 1))}
              disabled={memberCount <= 0}
            >
              <Minus className="w-4 h-4" />
            </Button>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{memberCount}</div>
              <div className="text-sm text-muted-foreground">Members</div>
            </div>
            
            <Button
              variant="outline"
              size="icon"
              onClick={() => setMemberCount(memberCount + 1)}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex justify-center space-x-4">
            <Button variant="outline" onClick={onSkip} disabled={isSubmitting}>
              Skip for Now
            </Button>
            <Button onClick={handleCountSubmit} className="btn-travel" disabled={isSubmitting}>
              Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold">
            Family Member {currentMemberIndex + 1} of {memberCount}
          </h3>
          <p className="text-muted-foreground">Please provide details for this family member</p>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="relationship">Relationship *</Label>
            <Input
              id="relationship"
              placeholder="e.g., Spouse, Child, Parent"
              value={currentMemberData.relationship}
              onChange={(e) => handleMemberDataUpdate('relationship', e.target.value)}
            />
          </div>

          <BasicDetailsForm 
            data={currentMemberData}
            onUpdate={(data) => {
              console.log('BasicDetailsForm onUpdate called with data:', data);
              // Update the current member data with the basic details
              setCurrentMemberData(prev => ({
                ...prev,
                ...data
              }));
            }}
          />

          <TravelDocumentsForm 
            data={currentMemberData.travelDocuments || {}}
            travelMode={{ preferredTravelMode: 'any' }}
            onUpdate={(data) => {
              console.log('TravelDocumentsForm onUpdate called with data:', data);
              handleMemberDataUpdate('travelDocuments', data);
            }}
          />
        </div>

        <div className="flex justify-end">
          <Button 
            onClick={async () => {
              console.log('Button clicked!');
              console.log('Current state:', { currentMemberIndex, memberCount, isSubmitting });
              console.log('Current member data:', currentMemberData);
              
              // Prevent multiple clicks while processing
              if (isSubmitting) {
                console.log('Already submitting, ignoring click');
                return;
              }
              
              await handleNextMember();
            }} 
            className="btn-travel" 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Processing...' : (currentMemberIndex + 1 >= memberCount ? 'Complete' : 'Next Member')}
            {!isSubmitting && <ArrowRight className="w-4 h-4 ml-2" />}
          </Button>
        </div>
        
        {/* Debug info */}
        <div className="mt-4 p-4 bg-muted/20 rounded-lg text-sm">
          <p><strong>Debug Info:</strong></p>
          <p>Current Member Index: {currentMemberIndex}</p>
          <p>Member Count: {memberCount}</p>
          <p>Is Submitting: {isSubmitting ? 'Yes' : 'No'}</p>
          <p>Relationship: {currentMemberData.relationship || 'Not set'}</p>
          <p>Full Name: {currentMemberData.fullName || 'Not set'}</p>
          <p>Date of Birth: {currentMemberData.dateOfBirth || 'Not set'}</p>
          <p>Gender: {currentMemberData.gender || 'Not set'}</p>
          <p>Nationality: {currentMemberData.nationality || 'Not set'}</p>
          <p>Language: {currentMemberData.language || 'Not set'}</p>
          <p>Contact: {currentMemberData.contact || 'Not set'}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <Card className="travel-card">
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="ghost"
                onClick={() => currentStep > 0 ? setCurrentStep(currentStep - 1) : onSkip()}
                className="hover:bg-white/10"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <span className="text-sm text-muted-foreground">
                Step {currentStep + 1} of {totalSteps}
              </span>
            </div>
            <Progress value={progress} className="mb-4" />
            <CardTitle className="text-2xl text-center">Family Members</CardTitle>
          </CardHeader>
          <CardContent>
            {renderStepContent()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
