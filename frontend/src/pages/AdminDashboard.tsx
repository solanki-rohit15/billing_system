import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Users, FileText, CheckCircle, Clock, Download, UserPlus, IndianRupee, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { facultyAPI, billsAPI } from '../services/api';
import { FacultyDetails, BillEntry } from '../types/billing';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [faculties, setFaculties] = useState<FacultyDetails[]>([]);
  const [bills, setBills] = useState<BillEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddFaculty, setShowAddFaculty] = useState(false);
  
  // ✅ SINGLE facultyForm declaration with email field
  const [facultyForm, setFacultyForm] = useState({
    uid: '',
    name: '',
    email: '',  // ✅ Email field included
    phone: '',
    isUgcNetQualified: false
  });

  useEffect(() => {
    const adminData = localStorage.getItem("admin");
    if (!adminData) {
      navigate("/login");
      return;
    }
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const facultyData = await facultyAPI.getAll();
      console.log("loadData Received:", facultyData);
      setFaculties(facultyData);
      
      const billsData = await billsAPI.getAll();
      setBills(billsData);
    } catch (error) {
      console.error("Load error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin');
    navigate('/login');
  };

  // ✅ Add faculty with email validation
  const handleAddFaculty = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate email
    if (!facultyForm.email.includes('@')) {
      toast.error('Invalid email address');
      return;
    }
    
    setLoading(true);
    
    try {
      await facultyAPI.create(facultyForm);
      toast.success('Faculty created! Welcome email sent.');
      setShowAddFaculty(false);
      setFacultyForm({ uid: '', name: '', email: '', phone: '', isUgcNetQualified: false });
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add faculty');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBillStatus = async (billId: string, status: string) => {
    try {
      await billsAPI.updateStatus(billId, status);
      toast.success(`Bill ${status} successfully!`);
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update bill status');
    }
  };

  // ✅ Delete faculty with string ID
  const handleDeleteFaculty = async (id: string) => {
    if (!confirm('Are you sure you want to delete this faculty?')) return;
    
    try {
      await facultyAPI.delete(id);
      toast.success('Faculty deleted successfully!');
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete faculty');
    }
  };

  // ✅ Toggle UGC status with string ID
  const handleToggleUgcStatus = async (id: string, currentStatus: boolean) => {
    try {
      await facultyAPI.updateUgcStatus(id, !currentStatus);
      toast.success('UGC status updated!');
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update UGC status');
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

  const stats = {
    totalFaculty: faculties.length,
    totalBills: bills.length,
    pendingBills: bills.filter(b => b.status === 'pending').length,
    totalDisbursement: bills.filter(b => b.status === 'paid').reduce((sum, b) => sum + (b.netAmount || 0), 0)
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">DAVV Faculty Billing Management</p>
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
                  <p className="text-sm text-muted-foreground">Total Faculty</p>
                  <p className="text-2xl font-bold text-foreground">{stats.totalFaculty}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Bills</p>
                  <p className="text-2xl font-bold text-foreground">{stats.totalBills}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <FileText className="w-6 h-6 text-purple-600" />
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
                  <p className="text-sm text-muted-foreground">Total Disbursed</p>
                  <p className="text-2xl font-bold text-foreground">₹{stats.totalDisbursement.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <IndianRupee className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="bills" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="bills">Bills Management</TabsTrigger>
            <TabsTrigger value="faculty">Faculty Management</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          {/* Bills Tab */}
          <TabsContent value="bills" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>All Bills</CardTitle>
                    <CardDescription>Review and approve faculty bills</CardDescription>
                  </div>
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export Excel
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {bills.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No bills submitted yet</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Bill ID</TableHead>
                          <TableHead>Faculty</TableHead>
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
                                <p className="font-medium">{bill.facultyName}</p>
                                <Badge variant={bill.isUgcNetQualified ? "default" : "secondary"} className="text-xs">
                                  {bill.isUgcNetQualified ? 'UGC NET' : 'Non-UGC'}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">{bill.subject}</p>
                                <p className="text-xs text-muted-foreground">{bill.program} • {bill.subjectType}</p>
                              </div>
                            </TableCell>
                            <TableCell>{bill.month} {bill.year}</TableCell>
                            <TableCell>{bill.totalHours} hrs</TableCell>
                            <TableCell>
                              <div>
                                <p className="font-semibold">₹{bill.totalAmount?.toLocaleString()}</p>
                                <p className="text-xs text-muted-foreground">Net: ₹{bill.netAmount?.toLocaleString()}</p>
                              </div>
                            </TableCell>
                            <TableCell>{getStatusBadge(bill.status)}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                {bill.status === 'pending' && (
                                  <Button
                                    size="sm"
                                    onClick={() => handleUpdateBillStatus(bill.id, 'approved')}
                                  >
                                    Approve
                                  </Button>
                                )}
                                {bill.status === 'approved' && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="bg-green-50"
                                    onClick={() => handleUpdateBillStatus(bill.id, 'paid')}
                                  >
                                    Mark Paid
                                  </Button>
                                )}
                                <Button size="sm" variant="outline">
                                  <Download className="w-3 h-3" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Faculty Tab */}
          <TabsContent value="faculty" className="space-y-4">
            {!showAddFaculty && (
              <Button onClick={() => setShowAddFaculty(true)}>
                <UserPlus className="w-4 h-4 mr-2" />
                Add New Faculty
              </Button>
            )}

            {showAddFaculty && (
              <Card>
                <CardHeader>
                  <CardTitle>Add New Faculty</CardTitle>
                  <CardDescription>Register a new visiting faculty member</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddFaculty} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="uid">UID *</Label>
                        <Input
                          id="uid"
                          value={facultyForm.uid}
                          onChange={(e) => setFacultyForm({ ...facultyForm, uid: e.target.value.toUpperCase() })}
                          placeholder="e.g., VF2024001"
                          required
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          value={facultyForm.name}
                          onChange={(e) => setFacultyForm({ ...facultyForm, name: e.target.value })}
                          placeholder="e.g., Dr. Rajesh Kumar"
                          required
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={facultyForm.email}
                          onChange={(e) => setFacultyForm({ ...facultyForm, email: e.target.value })}
                          placeholder="faculty@example.com"
                          required
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input
                          id="phone"
                          value={facultyForm.phone}
                          onChange={(e) => setFacultyForm({ ...facultyForm, phone: e.target.value })}
                          placeholder="10-digit number"
                          required
                          className="mt-2"
                        />
                      </div>
                      <div className="flex items-center gap-2 mt-8">
                        <input
                          type="checkbox"
                          id="isUgcNetQualified"
                          checked={facultyForm.isUgcNetQualified}
                          onChange={(e) => setFacultyForm({ ...facultyForm, isUgcNetQualified: e.target.checked })}
                          className="w-4 h-4"
                        />
                        <Label htmlFor="isUgcNetQualified">UGC NET Qualified</Label>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Button type="button" variant="outline" onClick={() => setShowAddFaculty(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={loading}>
                        {loading ? 'Adding...' : 'Add Faculty'}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>All Faculty Members</CardTitle>
                <CardDescription>Manage visiting faculty accounts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>UID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>UGC NET</TableHead>
                        <TableHead>Bank Details</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {faculties.map((faculty) => (
                        <TableRow key={faculty.id}>
                          <TableCell className="font-mono">{faculty.uid}</TableCell>
                          <TableCell className="font-medium">{faculty.name}</TableCell>
                          <TableCell>{faculty.email}</TableCell>
                          <TableCell>{faculty.phone}</TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant={faculty.isUgcNetQualified ? "default" : "outline"}
                              onClick={() => handleToggleUgcStatus(faculty.id, faculty.isUgcNetQualified)}
                            >
                              {faculty.isUgcNetQualified ? 'UGC NET' : 'Non-UGC'}
                            </Button>
                          </TableCell>
                          <TableCell>
                            <Badge variant={faculty.bankDetailsCompleted ? "default" : "secondary"}>
                              {faculty.bankDetailsCompleted ? 'Complete' : 'Pending'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteFaculty(faculty.id)}
                            >
                              Delete
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Export Bills</CardTitle>
                  <CardDescription>Download bills in DAVV format</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full" variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Download All Bills (Excel)
                  </Button>
                  <Button className="w-full" variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Download Monthly Summary
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Personal Summary</CardTitle>
                  <CardDescription>Export honorarium summary</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="startMonth">Start Month</Label>
                      <select className="mt-2 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                        <option>January</option>
                        <option>February</option>
                        <option>March</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="endMonth">End Month</Label>
                      <select className="mt-2 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                        <option>May</option>
                        <option>June</option>
                        <option>July</option>
                      </select>
                    </div>
                  </div>
                  <Button className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    Download Personal Summary
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Statistics Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">This Month</p>
                    <p className="text-2xl font-bold">
                      ₹{bills.filter(b => new Date(b.createdAt).getMonth() === new Date().getMonth()).reduce((sum, b) => sum + b.totalAmount, 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Pending Approval</p>
                    <p className="text-2xl font-bold">
                      ₹{bills.filter(b => b.status === 'pending').reduce((sum, b) => sum + b.totalAmount, 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Total Hours (All Time)</p>
                    <p className="text-2xl font-bold">
                      {bills.reduce((sum, b) => sum + b.totalHours, 0)} hrs
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
