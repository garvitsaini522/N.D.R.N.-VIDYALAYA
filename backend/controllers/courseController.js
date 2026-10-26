import { CourseService } from '../services/courseService.js';
import { ApiResponse } from '../utils/apiResponse.js';

export async function getPublishedCourses(req, res, next) {
  try {
    const rawSession = req.query.session || req.query.academicSession || '2026-27';
    const courses = await CourseService.getPublishedCourses(rawSession);
    return ApiResponse.success(res, courses, 'Published courses retrieved successfully');
  } catch (error) {
    next(error);
  }
}

export async function getAllCourses(req, res, next) {
  try {
    const rawSession = req.query.session || req.query.academicSession;
    const courses = await CourseService.getAllCourses(rawSession);
    return ApiResponse.success(res, courses, 'All courses retrieved successfully');
  } catch (error) {
    next(error);
  }
}

export async function getCourseById(req, res, next) {
  try {
    const course = await CourseService.getCourseById(req.params.id);
    return ApiResponse.success(res, course, 'Course details retrieved');
  } catch (error) {
    next(error);
  }
}

export async function createCourse(req, res, next) {
  try {
    const course = await CourseService.createCourse(req.body, req.user?.id);
    return ApiResponse.created(res, course, 'Course details created successfully');
  } catch (error) {
    next(error);
  }
}

export async function updateCourse(req, res, next) {
  try {
    const course = await CourseService.updateCourse(req.params.id, req.body, req.user?.id);
    return ApiResponse.success(res, course, 'Course details updated successfully');
  } catch (error) {
    next(error);
  }
}

export async function deleteCourse(req, res, next) {
  try {
    await CourseService.deleteCourse(req.params.id);
    return ApiResponse.success(res, null, 'Course details deleted successfully');
  } catch (error) {
    next(error);
  }
}

export async function togglePublish(req, res, next) {
  try {
    const { isPublished } = req.body;
    const course = await CourseService.togglePublishStatus(req.params.id, isPublished, req.user?.id);
    return ApiResponse.success(
      res,
      course,
      `Course details ${course.isPublished ? 'published' : 'unpublished'} successfully`
    );
  } catch (error) {
    next(error);
  }
}
