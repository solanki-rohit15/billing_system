export interface FacultyDetails {
   id: string;  // ✅ NEW: String UUID
  uid: string;
  name: string;
  email: string;  // ✅ NEW: Email field
  phone: string;
  designation?: string;
  address?: string;
  qualification?: string;

  bankAccountNumber?: string;
  ifscCode?: string;
  bankName?: string;
  panNumber?: string;
  aadharNumber?: string;

  bankDetailsCompleted: boolean;
  isVerified: boolean;
  isUgcNetQualified: boolean;

  createdAt: Date | string;
}


export type SubjectType = 'theory' | 'practical' | 'lab';

export const getSubjectRates = (isUgcNetQualified: boolean = false): Record<SubjectType, number> => {
  if (isUgcNetQualified) {
    return { theory: 800, practical: 800, lab: 400 };
  }
  return { theory: 600, practical: 600, lab: 200 };
};

export interface DateWithDuration {
  date: string;
  hours: number;
}

export interface BillEntry {
  id: string;  // ✅ String UUID
  billId: string;
  facultyId: string;  // ✅ String UUID
  facultyName: string;
  department?: string;
  pageNo?: string;
  program: string;
  semester: string;
  subject: string;
  subjectType: SubjectType;
  isUgcNetQualified: boolean;
  datesWithDuration: DateWithDuration[];
  totalHours: number;
  ratePerHour: number;
  totalAmount: number;
  taxDeduction?: number;
  netAmount?: number;
  month: string;
  year: number;
  perWeek?: string;
  status: 'pending' | 'approved' | 'paid';
  createdAt: Date | string;
  className?: string;
}

export interface User {
  id: number;
  uid?: string;
  email?: string;
  name: string;
  role: 'faculty' | 'admin';
}
