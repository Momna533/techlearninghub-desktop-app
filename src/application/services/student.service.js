import {
    findStudents,
    findStudentById,
    findStudentByCode,
    createStudent as insertStudent,
    updateStudent as updateStudentRecord,
    deactivateStudent as deactivateStudentRecord
} from '../../infrastructure/database/student.repository.js';

function validateStudent(student) {
    const errors = {};

    if (!student.studentCode?.trim()) {
        errors.studentCode = 'Student ID is required.';
    }

    if (!student.firstName?.trim()) {
        errors.firstName = 'First name is required.';
    }

    if (!student.lastName?.trim()) {
        errors.lastName = 'Last name is required.';
    }

    if (!student.guardianName?.trim()) {
        errors.guardianName = 'Guardian/father name is required.';
    }

    if (!student.phone?.trim()) {
        errors.phone = 'Phone number is required.';
    }

    if (student.email?.trim()) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(student.email.trim())) {
            errors.email = 'Enter a valid email address.';
        }
    }

    const allowedStatuses = [
        'active',
        'inactive',
        'graduated',
        'withdrawn'
    ];

    if (!allowedStatuses.includes(student.status)) {
        errors.status = 'Invalid student status.';
    }

    return errors;
}

export function getStudents(filters = {}) {
    return findStudents(filters);
}

export function getStudent(id) {
    const student = findStudentById(id);

    if (!student) {
        throw new Error('Student not found.');
    }

    return student;
}

export function createStudent(student) {
    const errors = validateStudent(student);

    if (Object.keys(errors).length > 0) {
        const error = new Error('Validation failed.');
        error.code = 'VALIDATION_ERROR';
        error.details = errors;

        throw error;
    }

    const existingStudent = findStudentByCode(
        student.studentCode.trim()
    );

    if (existingStudent) {
        const error = new Error(
            'Student ID already exists.'
        );

        error.code = 'DUPLICATE_STUDENT_ID';

        throw error;
    }

    return insertStudent({
        ...student,
        studentCode: student.studentCode.trim(),
        firstName: student.firstName.trim(),
        lastName: student.lastName.trim(),
        guardianName: student.guardianName.trim(),
        phone: student.phone.trim(),
        email: student.email?.trim() || null,
        guardianPhone: student.guardianPhone?.trim() || null,
        address: student.address?.trim() || null,
        dateOfBirth: student.dateOfBirth || null,
        notes: student.notes?.trim() || null
    });
}


export function updateStudent(id, student) {
    const existingStudent = findStudentById(id);

    if (!existingStudent) {
        throw new Error('Student not found.');
    }

    const errors = validateStudent(student);

    if (Object.keys(errors).length > 0) {
        const error = new Error('Validation failed.');
        error.code = 'VALIDATION_ERROR';
        error.details = errors;

        throw error;
    }

    const duplicate = findStudentByCode(
        student.studentCode.trim()
    );

    if (duplicate && duplicate.id !== id) {
        const error = new Error(
            'Student ID already exists.'
        );

        error.code = 'DUPLICATE_STUDENT_ID';

        throw error;
    }

    return updateStudentRecord(id, {
        ...student,
        studentCode: student.studentCode.trim(),
        firstName: student.firstName.trim(),
        lastName: student.lastName.trim(),
        guardianName: student.guardianName.trim(),
        phone: student.phone.trim(),
        email: student.email?.trim() || null,
        guardianPhone: student.guardianPhone?.trim() || null,
        address: student.address?.trim() || null,
        dateOfBirth: student.dateOfBirth || null,
        notes: student.notes?.trim() || null
    });
}


export function deactivateStudent(id) {
    const student = findStudentById(id);

    if (!student) {
        throw new Error('Student not found.');
    }

    if (student.status === 'inactive') {
        throw new Error('Student is already inactive.');
    }

    return deactivateStudentRecord(id);
}