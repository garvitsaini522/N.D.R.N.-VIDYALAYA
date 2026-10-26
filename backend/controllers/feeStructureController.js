import { FeeStructureService } from '../services/feeStructureService.js';
import { ApiResponse } from '../utils/apiResponse.js';

export async function getPublishedFees(req, res, next) {
  try {
    const rawSession = req.query.session || req.query.academicSession || '2026-27';
    const fees = await FeeStructureService.getPublishedFeeStructures(rawSession);
    return ApiResponse.success(res, fees, 'Published fee structure retrieved successfully');
  } catch (error) {
    next(error);
  }
}

export async function getAllFees(req, res, next) {
  try {
    const rawSession = req.query.session || req.query.academicSession;
    const fees = await FeeStructureService.getAllFeeStructures(rawSession);
    return ApiResponse.success(res, fees, 'All fee structures retrieved successfully');
  } catch (error) {
    next(error);
  }
}

export async function getFeeById(req, res, next) {
  try {
    const fee = await FeeStructureService.getFeeStructureById(req.params.id);
    return ApiResponse.success(res, fee, 'Fee structure details retrieved');
  } catch (error) {
    next(error);
  }
}

export async function createFee(req, res, next) {
  try {
    const fee = await FeeStructureService.createFeeStructure(req.body, req.user?.id);
    return ApiResponse.created(res, fee, 'Fee structure created successfully');
  } catch (error) {
    next(error);
  }
}

export async function updateFee(req, res, next) {
  try {
    const fee = await FeeStructureService.updateFeeStructure(req.params.id, req.body, req.user?.id);
    return ApiResponse.success(res, fee, 'Fee structure updated successfully');
  } catch (error) {
    next(error);
  }
}

export async function deleteFee(req, res, next) {
  try {
    await FeeStructureService.deleteFeeStructure(req.params.id);
    return ApiResponse.success(res, null, 'Fee structure deleted successfully');
  } catch (error) {
    next(error);
  }
}

export async function togglePublish(req, res, next) {
  try {
    const { isPublished } = req.body;
    const fee = await FeeStructureService.togglePublishStatus(req.params.id, isPublished, req.user?.id);
    return ApiResponse.success(
      res,
      fee,
      `Fee structure ${fee.isPublished ? 'published' : 'unpublished'} successfully`
    );
  } catch (error) {
    next(error);
  }
}
