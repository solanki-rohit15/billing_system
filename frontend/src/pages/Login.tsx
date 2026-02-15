import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Shield, ArrowRight, Mail, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { authAPI, facultyAPI } from '../services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

type FacultyLoginStep = 'uid' | 'otp';

export default function Login() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'faculty' | 'admin'>('faculty');
  const [facultyStep, setFacultyStep] = useState<FacultyLoginStep>('uid');
  const [loading, setLoading] = useState(false);
  
  // Faculty states
  const [facultyUID, setFacultyUID] = useState('');
  const [verifiedFaculty, setVerifiedFaculty] = useState<any>(null);
  const [otpValue, setOtpValue] = useState(['', '', '', '', '', '']);
  
  // Admin states
  const [adminForm, setAdminForm] = useState({ email: '', password: '' });

  // ✅ FACULTY LOGIN - Step 1: Enter UID
  const handleUIDSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const faculty = await facultyAPI.getByUid(facultyUID);
      setVerifiedFaculty(faculty);
      
      const result = await authAPI.sendOTP(facultyUID);
      
      if (result.success) {
        setFacultyStep('otp');
        toast.success(result.message || 'OTP sent to your email');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Invalid UID or failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleOTPChange = (index: number, value: string) => {
    if (value.length > 1) value = value[0];
    
    const newOTP = [...otpValue];
    newOTP[index] = value;
    setOtpValue(newOTP);
    
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  // ✅ FACULTY LOGIN - Step 2: Verify OTP
  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otp = otpValue.join('');
    
    if (otp.length !== 6) {
      toast.error('Please enter complete OTP');
      return;
    }
    
    setLoading(true);
    
    try {
      const result = await authAPI.verifyOTP(verifiedFaculty.uid, otp);
      if (result.success) {
        localStorage.setItem('faculty', JSON.stringify(result.faculty));
        toast.success('Login successful!');
        
        if (!result.faculty.bankDetailsCompleted) {
          navigate('/bank-details');
        } else {
          navigate('/faculty');
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  // ✅ ADMIN LOGIN - Real Backend Authentication
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!adminForm.email || !adminForm.password) {
      toast.error('Please enter email and password');
      return;
    }
    
    setLoading(true);
    
    try {
      // ✅ Call real backend API
      const response = await authAPI.adminLogin(adminForm.email, adminForm.password);
      
      if (response.success) {
        // Store admin data in localStorage
        localStorage.setItem('admin', JSON.stringify({
          id: response.id,
          email: response.email,
          name: response.name,
          role: response.role
        }));
        
        toast.success('Admin login successful!');
        navigate('/admin');
      } else {
        toast.error(response.message || 'Invalid credentials');
      }
    } catch (error: any) {
      console.error('Admin login error:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          'Invalid email or password';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-2">
            <GraduationCap className="w-10 h-10 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold">DAVV Billing Portal</CardTitle>
          <CardDescription>Visiting Faculty Billing Management</CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'faculty' | 'admin')}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="faculty" className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4" />
                Faculty
              </TabsTrigger>
              <TabsTrigger value="admin" className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Admin
              </TabsTrigger>
            </TabsList>

            {/* ===================== FACULTY LOGIN ===================== */}
            <TabsContent value="faculty" className="space-y-6">
              <div className="text-center mb-4">
                <h3 className="font-semibold text-lg">
                  {facultyStep === 'uid' ? 'Enter Your UID' : 'Verify OTP'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {facultyStep === 'uid' 
                    ? 'OTP will be sent to your registered email'
                    : 'Check your email for the OTP'}
                </p>
              </div>

              {facultyStep === 'uid' && (
                <form onSubmit={handleUIDSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="faculty-uid">University ID (UID)</Label>
                    <Input
                      id="faculty-uid"
                      type="text"
                      value={facultyUID}
                      onChange={(e) => setFacultyUID(e.target.value.toUpperCase())}
                      placeholder="Enter your UID (e.g., VF2024001)"
                      required
                      className="mt-2"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      Enter the UID provided by your institution
                    </p>
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Verifying & Sending OTP...' : (
                      <>
                        Continue <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </form>
              )}

              {facultyStep === 'otp' && (
                <form onSubmit={handleOTPSubmit} className="space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Faculty Details:</p>
                    <p className="font-semibold">{verifiedFaculty?.name}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      OTP sent to: {verifiedFaculty?.email}
                    </p>
                  </div>

                  <div>
                    <Label className="block text-center mb-4">Enter 6-digit OTP</Label>
                    <div className="flex gap-2 justify-center">
                      {[0, 1, 2, 3, 4, 5].map((index) => (
                        <Input
                          key={index}
                          id={`otp-${index}`}
                          type="text"
                          maxLength={1}
                          value={otpValue[index]}
                          onChange={(e) => handleOTPChange(index, e.target.value)}
                          className="w-12 h-14 text-center text-2xl font-bold"
                        />
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground text-center mt-3">
                      Didn't receive OTP? Check your spam folder
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {
                        setFacultyStep('uid');
                        setOtpValue(['', '', '', '', '', '']);
                      }}
                    >
                      Back
                    </Button>
                    <Button type="submit" className="flex-1" disabled={loading}>
                      {loading ? 'Verifying...' : 'Verify OTP'}
                    </Button>
                  </div>
                </form>
              )}
            </TabsContent>

            {/* ===================== ADMIN LOGIN ===================== */}
            <TabsContent value="admin" className="space-y-6">
              <div className="text-center mb-4">
                <h3 className="font-semibold text-lg">Admin Login</h3>
                <p className="text-sm text-muted-foreground">
                  Enter your credentials to access admin panel
                </p>
              </div>

              <form onSubmit={handleAdminLogin} className="space-y-6">
                <div>
                  <Label htmlFor="admin-email">Email Address</Label>
                  <div className="relative mt-2">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="admin-email"
                      type="email"
                      value={adminForm.email}
                      onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                      placeholder="admin@davv.ac.in"
                      required
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="admin-password">Password</Label>
                  <div className="relative mt-2">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="admin-password"
                      type="password"
                      value={adminForm.password}
                      onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                      placeholder="Enter password"
                      required
                      className="pl-10"
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Logging in...' : 'Login'}
                </Button>
              </form>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                <p className="text-xs text-blue-800">
                  <strong>Default Credentials:</strong><br/>
                  Email: admin@davv.ac.in<br/>
                  Password: admin123
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
