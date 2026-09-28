import axios from 'axios';
import {
  OverviewData,
  PaginatedLearnersResponse,
  LearnerDetail,
  CourseItem,
  CourseDetailResponse,
  EngagementPageData,
  RiskPageData,
  InterventionCenterData,
  ModelMetricsData,
  FeatureImportanceItem,
  ValidationSummary
} from '../types';

const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

export const api = {
  // Overview
  getOverview: async (): Promise<OverviewData> => {
    const res = await apiClient.get<OverviewData>('/overview');
    return res.data;
  },

  // Learners
  getLearners: async (params: {
    course_id?: string;
    completion_status?: string;
    risk_level?: string;
    engagement_level?: string;
    search?: string;
    sort_by?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedLearnersResponse> => {
    const res = await apiClient.get<PaginatedLearnersResponse>('/learners', { params });
    return res.data;
  },

  getLearnerDetail: async (learnerId: string): Promise<LearnerDetail> => {
    const res = await apiClient.get<LearnerDetail>(`/learners/${learnerId}`);
    return res.data;
  },

  // Courses
  getCourses: async (sortBy = 'completion_rate', order = 'desc'): Promise<CourseItem[]> => {
    const res = await apiClient.get<CourseItem[]>('/courses', {
      params: { sort_by: sortBy, order }
    });
    return res.data;
  },

  getCourseDetail: async (courseId: string): Promise<CourseDetailResponse> => {
    const res = await apiClient.get<CourseDetailResponse>(`/courses/${courseId}`);
    return res.data;
  },

  // Engagement
  getEngagement: async (): Promise<EngagementPageData> => {
    const res = await apiClient.get<EngagementPageData>('/engagement');
    return res.data;
  },

  // Risk
  getDropoutRisk: async (params?: { course_id?: string; limit_learners?: number }): Promise<RiskPageData> => {
    const res = await apiClient.get<RiskPageData>('/dropout-risk', { params });
    return res.data;
  },

  // Interventions
  getInterventions: async (params?: { category?: string; priority?: string; limit?: number }): Promise<InterventionCenterData> => {
    const res = await apiClient.get<InterventionCenterData>('/interventions', { params });
    return res.data;
  },

  takeInterventionAction: async (learnerId: string, action: string): Promise<{ success: boolean; message: string }> => {
    const res = await apiClient.post(`/interventions/${learnerId}/action`, { action });
    return res.data;
  },

  // Model
  getModelMetrics: async (): Promise<ModelMetricsData> => {
    const res = await apiClient.get<ModelMetricsData>('/model/metrics');
    return res.data;
  },

  getModelFeatures: async (): Promise<FeatureImportanceItem[]> => {
    const res = await apiClient.get<FeatureImportanceItem[]>('/model/features');
    return res.data;
  },

  retrainModel: async (): Promise<{ success: boolean; message: string; metrics: ModelMetricsData }> => {
    const res = await apiClient.post('/model/train');
    return res.data;
  },

  // CSV Upload
  uploadCsv: async (file: File): Promise<ValidationSummary> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiClient.post<ValidationSummary>('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return res.data;
  }
};
