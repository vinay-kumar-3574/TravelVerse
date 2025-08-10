import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { hybridService } from '@/api/hybridService';

const ApiStatus = () => {
  const [status, setStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<string>('');

  useEffect(() => {
    // Get initial service status
    setStatus(hybridService.getServiceStatus());
  }, []);

  const testApiConnection = async () => {
    setIsLoading(true);
    setTestResult('');
    
    try {
      // Test real API connection
      const result = await hybridService.getTrips();
      setTestResult(`✅ API Test Successful: ${result.data?.trips?.length || 0} trips found`);
    } catch (error) {
      setTestResult(`❌ API Test Failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testMockData = async () => {
    setIsLoading(true);
    setTestResult('');
    
    try {
      // Test mock data
      const result = await hybridService.chatResponse('Hello, how can you help me plan a trip?');
      setTestResult(`✅ Mock Test Successful: ${result.substring(0, 50)}...`);
    } catch (error) {
      setTestResult(`❌ Mock Test Failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!status) return null;

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🔀 API Service Status
        </CardTitle>
        <CardDescription>
          Current service configuration and connection status
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span>Mock Data:</span>
            <Badge variant={status.mockData ? "default" : "secondary"}>
              {status.mockData ? "Enabled" : "Disabled"}
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span>Real API:</span>
            <Badge variant={status.realAPI ? "default" : "secondary"}>
              {status.realAPI ? "Enabled" : "Disabled"}
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span>Backend Connected:</span>
            <Badge variant={status.backendConnected ? "default" : "secondary"}>
              {status.backendConnected ? "Yes" : "No"}
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span>Prototype Mode:</span>
            <Badge variant={status.prototypeMode ? "default" : "secondary"}>
              {status.prototypeMode ? "Active" : "Inactive"}
            </Badge>
          </div>
        </div>

        <div className="space-y-2">
          <Button 
            onClick={testApiConnection} 
            disabled={isLoading}
            className="w-full"
            variant="outline"
          >
            {isLoading ? 'Testing...' : 'Test Real API Connection'}
          </Button>
          
          <Button 
            onClick={testMockData} 
            disabled={isLoading}
            className="w-full"
            variant="outline"
          >
            {isLoading ? 'Testing...' : 'Test Mock Data Service'}
          </Button>
        </div>

        {testResult && (
          <div className="p-3 bg-muted rounded-md">
            <p className="text-sm">{testResult}</p>
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          <p>• Mock data always works for prototype demonstrations</p>
          <p>• Real API connects to backend when available</p>
          <p>• Automatic fallback ensures app always works</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ApiStatus;
