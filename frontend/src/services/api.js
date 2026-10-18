/**
 * Student Management System - Frontend API Client
 * Built with native Fetch API and comprehensive error handling
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

/**
 * Helper to process HTTP responses
 */
async function handleResponse(response) {
  const isJson = response.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    const error = new Error(data?.error || `HTTP Error ${response.status}: ${response.statusText}`);
    error.status = response.status;
    error.details = data?.details || null;
    throw error;
  }

  return data;
}

/**
 * API methods
 */
export const api = {
  /**
   * Health check
   */
  async getHealth() {
    const res = await fetch(`${API_BASE_URL}/health`);
    return handleResponse(res);
  },

  /**
   * Dashboard stats
   */
  async getStats() {
    const res = await fetch(`${API_BASE_URL}/dashboard/stats`);
    return handleResponse(res);
  },

  /**
   * Get students with pagination, search, sorting, and filters
   */
  async getStudents(params = {}) {
    const query = new URLSearchParams();
    
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);
    if (params.search && params.search.trim()) query.append('search', params.search.trim());
    if (params.course && params.course !== 'All') query.append('course', params.course);
    if (params.status && params.status !== 'All') query.append('status', params.status);
    if (params.sortBy) query.append('sortBy', params.sortBy);
    if (params.sortOrder) query.append('sortOrder', params.sortOrder);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    const res = await fetch(`${API_BASE_URL}/students${queryString}`);
    return handleResponse(res);
  },

  /**
   * Get single student by ID
   */
  async getStudentById(id) {
    const res = await fetch(`${API_BASE_URL}/students/${encodeURIComponent(id)}`);
    return handleResponse(res);
  },

  /**
   * Create a new student
   */
  async createStudent(studentData) {
    const res = await fetch(`${API_BASE_URL}/students`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(studentData)
    });
    return handleResponse(res);
  },

  /**
   * Update student by ID
   */
  async updateStudent(id, studentData) {
    const res = await fetch(`${API_BASE_URL}/students/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(studentData)
    });
    return handleResponse(res);
  },

  /**
   * Delete student by ID
   */
  async deleteStudent(id) {
    const res = await fetch(`${API_BASE_URL}/students/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
    return handleResponse(res);
  }
};
