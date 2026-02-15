import axios from 'axios';
import { FacultyDetails, BillEntry } from '../types/billing';

const API_BASE_URL = 'http://localhost:8082/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

/* ---------------- AUTH ---------------- */

export const authAPI = {
  // Admin login with email/password
  adminLogin: async (email: string, password: string) => {
    const response = await api.post('/auth/admin/login', { email, password });
    return response.data;
  },

  // ✅ UPDATED: Only UID required (email-based OTP)
  sendOTP: async (uid: string) => {
    const response = await api.post('/auth/send-otp', { uid });
    return response.data;
  },

  verifyOTP: async (uid: string, otp: string) => {
    const response = await api.post('/auth/verify-otp', { uid, otp });
    return response.data;
  },
};

/* ---------------- FACULTY ---------------- */

export const facultyAPI = {

  // ✅ UPDATED: Keep IDs as strings, no Number() conversion
  getAll: async (): Promise<FacultyDetails[]> => {
    const response = await api.get('/faculty');
    const list = response.data || [];

    return list.map((f: any) => ({
      id: f.id,  // ✅ String ID
      uid: f.uid,
      name: f.name,
      email: f.email,  // ✅ Email field
      phone: f.phone,
      designation: f.designation,
      address: f.address,
      qualification: f.qualification,
      bankAccountNumber: f.bankAccountNumber,
      ifscCode: f.ifscCode,
      bankName: f.bankName,
      panNumber: f.panNumber,
      aadharNumber: f.aadharNumber,
      isUgcNetQualified: f.isUgcNetQualified ?? false,
      isVerified: f.isVerified ?? false,
      bankDetailsCompleted: f.bankDetailsCompleted ?? false,
      createdAt: f.createdAt
    }));
  },

  getByUid: async (uid: string): Promise<FacultyDetails> => {
    const response = await api.get(`/faculty/uid/${uid}`);
    return {
      id: response.data.id,  // ✅ String ID
      uid: response.data.uid,
      name: response.data.name,
      email: response.data.email,  // ✅ Email field
      phone: response.data.phone,
      designation: response.data.designation,
      address: response.data.address,
      qualification: response.data.qualification,
      bankAccountNumber: response.data.bankAccountNumber,
      ifscCode: response.data.ifscCode,
      bankName: response.data.bankName,
      panNumber: response.data.panNumber,
      aadharNumber: response.data.aadharNumber,
      isUgcNetQualified: response.data.isUgcNetQualified ?? false,
      isVerified: response.data.isVerified ?? false,
      bankDetailsCompleted: response.data.bankDetailsCompleted ?? false,
      createdAt: response.data.createdAt
    };
  },

  // ✅ UPDATED: Include email in create
  create: async (data: Partial<FacultyDetails>): Promise<FacultyDetails> => {
    const payload = {
      uid: data.uid,
      name: data.name,
      email: data.email,  // ✅ Email required
      phone: data.phone,
      isUgcNetQualified: data.isUgcNetQualified ?? false
    };

    const response = await api.post('/faculty', payload);
    return {
      id: response.data.id,  // ✅ String ID
      uid: response.data.uid,
      name: response.data.name,
      email: response.data.email,
      phone: response.data.phone,
      isUgcNetQualified: response.data.isUgcNetQualified ?? false,
      isVerified: response.data.isVerified ?? false,
      bankDetailsCompleted: response.data.bankDetailsCompleted ?? false,
      createdAt: response.data.createdAt
    };
  },

  // ✅ UPDATED: String ID parameter
  updateBankDetails: async (id: string, data: any): Promise<FacultyDetails> => {
    const response = await api.put(`/faculty/${id}/bank-details`, data);
    return response.data;
  },

  // ✅ UPDATED: String ID parameter
  updateUgcStatus: async (id: string, status: boolean): Promise<FacultyDetails> => {
    const response = await api.put(
      `/faculty/${id}/ugc-status`,
      null,
      {
        params: { isUgcNetQualified: status }
      }
    );
    return response.data;
  },

  // ✅ UPDATED: String ID parameter
  delete: async (id: string): Promise<void> => {
    await api.delete(`/faculty/${id}`);
  },
};

/* ---------------- BILLS ---------------- */

export const billsAPI = {

  getAll: async (): Promise<BillEntry[]> => {
    const response = await api.get('/bills');
    return (response.data || []).map((b: any) => ({
      id: b.id,  // ✅ String ID
      billId: b.billId,
      facultyId: b.facultyId,  // ✅ String ID
      facultyName: b.facultyName,
      program: b.program,
      department: b.department,
      pageNo: b.pageNo,
      perWeek: b.perWeek,
      semester: b.semester,
      subject: b.subject,
      subjectType: b.subjectType,
      className: b.className,
      month: b.month,
      year: b.year,
      datesWithDuration: b.datesWithDuration || [],
      totalHours: b.totalHours,
      ratePerHour: b.ratePerHour,
      totalAmount: b.totalAmount,
      taxDeduction: b.taxDeduction,
      netAmount: b.netAmount,
      status: b.status || 'pending',
      isUgcNetQualified: b.isUgcNetQualified ?? false,
      createdAt: b.createdAt
    }));
  },

  // ✅ UPDATED: String facultyId parameter
  getByFacultyId: async (facultyId: string): Promise<BillEntry[]> => {
    const response = await api.get(`/bills/faculty/${facultyId}`);
    return response.data || [];
  },

  // ✅ UPDATED: Correct endpoint
  create: async (data: any): Promise<BillEntry> => {
    const billData = {
      faculty: { id: data.facultyId },  // ✅ Send as object with ID
      program: data.program,
      department: data.department,
      pageNo: data.pageNo,
      perWeek: data.perWeek,
      semester: data.semester,
      subject: data.subject,
      subjectType: data.subjectType,
      className: data.className,
      month: data.month,
      year: data.year,
      datesWithDuration: data.datesWithDuration,
      totalHours: data.totalHours
    };

    const response = await api.post('/bills', billData);
    return response.data;
  },

  // ✅ UPDATED: String ID parameter
  updateStatus: async (id: string, status: string): Promise<BillEntry> => {
    const response = await api.put(`/bills/${id}/status`, { status });
    return response.data;
  },
};

export default api;
