import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Plus, Download, FileText, Clock, CheckCircle, AlertCircle, IndianRupee } from 'lucide-react';
import toast from 'react-hot-toast';
import { billsAPI } from '../services/api';
import { BillEntry, getSubjectRates } from '../types/billing';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

export default function FacultyDashboard() {
  const navigate = useNavigate();
  const [faculty, setFaculty] = useState<any>(null);
  const [bills, setBills] = useState<BillEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [showBillForm, setShowBillForm] = useState(false);
  const [billForm, setBillForm] = useState({
    program: '',
    department: '',
    semester: '',
    subject: '',
    subjectType: 'theory' as 'theory' | 'practical' | 'lab',
    month: '',
    year: new Date().getFullYear(),
    dates: '',
    hours: 0,
    pageNo: '',
    perWeek: '',
    className: ''
  });

  useEffect(() => {
    const facultyData = localStorage.getItem('faculty');
    if (!facultyData) {
      navigate('/login');
      return;
    }
    
    const parsedFaculty = JSON.parse(facultyData);
    setFaculty(parsedFaculty);
    
    if (!parsedFaculty.bankDetailsCompleted) {
      navigate('/bank-details');
      return;
    }
    
    loadBills(parsedFaculty.id);
  }, [navigate]);

  const loadBills = async (facultyId: string) => {
    try {
      const data = await billsAPI.getByFacultyId(facultyId);
      setBills(data);
    } catch (error) {
      console.error('Error loading bills:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('faculty');
    navigate('/login');
  };

  const handleBillFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setBillForm({ ...billForm, [e.target.name]: e.target.value });
  };

  const handleSubmitBill = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!billForm.program || !billForm.subject || !billForm.month || !billForm.hours) {
      toast.error('Please fill all required fields');
      return;
    }

    setLoading(true);
    
    try {
      const rates = getSubjectRates(faculty.isUgcNetQualified);
      const rate = rates[billForm.subjectType];
      const totalAmount = billForm.hours * rate;
      const taxDeduction = Math.round(totalAmount * 0.10);
      
      const billData = {
        facultyId: faculty.uid,
        facultyName: faculty.name,
        program: billForm.program,
        department: billForm.department,
        semester: billForm.semester,
        subject: billForm.subject,
        subjectType: billForm.subjectType,
        month: billForm.month,
        year: billForm.year,
        totalHours: billForm.hours,
        ratePerHour: rate,
        totalAmount: totalAmount,
        taxDeduction: taxDeduction,
        netAmount: totalAmount - taxDeduction,
        isUgcNetQualified: faculty.isUgcNetQualified,
        datesWithDuration: [{ date: billForm.dates, hours: billForm.hours }],
        status: 'pending' as const,
        createdAt: new Date(),
        pageNo: billForm.pageNo,
        perWeek: billForm.perWeek,
        className: billForm.className
      };
      
      await billsAPI.create(billData);
      toast.success('Bill submitted successfully!');
      setShowBillForm(false);
      setBillForm({
        program: '',
        department: '',
        semester: '',
        subject: '',
        subjectType: 'theory',
        month: '',
        year: new Date().getFullYear(),
        dates: '',
        hours: 0,
        pageNo: '',
        perWeek: '',
        className: ''
      });
      loadBills(faculty.id);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit bill');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge variant="default"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'paid':
        return <Badge className="bg-green-600"><CheckCircle className="w-3 h-3 mr-1" />Paid</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (!faculty) return null;

  const stats = {
    totalEarnings: bills.reduce((sum, bill) => sum + (bill.netAmount || 0), 0),
    pendingBills: bills.filter(b => b.status === 'pending').length,
    approvedBills: bills.filter(b => b.status === 'approved').length,
    totalHours: bills.reduce((sum, bill) => sum + bill.totalHours, 0)
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Faculty Dashboard</h1>
              <p className="text-sm text-muted-foreground">Welcome, {faculty.name},{faculty.uid}</p>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Earnings</p>
                  <p className="text-2xl font-bold text-foreground">₹{stats.totalEarnings.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <IndianRupee className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Bills</p>
                  <p className="text-2xl font-bold text-foreground">{stats.pendingBills}</p>
                </div>
                <div className="p-3 bg-amber-100 rounded-full">
                  <Clock className="w-6 h-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Approved Bills</p>
                  <p className="text-2xl font-bold text-foreground">{stats.approvedBills}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <CheckCircle className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Hours</p>
                  <p className="text-2xl font-bold text-foreground">{stats.totalHours}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <FileText className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Rate Info */}
        <Card className="border-primary/30">
          <CardHeader>
            <CardTitle className="text-lg">Your Rate Structure</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-3">
              <Badge variant={faculty.isUgcNetQualified ? "default" : "secondary"}>
                {faculty.isUgcNetQualified ? 'UGC NET Qualified' : 'Non-UGC NET'}
              </Badge>
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Theory</p>
                <p className="font-semibold text-lg">₹{getSubjectRates(faculty.isUgcNetQualified).theory}/hr</p>
              </div>
              <div>
                <p className="text-muted-foreground">Practical</p>
                <p className="font-semibold text-lg">₹{getSubjectRates(faculty.isUgcNetQualified).practical}/hr</p>
              </div>
              <div>
                <p className="text-muted-foreground">Lab</p>
                <p className="font-semibold text-lg">₹{getSubjectRates(faculty.isUgcNetQualified).lab}/hr</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Bill Button */}
        {!showBillForm && (
          <Button onClick={() => setShowBillForm(true)} size="lg" className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Submit New Bill
          </Button>
        )}

        {/* Bill Form */}
        {showBillForm && (
          <Card>
            <CardHeader>
              <CardTitle>Submit New Bill</CardTitle>
              <CardDescription>Fill in the details for your teaching hours</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitBill} className="space-y-4">
                <input type="hidden" name="facultyUid" value={faculty.uid} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="program">Program *</Label>
                    <Input
                      id="program"
                      name="program"
                      placeholder="e.g., B.Tech"
                      value={billForm.program}
                      onChange={handleBillFormChange}
                      required
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      name="department"
                      placeholder="e.g., Computer Science"
                      value={billForm.department}
                      onChange={handleBillFormChange}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="semester">Semester</Label>
                    <Input
                      id="semester"
                      name="semester"
                      placeholder="e.g., III"
                      value={billForm.semester}
                      onChange={handleBillFormChange}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="subject">Subject *</Label>
                    <Input
                      id="subject"
                      name="subject"
                      placeholder="e.g., Data Structures"
                      value={billForm.subject}
                      onChange={handleBillFormChange}
                      required
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="subjectType">Subject Type *</Label>
                    <select
                      id="subjectType"
                      name="subjectType"
                      value={billForm.subjectType}
                      onChange={handleBillFormChange}
                      required
                      className="mt-2 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="theory">Theory</option>
                      <option value="practical">Practical</option>
                      <option value="lab">Lab</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="month">Month *</Label>
                    <select
                      id="month"
                      name="month"
                      value={billForm.month}
                      onChange={handleBillFormChange}
                      required
                      className="mt-2 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="">Select Month</option>
                      {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="year">Year</Label>
                    <Input
                      id="year"
                      name="year"
                      type="number"
                      value={billForm.year}
                      onChange={handleBillFormChange}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="hours">Total Hours *</Label>
                    <Input
                      id="hours"
                      name="hours"
                      type="number"
                      placeholder="e.g., 20"
                      value={billForm.hours || ''}
                      onChange={handleBillFormChange}
                      required
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="dates">Dates</Label>
                    <Input
                      id="dates"
                      name="dates"
                      placeholder="e.g., 1st, 2nd, 3rd"
                      value={billForm.dates}
                      onChange={handleBillFormChange}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="perWeek">Per Week</Label>
                    <Input
                      id="perWeek"
                      name="perWeek"
                      placeholder="e.g., 3 lectures"
                      value={billForm.perWeek}
                      onChange={handleBillFormChange}
                      className="mt-2"
                    />
                  </div>
                </div>

                {billForm.hours > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-900">
                      Rate: ₹{getSubjectRates(faculty.isUgcNetQualified)[billForm.subjectType]}/hr × {billForm.hours} hours = 
                      <span className="font-bold"> ₹{(getSubjectRates(faculty.isUgcNetQualified)[billForm.subjectType] * billForm.hours).toLocaleString()}</span>
                    </p>
                    <p className="text-xs text-blue-800 mt-1">
                      After 10% tax deduction: ₹{((getSubjectRates(faculty.isUgcNetQualified)[billForm.subjectType] * billForm.hours) * 0.9).toLocaleString()}
                    </p>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={() => setShowBillForm(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1" disabled={loading}>
                    {loading ? 'Submitting...' : 'Submit Bill'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Bills Table */}
        <Card>
          <CardHeader>
            <CardTitle>My Bills</CardTitle>
            <CardDescription>All your submitted bills and their status</CardDescription>
          </CardHeader>
          <CardContent>
            {bills.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No bills submitted yet</p>
                <Button className="mt-4" onClick={() => setShowBillForm(true)}>
                  Submit Your First Bill
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Bill ID</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Month/Year</TableHead>
                      <TableHead>Hours</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bills.map((bill) => (
                      <TableRow key={bill.id}>
                        <TableCell className="font-mono text-sm">{bill.billId}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{bill.subject}</p>
                            <p className="text-xs text-muted-foreground">{bill.program} • {bill.subjectType}</p>
                          </div>
                        </TableCell>
                        <TableCell>{bill.month} {bill.year}</TableCell>
                        <TableCell>{bill.totalHours}</TableCell>
                        <TableCell className="font-semibold">₹{bill.totalAmount?.toLocaleString()}</TableCell>
                        <TableCell>{getStatusBadge(bill.status)}</TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline">
                            <Download className="w-3 h-3 mr-1" />
                            PDF
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
