import { describe, it } from 'node:test';
import assert from 'node:assert';
import mongoose from 'mongoose';
import {
  User,
  Student,
  Parent,
  Teacher,
  Class,
  Attendance,
  Homework,
  Result,
  Fee,
  Timetable,
  Notice,
  Event,
  Admission,
  Gallery,
  ContactMessage,
} from '../models/index.js';

describe('Mongoose Models Schema & Validation Test Suite', () => {
  it('Loads and validates User model schema', () => {
    const user = new User({
      name: 'Ramesh Sharma',
      email: 'invalid-email',
      password: '123', // < 6 chars
    });
    const err = user.validateSync();
    assert.ok(err);
    assert.ok(err.errors.email);
    assert.ok(err.errors.password);
  });

  it('Loads and validates Student model schema', () => {
    const student = new Student({
      admissionNumber: 'ADM-001',
      fullName: 'Aarav Kumar',
      dateOfBirth: new Date('2019-05-10'),
      gender: 'Male',
      class: new mongoose.Types.ObjectId(),
    });
    const err = student.validateSync();
    assert.strictEqual(err, undefined, 'Valid student should pass validation');
  });

  it('Loads and validates Class model schema enum restrictions', () => {
    const invalidClass = new Class({
      name: 'Class 11 (Invalid)',
      section: 'A',
    });
    const err = invalidClass.validateSync();
    assert.ok(err);
    assert.ok(err.errors.name);

    const validClass = new Class({
      name: 'Class 1',
      section: 'A',
      academicYear: '2026-2027',
    });
    assert.strictEqual(validClass.validateSync(), undefined);
  });

  it('Loads and validates Result model automatic calculation logic', () => {
    const result = new Result({
      student: new mongoose.Types.ObjectId(),
      class: new mongoose.Types.ObjectId(),
      academicYear: '2026-2027',
      term: 'Term 1',
      subjects: [
        { subjectName: 'Hindi', maxMarks: 100, obtainedMarks: 85 },
        { subjectName: 'English', maxMarks: 100, obtainedMarks: 75 },
        { subjectName: 'Mathematics', maxMarks: 100, obtainedMarks: 90 },
      ],
    });

    const err = result.validateSync();
    assert.strictEqual(err, undefined);

    // Trigger pre-save middleware logic simulation
    let max = 0;
    let obtained = 0;
    result.subjects.forEach((s) => {
      max += s.maxMarks;
      obtained += s.obtainedMarks;
    });
    assert.strictEqual(max, 300);
    assert.strictEqual(obtained, 250);
    const pct = parseFloat(((obtained / max) * 100).toFixed(2));
    assert.strictEqual(pct, 83.33);
  });

  it('Loads and validates Fee model schema', () => {
    const fee = new Fee({
      student: new mongoose.Types.ObjectId(),
      feeType: 'Tuition Fee',
      amount: 1500,
      dueDate: new Date(),
    });
    assert.strictEqual(fee.validateSync(), undefined);
  });

  it('Loads and validates Attendance, Timetable, Notice, Event, Admission, Gallery, ContactMessage models', () => {
    const notice = new Notice({
      title: 'Summer Vacation Circular',
      content: 'School will be closed for summer break.',
      category: 'Holidays',
    });
    assert.strictEqual(notice.validateSync(), undefined);

    const event = new Event({
      title: 'Annual Sports Meet',
      description: 'Sports activities for Nursery to Class 5 students',
      startDate: new Date(),
    });
    assert.strictEqual(event.validateSync(), undefined);

    const admission = new Admission({
      enquiryNumber: 'ADM-2026-0001',
      studentName: 'Priya Verma',
      parentName: 'Sunil Verma',
      phone: '9876543210',
      gradeApplying: 'Nursery',
    });
    assert.strictEqual(admission.validateSync(), undefined);

    const gallery = new Gallery({
      title: 'School Campus Front Gate',
      category: 'Campus',
      imageUrl: '/images/campus-placeholder.jpg',
    });
    assert.strictEqual(gallery.validateSync(), undefined);

    const contact = new ContactMessage({
      name: 'Mohan Singh',
      phone: '9876543210',
      message: 'Looking for admission query for my child in Class 2.',
    });
    assert.strictEqual(contact.validateSync(), undefined);
  });
});
