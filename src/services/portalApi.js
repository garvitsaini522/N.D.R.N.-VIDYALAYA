import { DataService, isDemoSessionActive } from './dataService';
import { apiFetch, getApiBaseUrl } from './apiConfig';

/**
 * Universal Portal API Client with real backend API integration
 * and automatic reactive fallback to DataService for offline local resilience.
 * Uses centralized apiConfig for environment-aware API URL and robust error handling.
 */
export const portalApi = {
  /**
   * Helper to make authenticated requests
   */
  async request(endpoint, options = {}) {
    return apiFetch(endpoint, options);
  },

  /**
   * 1. Get Student Profile
   */
  async getStudent(studentId) {
    try {
      const res = await this.request(`/students/${studentId}`);
      if (res && res.data) return { data: res.data, isOfflineFallback: false };
    } catch {
      // Fallback to local DataService for offline resilience
    }
    const local = DataService.getStudentById(studentId);
    return { data: local || null, isOfflineFallback: true };
  },

  /**
   * Update Student Profile (Personal particulars permitted for parent/admin)
   */
  async updateStudent(studentId, updateData) {
    const res = await this.request(`/students/${studentId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
    if (res && res.data) {
      DataService.updateStudent(studentId, res.data);
      return {
        success: true,
        data: res.data,
        isOfflineFallback: false,
      };
    }
    return { success: true, data: res, isOfflineFallback: false };
  },

  /**
   * 2. Get Student Attendance Records & Summary
   */
  async getAttendance(studentId) {
    try {
      const res = await this.request(`/attendance/student/${studentId}`);
      if (res && res.data) return { data: res.data, isOfflineFallback: false };
    } catch {
      // Fallback to local DataService
    }
    const allAttendance = DataService.getAttendanceRecords();
    const studentRecords = allAttendance.filter((r) => r.studentId === studentId);
    const leaves = DataService.getLeaveRequests().filter((l) => l.studentId === studentId);

    if (studentRecords.length === 0 && leaves.length === 0) {
      return { data: null, isOfflineFallback: true };
    }

    const presentDays = studentRecords.filter((r) => r.status === 'present').length;
    const totalDays = studentRecords.length;

    return {
      data: {
        studentId,
        summary: {
          totalDays,
          presentDays,
          absentDays: totalDays - presentDays,
          approvedLeaves: leaves.filter((l) => l.status === 'Approved').length,
          attendancePercentage: totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(1) : 0,
        },
        records: studentRecords,
        leaveRequests: leaves,
      },
      isOfflineFallback: true,
    };
  },

  /**
   * 3. Submit Leave Application (Client-side proforma simulation)
   */
  async submitLeave(leaveData) {
    const saved = DataService.addLeaveRequest(leaveData);
    return { data: saved, success: true, isLocalOnly: true, isOfflineFallback: true };
  },

  /**
   * 4. Get Homework for class
   */
  async getHomework(classIdOrGrade = 'Class 5') {
    const query = classIdOrGrade ? `?classId=${encodeURIComponent(classIdOrGrade)}` : '';
    const res = await this.request(`/homework${query}`);
    const items = res?.data?.items || res?.data || res || [];
    return { data: Array.isArray(items) ? items : [], isOfflineFallback: false };
  },

  /**
   * 5. Submit Homework Response
   */
  async submitHomework(taskId, submissionData) {
    const res = await this.request(`/homework/${taskId}/submit`, {
      method: 'POST',
      body: JSON.stringify(submissionData),
    });
    return { data: res?.data || res, success: true };
  },

  /**
   * 6. Get Timetable for class
   */
  async getTimetable(classIdOrGrade = 'Class 5', day) {
    const dayQuery = day && day !== 'All' ? `?day=${encodeURIComponent(day)}` : '';
    const res = await this.request(`/timetable/class/${encodeURIComponent(classIdOrGrade)}${dayQuery}`);
    return { data: res?.data || res, isOfflineFallback: false };
  },

  /**
   * 7. Get Examination Results & Report Card
   */
  async getResults(studentId) {
    try {
      const res = await this.request(`/results?studentId=${studentId}`);
      if (res && res.data && res.data.length > 0) {
        return { data: res.data, isOfflineFallback: false };
      }
    } catch {
      // Fallback
    }
    const local = DataService.getStudentResults(studentId);
    return { data: local || null, isOfflineFallback: true };
  },

  /**
   * 8. Get Fee Ledger & Invoices
   */
  async getFees(studentId) {
    try {
      const res = await this.request(`/fees/student/${studentId}`);
      if (res && res.data) return { data: res.data, isOfflineFallback: false };
    } catch {
      // Fallback
    }
    const localLedger = DataService.getStudentFeeLedger(studentId);
    return { data: localLedger, isOfflineFallback: true };
  },

  /**
   * 8b. Get Payment Gateway Availability & Offline Instructions
   */
  async getPaymentGatewayStatus() {
    try {
      const res = await this.request('/fees/gateway-status');
      return res?.data || { onlinePaymentsEnabled: false };
    } catch {
      return { onlinePaymentsEnabled: false };
    }
  },

  /**
   * 9. Process Online Fee Payment
   */
  async payFee(paymentData) {
    try {
      const res = await this.request('/fees/pay', {
        method: 'POST',
        body: JSON.stringify(paymentData),
      });
      return { data: res.data, success: true };
    } catch (err) {
      return {
        success: false,
        message: err.message || 'Online payment processing could not be completed. Please contact school accounts.',
        error: err.message,
      };
    }
  },

  /**
   * 9b. Verify Online Gateway Payment
   */
  async verifyPayment(verificationData) {
    const res = await this.request('/fees/verify', {
      method: 'POST',
      body: JSON.stringify(verificationData),
    });
    return { data: res?.data || res, success: true };
  },

  /**
   * 10. Get School Notices & Circulars
   */
  async getNotices(targetAudience = 'all') {
    try {
      const res = await this.request('/notices');
      if (res && res.data) {
        const raw = Array.isArray(res.data) ? res.data : (res.data.items || res.data);
        if (Array.isArray(raw)) {
          const mapped = raw.map((n) => ({
            ...n,
            id: n.id || n._id,
            date: n.date || (n.publishedDate ? new Date(n.publishedDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })),
            pinned: n.pinned !== undefined ? Boolean(n.pinned) : Boolean(n.isPinned),
            category: n.category === 'Academic' ? 'Academics' : (n.category || 'General'),
          }));
          return { data: mapped, isOfflineFallback: false };
        }
      }
    } catch {
      // Fallback
    }
    const local = DataService.getNotices(targetAudience);
    return { data: local || [], isOfflineFallback: true };
  },

  /**
   * 11. Get School Events Calendar
   */
  async getEvents() {
    try {
      const res = await this.request('/events');
      if (res && res.data) {
        const raw = Array.isArray(res.data) ? res.data : (res.data.items || res.data);
        const cleaned = (Array.isArray(raw) ? raw : []).map((e) => {
          let m = 'NOV';
          let d = '14';
          try {
            const dt = new Date(e.startDate || e.date);
            if (!isNaN(dt.getTime())) {
              m = dt.toLocaleString('default', { month: 'short' }).toUpperCase();
              d = String(dt.getDate()).padStart(2, '0');
            }
          } catch {
            // Ignore
          }
          const rawStatus = (e.status || '').toLowerCase();
          const rawType = (e.type || '').toLowerCase();
          const resolvedStatus = (rawType === 'past' || rawStatus === 'completed' || rawStatus === 'cancelled') ? 'Past' : 'Upcoming';
          return {
            ...e,
            id: e.id || e._id,
            month: e.month || m,
            day: e.day || d,
            status: resolvedStatus,
            title: typeof e.title === 'string' ? e.title.replace(/\[Event Placeholder\]\s*/gi, '').trim() : e.title,
          };
        });
        return { data: cleaned, isOfflineFallback: false };
      }
    } catch {
      // Fallback
    }
    const local = DataService.getEvents();
    return { data: local || [], isOfflineFallback: true };
  },

  /**
   * 12. Get Downloads & School Documents
   */
  getDownloads() {
    return [
      {
        id: 'DL-01',
        title: 'UP Board Primary Curriculum & Booklist (Classes 1-5)',
        description: 'Comprehensive syllabus framework, textbook lists, and scholastic objectives approved for the 2026-27 academic session.',
        category: 'Curriculum',
        format: 'PDF',
        fileSize: '1.2 MB',
        dateAdded: 'Apr 2026',
      },
      {
        id: 'DL-02',
        title: 'Annual Academic Calendar & Holiday Schedule 2026-27',
        description: 'Official schedule of instructional terms, examination windows, gazetted holidays, and parent-teacher meeting dates.',
        category: 'Calendar',
        format: 'PDF',
        fileSize: '850 KB',
        dateAdded: 'Apr 2026',
      },
      {
        id: 'DL-03',
        title: 'Winter & Summer School Uniform Code and Guidelines',
        description: 'Prescribed student dress code, physical education attire, house color badges, and discipline standards for primary grades.',
        category: 'Guidelines',
        format: 'PDF',
        fileSize: '420 KB',
        dateAdded: 'May 2026',
      },
      {
        id: 'DL-04',
        title: 'Parent Leave Application & Absence Exemption Form',
        description: 'Standard proforma for medical leave, family emergencies, and prior absence authorization addressed to the class teacher.',
        category: 'Forms',
        format: 'PDF',
        fileSize: '310 KB',
        dateAdded: 'May 2026',
      },
      {
        id: 'DL-05',
        title: 'Examination Assessment Pattern & Evaluation Rubric',
        description: 'Detailed grading guidelines, periodic test weights, and formative evaluation criteria for Nursery through Class 5.',
        category: 'Examination',
        format: 'PDF',
        fileSize: '680 KB',
        dateAdded: 'Jul 2026',
      },
      {
        id: 'DL-06',
        title: 'Vacation Reading & Holiday Homework Project Booklet',
        description: 'Curated bilingual worksheets and activity guides for experiential learning during the mid-term break.',
        category: 'Homework',
        format: 'PDF',
        fileSize: '1.8 MB',
        dateAdded: 'May 2026',
      },
    ];
  },

  /**
   * 13. Teacher Operations & API Calls
   */
  async getTeacher(teacherId = 'me') {
    try {
      const res = await this.request(`/teachers/${teacherId}`);
      if (res && res.data) return { data: res.data, isOfflineFallback: false };
    } catch {
      // Fallback
    }
    const local = DataService.getTeacherById(teacherId) || DataService.getTeachers()[0] || null;
    return { data: local, isOfflineFallback: true };
  },

  async updateTeacher(teacherId, updateData) {
    const res = await this.request(`/teachers/${teacherId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
    if (res && res.data) {
      DataService.updateTeacher(teacherId, res.data);
      return {
        success: true,
        data: res.data,
        isOfflineFallback: false,
      };
    }
    return { success: true, data: res, isOfflineFallback: false };
  },

  async recordClassAttendance(attendancePayload) {
    const res = await this.request('/attendance', {
      method: 'POST',
      body: JSON.stringify(attendancePayload),
    });
    if (res && res.data) {
      DataService.markClassAttendance(attendancePayload);
      return {
        success: true,
        data: res.data,
        isOfflineFallback: false,
      };
    }
    return { success: true, data: res, isOfflineFallback: false };
  },

  async createHomework(homeworkData) {
    const res = await this.request('/homework', {
      method: 'POST',
      body: JSON.stringify(homeworkData),
    });
    return {
      success: true,
      data: res?.data || res,
      isOfflineFallback: false,
    };
  },

  async deleteHomework(taskId) {
    const res = await this.request(`/homework/${taskId}`, {
      method: 'DELETE',
    });
    return { success: true, data: res?.data || res };
  },

  async getTeacherLeaves() {
    return { data: DataService.getTeacherLeaves() };
  },

  async applyTeacherLeave(leaveData) {
    const saved = DataService.applyTeacherLeave(leaveData);
    return { data: saved, success: true, isLocalOnly: true, isOfflineFallback: true };
  },

  async updateLeaveStatus(leaveId, status, reviewerName) {
    const updated = DataService.updateLeaveStatus(leaveId, status, reviewerName);
    return { data: updated, success: true, isLocalOnly: true, isOfflineFallback: true };
  },
};
