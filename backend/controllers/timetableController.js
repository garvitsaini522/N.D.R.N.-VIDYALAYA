import { Timetable } from '../models/Timetable.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';

export async function getTimetable(req, res, next) {
  try {
    const { classId } = req.params;
    const { day } = req.query;

    const query = { class: classId };
    if (day) query.dayOfWeek = day;

    const schedule = await Timetable.find(query)
      .populate('periods.teacher', 'fullName email')
      .sort({ dayOfWeek: 1 });

    return ApiResponse.success(res, schedule, 'Class timetable schedule retrieved');
  } catch (error) {
    next(error);
  }
}

export async function setTimetable(req, res, next) {
  try {
    const { classId } = req.params;
    const { dayOfWeek, periods } = req.body;

    const schedule = await Timetable.findOneAndUpdate(
      { class: classId, dayOfWeek },
      { class: classId, dayOfWeek, periods },
      { new: true, upsert: true, runValidators: true }
    );

    return ApiResponse.success(res, schedule, 'Timetable updated successfully');
  } catch (error) {
    next(error);
  }
}
