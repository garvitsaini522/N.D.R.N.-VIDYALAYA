import { DataService, normalizeAcademicSession } from './dataService.js';
import { apiFetch, getApiBaseUrl } from './apiConfig.js';

/**
 * Unified API Client for N.D.R.N. Vidyalaya
 * Connects Public Website, Admin Console, and Student/Parent Portals to Node/Express backend and MongoDB.
 * Uses centralized apiConfig for environment-aware API URL and robust error handling.
 * Enforces strict error propagation on mutations (never falsely reports success on DB failure).
 * Features read-only fallback to DataService for offline resilience.
 */
class ApiClient {
  async request(endpoint, options = {}) {
    return apiFetch(endpoint, options);
  }

  // =========================================================================
  // 1. PUBLIC & ADMISSIONS
  // =========================================================================
  async getNotices(targetAudience = 'all') {
    try {
      const res = await this.request('/notices');
      if (res && res.data) {
        const raw = Array.isArray(res.data) ? res.data : (res.data.items || res.data);
        if (Array.isArray(raw)) {
          return raw.map((n) => ({
            ...n,
            id: n.id || n._id,
            date: n.date || (n.publishedDate ? new Date(n.publishedDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })),
            pinned: n.pinned !== undefined ? Boolean(n.pinned) : Boolean(n.isPinned),
            category: n.category === 'Academic' ? 'Academics' : (n.category || 'General'),
          }));
        }
      }
    } catch {
      // Offline fallback
    }
    return DataService.getNotices(targetAudience);
  }

  async getEvents() {
    try {
      const res = await this.request('/events');
      if (res && res.data) {
        const raw = Array.isArray(res.data) ? res.data : (res.data.items || res.data);
        if (Array.isArray(raw)) {
          return raw.map((e) => {
            const rawDate = e.date || (e.startDate ? new Date(e.startDate).toISOString().split('T')[0] : '');
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
            const resolvedType = (rawType === 'past' || rawStatus === 'completed' || rawStatus === 'cancelled') ? 'past' : 'upcoming';

            return {
              ...e,
              id: e.id || e._id,
              date: rawDate,
              month: e.month || m,
              day: e.day || d,
              status: e.status === 'scheduled' ? 'Upcoming' : (e.status === 'completed' ? 'Completed' : (e.status || 'Upcoming')),
              type: resolvedType,
              title: typeof e.title === 'string' ? e.title.replace(/\[Event Placeholder\]\s*/gi, '').trim() : e.title,
            };
          });
        }
      }
    } catch {
      // Offline fallback
    }
    return DataService.getEvents();
  }

  async getGallery() {
    try {
      const res = await this.request('/gallery');
      if (res && res.data) {
        return Array.isArray(res.data) ? res.data : (res.data.items || res.data);
      }
    } catch {
      // Offline fallback
    }
    return DataService.getGallery();
  }

  async submitAdmissionEnquiry(payload) {
    const res = await this.request('/admissions/enquire', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    const responseData = res?.data || {};
    // Synchronize with local storage on confirmed backend persistence
    DataService.addAdmissionInquiry({
      ...payload,
      enquiryNumber: responseData.enquiryNumber,
      id: responseData.enquiryNumber,
      status: responseData.status || 'Received',
      deliveryStatus: responseData.deliveryStatus || 'Not Applicable',
      submittedAt: new Date().toISOString(),
    });
    return { data: responseData, isFromApi: true, success: true };
  }

  async submitContactMessage(payload) {
    const res = await this.request('/contact', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    DataService.addContactMessage(payload);
    return { data: res?.data || payload, isFromApi: true, success: true };
  }

  // =========================================================================
  // 2. ADMIN ADMISSIONS & CONTACT MESSAGES
  // =========================================================================
  async getAdmissions(params = {}) {
    try {
      const query = new URLSearchParams(params).toString();
      const res = await this.request(`/admissions?${query}`);
      if (res && res.data) {
        const raw = Array.isArray(res.data) ? res.data : (res.data.items || res.data);
        if (Array.isArray(raw)) {
          return raw.map((a) => {
            const rawStatus = a.status || 'Received';
            let formattedStatus = rawStatus;
            if (rawStatus === 'new') formattedStatus = 'Received';
            else if (rawStatus === 'under_review') formattedStatus = 'Under Review';
            else if (rawStatus === 'documents_pending') formattedStatus = 'Pending Docs';
            else if (rawStatus === 'admitted') formattedStatus = 'Admitted';
            else if (rawStatus === 'rejected') formattedStatus = 'Rejected';
            else if (rawStatus.length > 0) {
              formattedStatus = rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1);
            }

            const rawDate = a.date || (a.createdAt ? new Date(a.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);

            return {
              ...a,
              id: a.enquiryNumber || a._id,
              _id: a._id,
              enquiryNumber: a.enquiryNumber,
              date: rawDate,
              status: formattedStatus,
              deliveryStatus: a.deliveryStatus || 'Not Applicable',
            };
          });
        }
      }
    } catch {
      // Fallback
    }
    return DataService.getAdmissions();
  }

  async updateAdmissionStatus(id, newStatus, notes) {
    const res = await this.request(`/admissions/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: newStatus, note: notes, notes }),
    });
    DataService.updateAdmissionStatus(id, newStatus, notes);
    return res?.data || res;
  }

  async deleteAdmission(id) {
    const res = await this.request(`/admissions/${id}`, {
      method: 'DELETE',
    });
    DataService.deleteAdmission(id);
    return res?.data || res;
  }

  async getContactMessages(params = {}) {
    try {
      const query = new URLSearchParams(params).toString();
      const res = await this.request(`/contact?${query}`);
      if (res && res.data) return res.data.items || res.data;
    } catch {
      // Fallback
    }
    return DataService.getContacts();
  }

  async markContactAsRead(id) {
    const res = await this.request(`/contact/${id}/read`, {
      method: 'PATCH',
    });
    DataService.updateContactStatus(id, 'Resolved', 'Marked as read');
    return res?.data || res;
  }

  async deleteContactMessage(id) {
    const res = await this.request(`/contact/${id}`, {
      method: 'DELETE',
    });
    DataService.deleteContact(id);
    return res?.data || res;
  }

  // =========================================================================
  // 3. ADMIN CONTENT (NOTICES, EVENTS, GALLERY)
  // =========================================================================
  async createNotice(noticeData) {
    const payload = {
      ...noticeData,
      content: noticeData.content || noticeData.summary || '',
      category: noticeData.category === 'Academics' ? 'Academic' : (noticeData.category || 'General'),
      isPinned: noticeData.pinned !== undefined ? Boolean(noticeData.pinned) : Boolean(noticeData.isPinned),
    };
    const res = await this.request('/notices', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (res && res.data) {
      DataService.addNotice({
        ...res.data,
        id: res.data._id || res.data.id,
        category: noticeData.category || 'Academics',
        pinned: res.data.isPinned !== undefined ? res.data.isPinned : noticeData.pinned,
      });
      return res.data;
    }
    return res;
  }

  async updateNotice(id, updatedFields) {
    const payload = {
      ...updatedFields,
      ...(updatedFields.category ? { category: updatedFields.category === 'Academics' ? 'Academic' : updatedFields.category } : {}),
      ...(updatedFields.pinned !== undefined ? { isPinned: Boolean(updatedFields.pinned) } : {}),
      ...(updatedFields.summary && !updatedFields.content ? { content: updatedFields.summary } : {}),
    };
    const res = await this.request(`/notices/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    if (res && res.data) {
      DataService.updateNotice(id, {
        ...res.data,
        id: res.data._id || id,
        category: updatedFields.category || res.data.category,
      });
      return res.data;
    }
    return res;
  }

  async deleteNotice(id) {
    const res = await this.request(`/notices/${id}`, { method: 'DELETE' });
    DataService.deleteNotice(id);
    return res;
  }

  async createEvent(eventData) {
    const payload = {
      ...eventData,
      startDate: eventData.startDate || eventData.date || new Date().toISOString().split('T')[0],
      type: (eventData.type || (eventData.status === 'Completed' ? 'past' : 'upcoming')).toLowerCase(),
      status: eventData.status === 'Upcoming' ? 'scheduled' : (eventData.status === 'Completed' ? 'completed' : (eventData.status || 'scheduled')),
    };
    const res = await this.request('/events', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (res && res.data) {
      DataService.addEvent({
        ...res.data,
        id: res.data._id || res.data.id,
        date: eventData.date || eventData.startDate,
        status: eventData.status || 'Upcoming',
      });
      return res.data;
    }
    return res;
  }

  async updateEvent(id, updatedFields) {
    const payload = {
      ...updatedFields,
      ...(updatedFields.date ? { startDate: updatedFields.date } : {}),
      ...(updatedFields.status ? {
        status: updatedFields.status === 'Upcoming' ? 'scheduled' : (updatedFields.status === 'Completed' ? 'completed' : updatedFields.status),
        type: updatedFields.status === 'Completed' ? 'past' : 'upcoming',
      } : {}),
    };
    const res = await this.request(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    if (res && res.data) {
      DataService.updateEvent(id, {
        ...res.data,
        id: res.data._id || id,
        date: updatedFields.date || res.data.startDate,
      });
      return res.data;
    }
    return res;
  }

  async deleteEvent(id) {
    const res = await this.request(`/events/${id}`, { method: 'DELETE' });
    DataService.deleteEvent(id);
    return res;
  }

  async createGalleryItem(itemData) {
    const res = await this.request('/gallery', {
      method: 'POST',
      body: JSON.stringify(itemData),
    });
    if (res && res.data) {
      DataService.addGalleryItem(res.data);
      return res.data;
    }
    return res;
  }

  async deleteGalleryItem(id) {
    const res = await this.request(`/gallery/${id}`, { method: 'DELETE' });
    DataService.deleteGalleryItem(id);
    return res;
  }

  // =========================================================================
  // 4. INSTITUTIONAL ROSTERS (STUDENTS, PARENTS, TEACHERS, CLASSES)
  // =========================================================================
  async getStudents(params = {}) {
    try {
      const query = new URLSearchParams(params).toString();
      const res = await this.request(`/students?${query}`);
      if (res && res.data) {
        const raw = Array.isArray(res.data) ? res.data : (res.data.items || res.data);
        if (Array.isArray(raw)) {
          return raw.map((s) => ({
            ...s,
            id: s.id || s._id,
            name: s.fullName || s.name,
            rollNo: s.rollNumber || s.rollNo,
            grade: s.class?.name || s.grade || 'Class 5',
            section: s.class?.section || s.section || 'A',
            parentName: s.parent?.fatherName || s.parent?.primaryContact?.name || s.parentName || 'Parent / Guardian',
            parentPhone: s.parent?.primaryContact?.phone || s.parentPhone || '',
            parentEmail: s.parent?.primaryContact?.email || s.parentEmail || '',
            address: typeof s.address === 'string' ? s.address : (s.address?.street || 'Daulatyarpur, Madhoganj'),
            status: s.status === 'active' ? 'Active' : (s.status === 'inactive' ? 'Inactive' : (s.status || 'Active')),
            feeStatus: s.feeStatus || 'Paid',
            pendingFeeAmount: s.pendingFeeAmount || 0,
          }));
        }
      }
    } catch {
      // Fallback
    }
    return DataService.getStudents();
  }

  async createStudent(studentData) {
    const res = await this.request('/students', {
      method: 'POST',
      body: JSON.stringify(studentData),
    });
    if (res && res.data) {
      DataService.addStudent({
        ...studentData,
        id: res.data._id || res.data.id,
      });
      return res.data;
    }
    return res;
  }

  async updateStudent(id, studentData) {
    const res = await this.request(`/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(studentData),
    });
    if (res && res.data) {
      DataService.updateStudent(id, studentData);
      return res.data;
    }
    return res;
  }

  async deleteStudent(id) {
    const res = await this.request(`/students/${id}`, {
      method: 'DELETE',
    });
    DataService.deleteStudent(id);
    return res;
  }

  async getParents(params = {}) {
    try {
      const query = new URLSearchParams(params).toString();
      const res = await this.request(`/parents?${query}`);
      if (res && res.data) {
        const raw = Array.isArray(res.data) ? res.data : (res.data.items || res.data);
        if (Array.isArray(raw)) {
          return raw.map((p) => {
            const firstStudent = p.students?.[0];
            return {
              ...p,
              id: p.id || p._id,
              name: p.primaryContact?.name || p.fatherName || p.motherName || p.name || 'Parent',
              spouseName: p.spouseName || (p.primaryContact?.relationship === 'Mother' ? p.fatherName : p.motherName) || '',
              relationship: p.primaryContact?.relationship || p.relationship || 'Father',
              phone: p.primaryContact?.phone || p.phone || '',
              alternatePhone: p.alternatePhone || '',
              email: p.primaryContact?.email || p.email || '',
              occupation: p.occupation || '',
              address: typeof p.address === 'string' ? p.address : (p.address?.street || 'Daulatyarpur, Madhoganj'),
              wardId: firstStudent?._id || p.wardId || '',
              wardName: firstStudent?.fullName || p.wardName || '',
              wardGrade: firstStudent?.class?.name ? `${firstStudent.class.name}-${firstStudent.section || 'A'}` : (p.wardGrade || ''),
              status: p.status === 'inactive' ? 'Inactive' : 'Active',
            };
          });
        }
      }
    } catch {
      // Fallback
    }
    return DataService.getParents();
  }

  async createParent(parentData) {
    const res = await this.request('/parents', {
      method: 'POST',
      body: JSON.stringify(parentData),
    });
    if (res && res.data) {
      DataService.addParent({
        ...parentData,
        id: res.data._id || res.data.id,
      });
      return res.data;
    }
    return res;
  }

  async updateParent(id, parentData) {
    const res = await this.request(`/parents/${id}`, {
      method: 'PUT',
      body: JSON.stringify(parentData),
    });
    if (res && res.data) {
      DataService.updateParent(id, parentData);
      return res.data;
    }
    return res;
  }

  async deleteParent(id) {
    const res = await this.request(`/parents/${id}`, {
      method: 'DELETE',
    });
    DataService.deleteParent(id);
    return res;
  }

  async linkParentWard(parentId, studentId) {
    const res = await this.request(`/parents/${parentId}/wards`, {
      method: 'POST',
      body: JSON.stringify({ studentId }),
    });
    return res?.data || res;
  }

  async unlinkParentWard(parentId, studentId) {
    const res = await this.request(`/parents/${parentId}/wards/${studentId}`, {
      method: 'DELETE',
    });
    return res?.data || res;
  }

  async getTeachers() {
    try {
      const res = await this.request('/teachers');
      if (res && res.data) {
        const raw = Array.isArray(res.data) ? res.data : (res.data.items || res.data);
        if (Array.isArray(raw)) {
          return raw.map((t) => ({
            ...t,
            id: t.id || t._id,
            name: t.fullName || t.name,
            employeeId: t.employeeId,
            designation: t.designation || 'Primary Educator',
            wing: t.wing || 'Primary',
            email: t.user?.email || t.email || '',
            phone: t.phone || '',
            qualification: t.qualification || 'B.A., B.Ed.',
            experience: t.experienceYears ? `${t.experienceYears} Years` : (t.experience || '3 Years'),
            assignedClasses: (t.assignedClasses || []).map((c) => typeof c === 'object' ? `${c.name || 'Class'}-${c.section || 'A'}` : c),
            primarySubjects: t.primarySubjects || [],
            status: t.status === 'inactive' ? 'Inactive' : 'Active',
          }));
        }
      }
    } catch {
      // Fallback
    }
    return DataService.getTeachers();
  }

  async createTeacher(teacherData) {
    const res = await this.request('/teachers', {
      method: 'POST',
      body: JSON.stringify(teacherData),
    });
    if (res && res.data) {
      DataService.addTeacher({
        ...teacherData,
        id: res.data._id || res.data.id,
      });
      return res.data;
    }
    return res;
  }

  async updateTeacher(id, teacherData) {
    const res = await this.request(`/teachers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(teacherData),
    });
    if (res && res.data) {
      DataService.updateTeacher(id, teacherData);
      return res.data;
    }
    return res;
  }

  async deleteTeacher(id) {
    const res = await this.request(`/teachers/${id}`, {
      method: 'DELETE',
    });
    DataService.deleteTeacher(id);
    return res;
  }

  async getClasses() {
    try {
      const res = await this.request('/classes');
      if (res && res.data) {
        const raw = Array.isArray(res.data) ? res.data : (res.data.items || res.data);
        if (Array.isArray(raw)) {
          return raw.map((c) => ({
            ...c,
            id: c.id || c._id,
            name: c.name,
            section: c.section || 'A',
            room: c.roomNumber || c.room || 'Room 101',
            capacity: c.capacity || 35,
            classTeacher: c.classTeacher?.fullName || c.classTeacher || 'Assigned Faculty',
            studentCount: c.studentCount || 0,
          }));
        }
      }
    } catch {
      // Fallback
    }
    return DataService.getClasses();
  }

  async createClass(classData) {
    const res = await this.request('/classes', {
      method: 'POST',
      body: JSON.stringify(classData),
    });
    if (res && res.data) {
      DataService.addClass({
        ...classData,
        id: res.data._id || res.data.id,
      });
      return res.data;
    }
    return res;
  }

  async updateClass(id, classData) {
    const res = await this.request(`/classes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(classData),
    });
    if (res && res.data) {
      DataService.updateClass(id, classData);
      return res.data;
    }
    return res;
  }

  async deleteClass(id) {
    const res = await this.request(`/classes/${id}`, {
      method: 'DELETE',
    });
    DataService.deleteClass(id);
    return res;
  }

  // =========================================================================
  // 5. FEE ROSTERS & INVOICE COLLECTIONS
  // =========================================================================
  async getFees(params = {}) {
    try {
      const query = new URLSearchParams(params).toString();
      const res = await this.request(`/fees?${query}`);
      if (res && res.data) {
        const raw = Array.isArray(res.data) ? res.data : (res.data.items || res.data);
        if (Array.isArray(raw)) {
          return raw.map((f) => ({
            ...f,
            id: f.id || f._id,
            feeId: f.id || f._id,
            studentId: f.student?._id || f.studentId || f.student,
            studentName: f.student?.fullName || f.studentName || 'Student',
            admissionNo: f.student?.admissionNumber || f.admissionNo || '',
            grade: f.student?.class ? `${f.student.class.name || 'Class'}-${f.student.class.section || 'A'}` : (f.grade || 'Primary'),
            term: f.term || 'Quarterly Tuition',
            amount: f.amount || 3200,
            paidAmount: f.paidAmount || 0,
            pendingAmount: Math.max(0, (f.amount || 3200) - (f.paidAmount || 0)),
            status: f.status === 'paid' ? 'Paid' : (f.status === 'partially_paid' ? 'Partially Paid' : 'Due'),
            paymentMode: f.paymentMethod || 'Cash / Office Desk',
            receiptNo: f.receiptNumber || null,
            receiptNumber: f.receiptNumber || null,
            date: f.paymentDate ? new Date(f.paymentDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '',
          }));
        }
      }
    } catch {
      // Fallback
    }
    return DataService.getFees();
  }

  async getPaymentGatewayStatus() {
    try {
      const res = await this.request('/fees/gateway-status');
      return res?.data || { onlinePaymentsEnabled: false };
    } catch {
      return { onlinePaymentsEnabled: false };
    }
  }

  async createFee(feeData) {
    const res = await this.request('/fees', {
      method: 'POST',
      body: JSON.stringify(feeData),
    });
    return res?.data || res;
  }

  async recordFeePayment(feeIdOrData, paymentDetails = {}) {
    let feeId = typeof feeIdOrData === 'string' ? feeIdOrData : feeIdOrData?.feeId || feeIdOrData?.id;
    let payload = typeof feeIdOrData === 'object' ? { ...feeIdOrData, ...paymentDetails } : paymentDetails;

    // Call /fees/:id/payment or fallback to /fees/pay
    if (feeId) {
      const res = await this.request(`/fees/${feeId}/payment`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      DataService.recordFeePayment(payload);
      return res?.data || res;
    } else {
      const res = await this.request('/fees/pay', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      DataService.recordFeePayment(payload);
      return res?.data || res;
    }
  }

  // =========================================================================
  // 6. ATTENDANCE DESK & CLASS TRACKING
  // =========================================================================
  async markClassAttendance(payload) {
    const res = await this.request('/attendance', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res?.data || res;
  }

  async getClassAttendance(classId, date) {
    const query = date ? `?date=${encodeURIComponent(date)}` : '';
    const res = await this.request(`/attendance/class/${classId}${query}`);
    return res?.data || res;
  }

  async getClassAttendanceHistory(classId, limit = 30) {
    const res = await this.request(`/attendance/class/${classId}/history?limit=${limit}`);
    return res?.data || res;
  }

  async getStudentAttendance(studentId, params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await this.request(`/attendance/student/${studentId}?${query}`);
    return res?.data || res;
  }

  // =========================================================================
  // 6b. TIMETABLE & SCHOOL SCHEDULE
  // =========================================================================
  async getTimetable(classId, day) {
    const query = day && day !== 'All' ? `?day=${encodeURIComponent(day)}` : '';
    const res = await this.request(`/timetable/class/${classId}${query}`);
    return res?.data || res;
  }

  async getTeacherTimetable(day) {
    const query = day && day !== 'All' ? `?day=${encodeURIComponent(day)}` : '';
    const res = await this.request(`/timetable/teacher${query}`);
    return res?.data || res;
  }

  async saveTimetable(classId, timetableData) {
    const res = await this.request(`/timetable/class/${classId}`, {
      method: 'POST',
      body: JSON.stringify(timetableData),
    });
    return res?.data || res;
  }

  async deleteTimetable(classId, day) {
    const query = day ? `?day=${encodeURIComponent(day)}` : '';
    const res = await this.request(`/timetable/class/${classId}${query}`, {
      method: 'DELETE',
    });
    return res?.data || res;
  }

  // =========================================================================
  // 6c. HOMEWORK & ASSIGNMENTS
  // =========================================================================
  async getHomework(params = {}) {
    const query = new URLSearchParams(params).toString();
    const url = query ? `/homework?${query}` : '/homework';
    const res = await this.request(url);
    return res?.data || res;
  }

  async createHomework(homeworkData) {
    const res = await this.request('/homework', {
      method: 'POST',
      body: JSON.stringify(homeworkData),
    });
    return res?.data || res;
  }

  async updateHomework(id, homeworkData) {
    const res = await this.request(`/homework/${id}`, {
      method: 'PUT',
      body: JSON.stringify(homeworkData),
    });
    return res?.data || res;
  }

  async deleteHomework(id) {
    const res = await this.request(`/homework/${id}`, {
      method: 'DELETE',
    });
    return res?.data || res;
  }

  async submitHomework(id, submissionData) {
    const res = await this.request(`/homework/${id}/submit`, {
      method: 'POST',
      body: JSON.stringify(submissionData),
    });
    return res?.data || res;
  }

  async getHomeworkSubmissions(id) {
    const res = await this.request(`/homework/${id}/submissions`);
    return res?.data || res;
  }

  // =========================================================================
  // 7. FEE STRUCTURE (PUBLIC & ADMIN)
  // =========================================================================
  async getPublicFeeStructure(sessionOrParams = '2026-27') {
    const raw =
      typeof sessionOrParams === 'object' && sessionOrParams !== null
        ? sessionOrParams.session || sessionOrParams.academicSession || '2026-27'
        : sessionOrParams || '2026-27';
    const session = normalizeAcademicSession(raw) || '2026-27';

    try {
      const query = session && session !== 'all' ? `?session=${encodeURIComponent(session)}` : '';
      const res = await this.request(`/fee-structure${query}`);
      if (res && res.data) {
        return Array.isArray(res.data) ? res.data : (res.data.items || res.data);
      }
    } catch {
      // Offline fallback
    }
    return DataService.getFeeStructures(true, session);
  }

  async getAdminFeeStructures(sessionOrParams = '2026-27') {
    const raw =
      typeof sessionOrParams === 'object' && sessionOrParams !== null
        ? sessionOrParams.session || sessionOrParams.academicSession || '2026-27'
        : sessionOrParams || '2026-27';
    const session = normalizeAcademicSession(raw) || '2026-27';

    try {
      const query = session && session !== 'all' ? `?session=${encodeURIComponent(session)}` : '';
      const res = await this.request(`/fee-structure/admin${query}`);
      if (res && res.data) {
        return Array.isArray(res.data) ? res.data : (res.data.items || res.data);
      }
    } catch {
      // Offline fallback
    }
    return DataService.getFeeStructures(false, session);
  }

  async createFeeStructure(data) {
    const res = await this.request('/fee-structure', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (res && res.data) {
      DataService.saveFeeStructure(res.data);
      return res.data;
    }
    return res;
  }

  async updateFeeStructure(id, data) {
    const res = await this.request(`/fee-structure/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    if (res && res.data) {
      DataService.saveFeeStructure(res.data);
      return res.data;
    }
    return res;
  }

  async deleteFeeStructure(id) {
    const res = await this.request(`/fee-structure/${id}`, {
      method: 'DELETE',
    });
    DataService.deleteFeeStructure(id);
    return res;
  }

  async togglePublishFeeStructure(id, isPublished) {
    const res = await this.request(`/fee-structure/${id}/publish`, {
      method: 'PATCH',
      body: JSON.stringify({ isPublished }),
    });
    if (res && res.data) {
      DataService.togglePublishFeeStructure(id, isPublished);
      return res.data;
    }
    return res;
  }

  // =========================================================================
  // 8. COURSE SPECIFICATIONS (PUBLIC & ADMIN)
  // =========================================================================
  async getPublicCourses(sessionOrParams = '2026-27') {
    const raw =
      typeof sessionOrParams === 'object' && sessionOrParams !== null
        ? sessionOrParams.session || sessionOrParams.academicSession || '2026-27'
        : sessionOrParams || '2026-27';
    const session = normalizeAcademicSession(raw) || '2026-27';

    try {
      const query = session && session !== 'all' ? `?session=${encodeURIComponent(session)}` : '';
      const res = await this.request(`/courses${query}`);
      if (res && res.data) {
        return Array.isArray(res.data) ? res.data : (res.data.items || res.data);
      }
    } catch {
      // Offline fallback
    }
    return DataService.getCourses(true, session);
  }

  async getAdminCourses(sessionOrParams = '2026-27') {
    const raw =
      typeof sessionOrParams === 'object' && sessionOrParams !== null
        ? sessionOrParams.session || sessionOrParams.academicSession || '2026-27'
        : sessionOrParams || '2026-27';
    const session = normalizeAcademicSession(raw) || '2026-27';

    try {
      const query = session && session !== 'all' ? `?session=${encodeURIComponent(session)}` : '';
      const res = await this.request(`/courses/admin${query}`);
      if (res && res.data) {
        return Array.isArray(res.data) ? res.data : (res.data.items || res.data);
      }
    } catch {
      // Offline fallback
    }
    return DataService.getCourses(false, session);
  }

  async getCourseById(id) {
    try {
      const res = await this.request(`/courses/${id}`);
      if (res && res.data) return res.data;
    } catch {
      // Offline fallback
    }
    return DataService.getCourseById(id);
  }

  async createCourse(data) {
    const res = await this.request('/courses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (res && res.data) {
      DataService.saveCourse(res.data);
      return res.data;
    }
    return res;
  }

  async updateCourse(id, data) {
    const res = await this.request(`/courses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    if (res && res.data) {
      DataService.saveCourse(res.data);
      return res.data;
    }
    return res;
  }

  async deleteCourse(id) {
    const res = await this.request(`/courses/${id}`, {
      method: 'DELETE',
    });
    DataService.deleteCourse(id);
    return res;
  }

  async togglePublishCourse(id, isPublished) {
    const res = await this.request(`/courses/${id}/publish`, {
      method: 'PATCH',
      body: JSON.stringify({ isPublished }),
    });
    if (res && res.data) {
      DataService.togglePublishCourse(id, isPublished);
      return res.data;
    }
    return res;
  }
}

export const api = new ApiClient();
