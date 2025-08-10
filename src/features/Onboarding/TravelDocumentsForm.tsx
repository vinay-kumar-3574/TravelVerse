
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TravelDocumentsFormProps {
  data: any;
  travelMode: any;
  onUpdate: (data: any) => void;
}

export const TravelDocumentsForm: React.FC<TravelDocumentsFormProps> = ({ data, travelMode, onUpdate }) => {
  const handleChange = (field: string, value: any) => {
    onUpdate({ ...data, [field]: value });
  };

  const showPassport = travelMode?.preferredTravelMode === 'flight' || travelMode?.preferredTravelMode === 'any';
  const showGovernmentId = travelMode?.preferredTravelMode === 'train' || travelMode?.preferredTravelMode === 'bus' || travelMode?.preferredTravelMode === 'any';

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Travel Documents</h3>
        <p className="text-muted-foreground">
          Please provide your travel document information
        </p>
      </div>

      {showPassport && (
        <div className="space-y-4">
          <h4 className="font-semibold text-primary">Passport Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="passportNumber">Passport Number</Label>
              <Input
                id="passportNumber"
                value={data.passportNumber || ''}
                onChange={(e) => handleChange('passportNumber', e.target.value)}
                placeholder="Enter passport number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="passportExpiry">Passport Expiry</Label>
              <Input
                id="passportExpiry"
                type="date"
                value={data.passportExpiry || ''}
                onChange={(e) => handleChange('passportExpiry', e.target.value)}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="passportIssuingCountry">Issuing Country</Label>
            <Input
              id="passportIssuingCountry"
              value={data.passportIssuingCountry || ''}
              onChange={(e) => handleChange('passportIssuingCountry', e.target.value)}
              placeholder="Enter issuing country"
            />
          </div>
          
          <div className="space-y-2">
            <Label>Visa Status</Label>
            <Select value={data.visaStatus || ''} onValueChange={(value) => handleChange('visaStatus', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select visa status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="not-required">Not Required</SelectItem>
                <SelectItem value="valid">Valid Visa</SelectItem>
                <SelectItem value="apply">Need to Apply</SelectItem>
                <SelectItem value="on-arrival">Visa on Arrival</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {showGovernmentId && (
        <div className="space-y-4">
          <h4 className="font-semibold text-primary">Government ID</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>ID Type</Label>
              <Select value={data.idType || ''} onValueChange={(value) => handleChange('idType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select ID type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aadhar">Aadhar Card</SelectItem>
                  <SelectItem value="driving-license">Driving License</SelectItem>
                  <SelectItem value="voter-id">Voter ID</SelectItem>
                  <SelectItem value="pan">PAN Card</SelectItem>
                  <SelectItem value="national-id">National ID</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="idNumber">ID Number</Label>
              <Input
                id="idNumber"
                value={data.idNumber || ''}
                onChange={(e) => handleChange('idNumber', e.target.value)}
                placeholder="Enter ID number"
              />
            </div>
          </div>
        </div>
      )}

      {(travelMode?.preferredTravelMode === 'train' || travelMode?.preferredTravelMode === 'any') && (
        <div className="space-y-4">
          <h4 className="font-semibold text-primary">Train Travel Preferences</h4>
          <div className="space-y-2">
            <Label>Passenger Type</Label>
            <Select value={data.passengerType || ''} onValueChange={(value) => handleChange('passengerType', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select passenger type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="senior-citizen">Senior Citizen</SelectItem>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="military">Military Personnel</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  );
};
