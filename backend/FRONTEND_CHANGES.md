# 🎨 REQUIRED FRONTEND CHANGES

## ✅ **CHANGES NEEDED IN REACT FRONTEND**

---

## 🔄 **CHANGE 1: Update API Service**

### **File: `src/services/api.ts`**

#### **BEFORE:**
```typescript
export const facultyAPI = {
  getAll: async () => {
    const response = await api.get('/faculty');
    return (response.data || []).map((f: any) => ({
      id: Number(f.id),  // ❌ OLD: Converting to number
      // ...
    }));
  },
};
```

#### **AFTER:**
```typescript
export const facultyAPI = {
  getAll: async () => {
    const response = await api.get('/faculty');
    return (response.data || []).map((f: any) => ({
      id: f.id,  // ✅ NEW: Keep as string
      // ...
    }));
  },
};
```

### **Complete Updated API Service:**

```typescript
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8082/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// ============================================================================
// FACULTY API - Updated for String IDs
// ============================================================================

export const facultyAPI = {
  getAll: async () => {
    const { data } = await api.get('/faculty');
    return (data || []).map((f: any) => ({
      id: f.id,  // ✅ String ID
      uid: f.uid,
      name: f.name,
      email: f.email,  // ✅ NEW field
      phone: f.phone,
      isUgcNetQualified: f.isUgcNetQualified ?? false,
      isVerified: f.isVerified ?? false,
      bankDetailsCompleted: f.bankDetailsCompleted ?? false,
      createdAt: f.createdAt
    }));
  },

  getByUid: async (uid: string) => {
    const { data } = await api.get(`/faculty/uid/${uid}`);
    return {
      id: data.id,  // ✅ String ID
      uid: data.uid,
      name: data.name,
      email: data.email,  // ✅ NEW field
      phone: data.phone,
      // ... rest of fields
    };
  },

  create: async (faculty: any) => {
    const { data } = await api.post('/faculty', faculty);
    return {
      id: data.id,  // ✅ String ID
      // ... rest of response
    };
  },

  delete: async (id: string) => {  // ✅ String parameter
    await api.delete(`/faculty/${id}`);
  },
};

// ============================================================================
// OTP API - Updated for Email-based OTP
// ============================================================================

export const otpAPI = {
  // ✅ NEW: Only UID required (no phone, no name)
  sendOtp: async (uid: string) => {
    const { data } = await api.post('/auth/send-otp', { uid });
    return data;
  },

  // ✅ Verify OTP
  verifyOtp: async (uid: string, otp: string) => {
    const { data } = await api.post('/auth/verify-otp', { uid, otp });
    return data;
  },
};

// ============================================================================
// BILLS API - Updated for String IDs
// ============================================================================

export const billsAPI = {
  getAll: async () => {
    const { data } = await api.get('/bills');
    return (data || []).map((b: any) => ({
      id: b.id,  // ✅ String ID
      facultyId: b.facultyId,  // ✅ String ID
      // ... rest of fields
    }));
  },

  getByFacultyId: async (facultyId: string) => {  // ✅ String parameter
    const { data } = await api.get(`/bills/faculty/${facultyId}`);
    return data;
  },
};

export default api;
```

---

## 🎯 **CHANGE 2: Update TypeScript Types**

### **File: `src/types/billing.ts`**

#### **BEFORE:**
```typescript
export interface FacultyDetails {
  id: number;  // ❌ OLD
  uid: string;
  name: string;
  phone: string;
  // ...
}
```

#### **AFTER:**
```typescript
export interface FacultyDetails {
  id: string;  // ✅ NEW: String UUID
  uid: string;
  name: string;
  email: string;  // ✅ NEW: Email field
  phone: string;
  // ...
}

export interface BillEntry {
  id: string;  // ✅ String UUID
  billId: string;
  facultyId: string;  // ✅ String UUID
  facultyName: string;
  // ...
}
```

---

## 🔐 **CHANGE 3: Update Faculty Login Flow**

### **File: `src/pages/FacultyLogin.tsx`**

#### **OLD FLOW (Phone-based):**
```typescript
// Step 1: Enter UID + Name + Phone
const [formData, setFormData] = useState({
  uid: '',
  name: '',
  phone: ''  // ❌ OLD: Required phone
});

// Step 2: Send OTP
await otpAPI.sendOtp(formData.uid, formData.name, formData.phone);
```

#### **NEW FLOW (Email-based):**
```typescript
// Step 1: Enter UID only
const [uid, setUid] = useState('');

// Step 2: Verify UID and get faculty details
const facultyDetails = await facultyAPI.getByUid(uid);

// Step 3: Display faculty details (name, email masked)
<div>
  <p>Name: {facultyDetails.name}</p>
  <p>Email: {facultyDetails.email}</p>  {/* Shows: a***@example.com */}
</div>

// Step 4: Send OTP (automatically to email)
await otpAPI.sendOtp(uid);  // ✅ Only UID needed

// Step 5: User enters OTP
const otpInput = '123456';

// Step 6: Verify OTP
const response = await otpAPI.verifyOtp(uid, otpInput);

// Step 7: Check bank details
if (!response.faculty.bankDetailsCompleted) {
  navigate('/bank-details');
} else {
  navigate('/faculty-dashboard');
}
```

### **Complete New Login Component:**

```typescript
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { facultyAPI, otpAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function FacultyLogin() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [uid, setUid] = useState('');
  const [otp, setOtp] = useState('');
  const [faculty, setFaculty] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Step 1: Enter UID
  const handleUidSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Get faculty details by UID
      const facultyData = await facultyAPI.getByUid(uid);
      setFaculty(facultyData);
      
      // Send OTP to email
      const response = await otpAPI.sendOtp(uid);
      
      toast.success(response.message);  // "OTP sent to a***@example.com"
      setStep(2);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'UID not found');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await otpAPI.verifyOtp(uid, otp);
      
      // Store faculty info
      localStorage.setItem('facultyId', response.faculty.id);
      localStorage.setItem('facultyUid', response.faculty.uid);
      
      toast.success('Login successful!');

      // Check bank details
      if (!response.faculty.bankDetailsCompleted) {
        navigate('/bank-details');
      } else {
        navigate('/faculty-dashboard');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      {step === 1 ? (
        // Step 1: Enter UID
        <form onSubmit={handleUidSubmit} className="w-full max-w-md p-8">
          <h1 className="text-2xl font-bold mb-6">Faculty Login</h1>
          <input
            type="text"
            value={uid}
            onChange={(e) => setUid(e.target.value.toUpperCase())}
            placeholder="Enter your UID (e.g., VF2024001)"
            className="w-full p-3 border rounded mb-4"
            required
          />
          <button className="w-full bg-blue-600 text-white p-3 rounded">
            {loading ? 'Verifying...' : 'Continue'}
          </button>
        </form>
      ) : (
        // Step 2: Enter OTP
        <form onSubmit={handleOtpSubmit} className="w-full max-w-md p-8">
          <h1 className="text-2xl font-bold mb-4">Enter OTP</h1>
          <p className="text-gray-600 mb-2">Name: {faculty?.name}</p>
          <p className="text-gray-600 mb-4">Email: {faculty?.email}</p>
          <p className="text-sm mb-4">OTP sent to your email</p>
          
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter 6-digit OTP"
            className="w-full p-3 border rounded mb-4"
            maxLength={6}
            required
          />
          <button className="w-full bg-blue-600 text-white p-3 rounded">
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
          <button
            type="button"
            onClick={() => setStep(1)}
            className="w-full mt-2 text-blue-600"
          >
            ← Back
          </button>
        </form>
      )}
    </div>
  );
}
```

---

## 📝 **CHANGE 4: Update Admin Dashboard**

### **File: `src/pages/AdminDashboard.tsx`**

**Changes needed:**

```typescript
// 1. Remove Number() conversions
const handleDeleteFaculty = async (id: string) => {  // ✅ String parameter
  await facultyAPI.delete(id);  // ✅ Pass string directly
};

const handleToggleUgcStatus = async (id: string, status: boolean) => {
  await facultyAPI.updateUgcStatus(id, !status);  // ✅ String ID
};

// 2. Add email to faculty form
const [facultyForm, setFacultyForm] = useState({
  uid: '',
  name: '',
  email: '',  // ✅ NEW: Required email field
  phone: '',
  isUgcNetQualified: false
});

// 3. Update create faculty
const handleAddFaculty = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // Validate email
  if (!facultyForm.email.includes('@')) {
    toast.error('Invalid email');
    return;
  }
  
  await facultyAPI.create(facultyForm);
  toast.success('Faculty created! Welcome email sent.');
};
```

---

## 🎨 **CHANGE 5: Update UI Components**

### **Add Email Field to Faculty Form:**

```tsx
<div>
  <Label>Email *</Label>
  <Input
    type="email"
    value={facultyForm.email}
    onChange={(e) => setFacultyForm({ ...facultyForm, email: e.target.value })}
    placeholder="faculty@example.com"
    required
  />
</div>
```

### **Display Email in Faculty Table:**

```tsx
<TableRow key={faculty.id}>
  <TableCell>{faculty.uid}</TableCell>
  <TableCell>{faculty.name}</TableCell>
  <TableCell>{faculty.email}</TableCell>  {/* ✅ NEW */}
  <TableCell>{faculty.phone}</TableCell>
  {/* ... */}
</TableRow>
```

---

## ✅ **SUMMARY OF FRONTEND CHANGES**

### **Files to Update:**

1. **`src/services/api.ts`**
   - Remove `Number()` conversions for IDs
   - Keep IDs as strings
   - Update OTP API (only UID needed)
   - Add email field to responses

2. **`src/types/billing.ts`**
   - Change `id: number` → `id: string`
   - Change `facultyId: number` → `facultyId: string`
   - Add `email: string` to FacultyDetails

3. **`src/pages/FacultyLogin.tsx`**
   - Remove name + phone inputs
   - Only ask for UID
   - Show faculty details before OTP
   - Send OTP to email automatically

4. **`src/pages/AdminDashboard.tsx`**
   - Add email field to faculty form
   - Display email in faculty table
   - Remove `Number()` conversions

5. **`src/pages/BankDetailsSetup.tsx`**
   - No changes needed (already uses string IDs)

---

## 🧪 **TESTING CHECKLIST**

### **Faculty Login:**
- [ ] Enter UID → Shows faculty details
- [ ] Click "Send OTP" → Email received
- [ ] Enter OTP → Login successful
- [ ] First login → Redirects to bank details
- [ ] Subsequent login → Redirects to dashboard

### **Admin Panel:**
- [ ] Create faculty with email → Success
- [ ] Faculty receives welcome email
- [ ] Delete faculty → Works with string ID
- [ ] Toggle UGC status → Works correctly

### **Bills:**
- [ ] Create bill → Saves with string faculty ID
- [ ] View bills → Displays correctly
- [ ] All CRUD operations work

---

## 🚀 **QUICK MIGRATION STEPS**

1. **Update api.ts:**
   - Find all `Number(` and remove
   - Add email field
   - Update OTP API

2. **Update types:**
   - `id: number` → `id: string`
   - Add email field

3. **Update FacultyLogin.tsx:**
   - Use new 2-step flow
   - Remove phone input

4. **Update AdminDashboard.tsx:**
   - Add email field to form
   - Show email in table

5. **Test everything:**
   - Faculty login with email OTP
   - Admin CRUD operations
   - Bill creation

---

**All changes are minimal and focused on:**
- ✅ String IDs (remove Number conversion)
- ✅ Email-based OTP (simplified login flow)
- ✅ Email field (added to faculty)

**No breaking changes to existing features!**
