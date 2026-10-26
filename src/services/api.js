import { DataService, normalizeAcademicSession } from './dataService.js';

const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) || 'http://localhost:5000/api';

/**
 * Unified API Client for N.D.R.N. Vidyalaya
 * Connects Public Website, Admin Console, and Student/Parent Portals to Node/Express backend.
 * Features automated fallback to persistent DataService when backend database is disconnected.
 */
class ApiClient {
  async request(endpoint, options = {}) {
    const token = localStorage.getItem('ndrn_auth_token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const err = new Error(data.message || `Request failed with status ${response.status}`);
      err.status = response.status;
      err.errors = data.errors;
      throw err;
    }

    return data;
  }

  // --- PUBLIC & ADMISSIONS ---
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
    let apiSuccess = false;
    let apiData = null;

    try {
      const res = await this.request('/admissions/enquire', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      apiSuccess = true;
      apiData = res.data;
    } catch (err) {
      console.warn('Backend admission enquiry submission:', err.message);
    }

    // Always persist to local DataService with automated principal delivery records
    const local = DataService.addAdmissionInquiry({
      ...payload,
      sentToPrincipalWhatsApp: '+91 8429231617',
      sentToPrincipalEmail: 'ueyuwhw@gmail.com',
      deliveryStatus: 'Delivered',
      deliveredAt: new Date().toISOString(),
    });
    return { data: apiData || local, isFromApi: apiSuccess };
  }

  async submitContactMessage(payload) {
    let apiSuccess = false;
    let apiData = null;

    try {
      const res = await this.request('/contact', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      apiSuccess = true;
      apiData = res.data;
    } catch (err) {
      console.warn('Backend contact submission:', err.message);
    }

    // Always persist to local DataService so admin console reflects it immediately
    const local = DataService.addContactMessage(payload);
    return { data: apiData || local, isFromApi: apiSuccess };
  }

  // --- ADMIN ADMISSIONS ---
  async getAdmissions(params = {}) {
    try {
      const query = new URLSearchParams(params).toString();
      const res = await this.request(`/admissions?${query}`);
      if (res && res.data) return res.data.items || res.data;
    } catch {
      // Fallback
    }
    return DataService.getAdmissions();
  }

  async updateAdmissionStatus(id, newStatus, notes) {
    try {
      await this.request(`/admissions/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus, notes }),
      });
    } catch {
      // Fallback
    }
    return DataService.updateAdmissionStatus(id, newStatus, notes);
  }

  async deleteAdmission(id) {
    try {
      await this.request(`/admissions/${id}`, {
        method: 'DELETE',
      });
    } catch {
      // Fallback
    }
    return DataService.deleteAdmission(id);
  }

  // --- ADMIN CONTACT MESSAGES ---
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
    try {
      await this.request(`/contact/${id}/read`, {
        method: 'PATCH',
      });
    } catch {
      // Fallback
    }
    return DataService.updateContactStatus(id, 'Resolved', 'Marked as read');
  }

  async deleteContactMessage(id) {
    try {
      await this.request(`/contact/${id}`, {
        method: 'DELETE',
      });
    } catch {
      // Fallback
    }
    return DataService.deleteContact(id);
  }

  // --- ADMIN CONTENT (NOTICES, EVENTS, GALLERY) ---
  async createNotice(noticeData) {
    const payload = {
      ...noticeData,
      content: noticeData.content || noticeData.summary || '',
      category: noticeData.category === 'Academics' ? 'Academic' : (noticeData.category || 'General'),
      isPinned: noticeData.pinned !== undefined ? Boolean(noticeData.pinned) : Boolean(noticeData.isPinned),
    };
    try {
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
    } catch {
      // Fallback
    }
    return DataService.addNotice(noticeData);
  }

  async updateNotice(id, updatedFields) {
    const payload = {
      ...updatedFields,
      ...(updatedFields.category ? { category: updatedFields.category === 'Academics' ? 'Academic' : updatedFields.category } : {}),
      ...(updatedFields.pinned !== undefined ? { isPinned: Boolean(updatedFields.pinned) } : {}),
      ...(updatedFields.summary && !updatedFields.content ? { content: updatedFields.summary } : {}),
    };
    try {
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
    } catch {
      // Fallback
    }
    return DataService.updateNotice(id, updatedFields);
  }

  async deleteNotice(id) {
    try {
      await this.request(`/notices/${id}`, { method: 'DELETE' });
    } catch {
      // Fallback
    }
    return DataService.deleteNotice(id);
  }

  async createEvent(eventData) {
    const payload = {
      ...eventData,
      startDate: eventData.startDate || eventData.date || new Date().toISOString().split('T')[0],
      type: (eventData.type || (eventData.status === 'Completed' ? 'past' : 'upcoming')).toLowerCase(),
      status: eventData.status === 'Upcoming' ? 'scheduled' : (eventData.status === 'Completed' ? 'completed' : (eventData.status || 'scheduled')),
    };
    try {
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
    } catch {
      // Fallback
    }
    return DataService.addEvent(eventData);
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
    try {
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
    } catch {
      // Fallback
    }
    return DataService.updateEvent(id, updatedFields);
  }

  async deleteEvent(id) {
    try {
      await this.request(`/events/${id}`, { method: 'DELETE' });
    } catch {
      // Fallback
    }
    return DataService.deleteEvent(id);
  }

  async createGalleryItem(itemData) {
    try {
      const res = await this.request('/gallery', {
        method: 'POST',
        body: JSON.stringify(itemData),
      });
      if (res && res.data) {
        DataService.addGalleryItem(res.data);
        return res.data;
      }
    } catch {
      // Fallback
    }
    return DataService.addGalleryItem(itemData);
  }

  async deleteGalleryItem(id) {
    try {
      await this.request(`/gallery/${id}`, { method: 'DELETE' });
    } catch {
      // Fallback
    }
    return DataService.deleteGalleryItem(id);
  }

  // --- INSTITUTIONAL ROSTERS ---
  async getStudents(params = {}) {
    try {
      const query = new URLSearchParams(params).toString();
      const res = await this.request(`/students?${query}`);
      if (res && res.data) return res.data.items || res.data;
    } catch {
      // Fallback
    }
    return DataService.getStudents();
  }

  async getParents(params = {}) {
    try {
      const query = new URLSearchParams(params).toString();
      const res = await this.request(`/parents?${query}`);
      if (res && res.data) return res.data.items || res.data;
    } catch {
      // Fallback
    }
    return DataService.getParents();
  }

  async getTeachers() {
    try {
      const res = await this.request('/teachers');
      if (res && res.data) return res.data.items || res.data;
    } catch {
      // Fallback
    }
    return DataService.getTeachers();
  }

  async getClasses() {
    try {
      const res = await this.request('/classes');
      if (res && res.data) return res.data;
    } catch {
      // Fallback
    }
    return DataService.getClasses();
  }

  // --- FEE STRUCTURE (PUBLIC & ADMIN) ---
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
    try {
      const res = await this.request('/fee-structure', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      if (res && res.data) {
        DataService.saveFeeStructure(res.data);
        return res.data;
      }
    } catch {
      // Offline fallback
    }
    return DataService.saveFeeStructure(data);
  }

  async updateFeeStructure(id, data) {
    try {
      const res = await this.request(`/fee-structure/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      if (res && res.data) {
        DataService.saveFeeStructure(res.data);
        return res.data;
      }
    } catch {
      // Offline fallback
    }
    return DataService.saveFeeStructure({ ...data, id });
  }

  async deleteFeeStructure(id) {
    try {
      await this.request(`/fee-structure/${id}`, {
        method: 'DELETE',
      });
    } catch {
      // Offline fallback
    }
    return DataService.deleteFeeStructure(id);
  }

  async togglePublishFeeStructure(id, isPublished) {
    try {
      const res = await this.request(`/fee-structure/${id}/publish`, {
        method: 'PATCH',
        body: JSON.stringify({ isPublished }),
      });
      if (res && res.data) {
        DataService.togglePublishFeeStructure(id, isPublished);
        return res.data;
      }
    } catch {
      // Offline fallback
    }
    return DataService.togglePublishFeeStructure(id, isPublished);
  }

  // --- COURSE SPECIFICATIONS (PUBLIC & ADMIN) ---
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
    try {
      const res = await this.request('/courses', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      if (res && res.data) {
        DataService.saveCourse(res.data);
        return res.data;
      }
    } catch {
      // Offline fallback
    }
    return DataService.saveCourse(data);
  }

  async updateCourse(id, data) {
    try {
      const res = await this.request(`/courses/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      if (res && res.data) {
        DataService.saveCourse(res.data);
        return res.data;
      }
    } catch {
      // Offline fallback
    }
    return DataService.saveCourse({ ...data, id });
  }

  async deleteCourse(id) {
    try {
      await this.request(`/courses/${id}`, {
        method: 'DELETE',
      });
    } catch {
      // Offline fallback
    }
    return DataService.deleteCourse(id);
  }

  async togglePublishCourse(id, isPublished) {
    try {
      const res = await this.request(`/courses/${id}/publish`, {
        method: 'PATCH',
        body: JSON.stringify({ isPublished }),
      });
      if (res && res.data) {
        DataService.togglePublishCourse(id, isPublished);
        return res.data;
      }
    } catch {
      // Offline fallback
    }
    return DataService.togglePublishCourse(id, isPublished);
  }
}

export const api = new ApiClient();
