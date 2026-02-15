import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Save, User, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';
import { facultyAPI } from '../services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';

export default function BankDetailsSetup() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [faculty, setFaculty] = useState<any>(null);
  const [formData, setFormData] = useState({
    designation: '',
    qualification: '',
    address: '',
    bankName: '',
    bankAccountNumber: '',
    ifscCode: '',
    panNumber: '',
    aadharNumber: ''
  });

  useEffect(() => {
    const facultyData = localStorage.getItem('faculty');
    if (!facultyData) {
      navigate('/login');
      return;
    }
    
    const parsedFaculty = JSON.parse(facultyData);
    setFaculty(parsedFaculty);
    
    if (parsedFaculty.bankDetailsCompleted) {
      navigate('/faculty');
    }
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.bankName || !formData.bankAccountNumber || !formData.ifscCode) {
      toast.error('Please fill in all bank details');
      return;
    }
    
    if (!formData.panNumber || !formData.aadharNumber) {
      toast.error('Please fill in PAN and Aadhar numbers');
      return;
    }
    
    setLoading(true);
    
    try {
      await facultyAPI.updateBankDetails(faculty.id, formData);
      toast.success('Details saved successfully!');
      
      const updatedFaculty = { ...faculty, ...formData, bankDetailsCompleted: true };
      localStorage.setItem('faculty', JSON.stringify(updatedFaculty));
      
      navigate('/faculty');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save details');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('faculty');
    navigate('/login');
  };

  if (!faculty) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 mb-4">
            <CreditCard className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Complete Your Profile</h1>
          <p className="text-muted-foreground mt-2">
            Please provide your details for bill generation
          </p>
        </div>

        {/* Faculty Info Card */}
        <Card className="mb-6 border-primary/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/10">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground">{faculty.name}</p>
                <p className="text-sm text-muted-foreground">
                  UID: {faculty.uid} • Phone: {faculty.phone}
                </p>
              </div>
              <Badge variant={faculty.isUgcNetQualified ? "default" : "secondary"}>
                {faculty.isUgcNetQualified ? 'UGC NET' : 'Non-UGC NET'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Form Card */}
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle>Profile & Bank Details</CardTitle>
            <CardDescription>
              This information is required for generating bills and processing payments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Details */}
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground border-b pb-2">Personal Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="designation">Designation</Label>
                    <Input
                      id="designation"
                      name="designation"
                      placeholder="e.g., Assistant Professor"
                      value={formData.designation}
                      onChange={handleChange}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="qualification">Qualification</Label>
                    <Input
                      id="qualification"
                      name="qualification"
                      placeholder="e.g., M.Tech, Ph.D."
                      value={formData.qualification}
                      onChange={handleChange}
                      className="mt-2"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="address">Address</Label>
                    <textarea
                      id="address"
                      name="address"
                      placeholder="Enter your complete address"
                      value={formData.address}
                      onChange={handleChange}
                      rows={3}
                      className="mt-2 flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    />
                  </div>
                </div>
              </div>

              {/* Bank Details */}
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground border-b pb-2">
                  Bank Details (SBI Compulsory)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bankName">Bank Name *</Label>
                    <Input
                      id="bankName"
                      name="bankName"
                      placeholder="State Bank of India"
                      value={formData.bankName}
                      onChange={handleChange}
                      required
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="bankAccountNumber">Account Number *</Label>
                    <Input
                      id="bankAccountNumber"
                      name="bankAccountNumber"
                      placeholder="Enter account number"
                      value={formData.bankAccountNumber}
                      onChange={handleChange}
                      required
                      className="mt-2"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="ifscCode">IFSC Code *</Label>
                    <Input
                      id="ifscCode"
                      name="ifscCode"
                      placeholder="Enter IFSC code"
                      value={formData.ifscCode}
                      onChange={handleChange}
                      required
                      className="mt-2 uppercase"
                    />
                  </div>
                </div>
              </div>

              {/* ID Documents */}
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground border-b pb-2">
                  Identification Documents
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="panNumber">PAN Number *</Label>
                    <Input
                      id="panNumber"
                      name="panNumber"
                      placeholder="Enter PAN number"
                      value={formData.panNumber}
                      onChange={handleChange}
                      required
                      className="mt-2 uppercase"
                    />
                  </div>
                  <div>
                    <Label htmlFor="aadharNumber">Aadhar Number *</Label>
                    <Input
                      id="aadharNumber"
                      name="aadharNumber"
                      placeholder="Enter Aadhar number"
                      value={formData.aadharNumber}
                      onChange={handleChange}
                      required
                      className="mt-2"
                    />
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
                <Button type="submit" className="flex-1" size="lg" disabled={loading}>
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? 'Saving...' : 'Save & Continue'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
