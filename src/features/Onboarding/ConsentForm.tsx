
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface ConsentFormProps {
  data: boolean;
  onUpdate: (data: boolean) => void;
}

export const ConsentForm: React.FC<ConsentFormProps> = ({ data, onUpdate }) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Terms & Consent</h3>
        <p className="text-muted-foreground">
          Please review and accept our terms to complete your registration
        </p>
      </div>

      <div className="space-y-4">
        <div className="p-4 bg-muted rounded-lg">
          <h4 className="font-semibold mb-2">Terms of Service</h4>
          <div className="text-sm text-muted-foreground space-y-2">
            <p>• We will use your information to provide personalized travel recommendations</p>
            <p>• Your travel documents are encrypted and stored securely</p>
            <p>• We may share anonymous usage data to improve our services</p>
            <p>• You can delete your account and data at any time</p>
            <p>• Emergency contact information is only used in case of emergencies</p>
          </div>
        </div>

        <div className="p-4 bg-muted rounded-lg">
          <h4 className="font-semibold mb-2">Privacy Policy</h4>
          <div className="text-sm text-muted-foreground space-y-2">
            <p>• We respect your privacy and follow GDPR guidelines</p>
            <p>• Your personal data is never sold to third parties</p>
            <p>• AI recommendations are generated using anonymized data</p>
            <p>• You have full control over your data sharing preferences</p>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <Checkbox
            id="consent"
            checked={data}
            onCheckedChange={(checked) => onUpdate(checked as boolean)}
          />
          <Label
            htmlFor="consent"
            className="text-sm leading-relaxed cursor-pointer"
          >
            I have read and agree to the Terms of Service and Privacy Policy. 
            I consent to the processing of my personal data as described above and 
            understand that I can withdraw this consent at any time.
          </Label>
        </div>
      </div>
    </div>
  );
};
