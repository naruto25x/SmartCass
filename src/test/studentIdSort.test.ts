import { describe, expect, it } from 'vitest';
import { compareStudentByCustomId, getStudentIdSortParts } from '@/lib/studentIdSort';
import type { StudentInfo } from '@/data/types';

function makeStudent(studentId: string): StudentInfo {
  return {
    id: studentId,
    name: studentId,
    studentId,
    department: 'CSE',
    university: 'DU',
    phone: '0',
    attendancePercentage: 0,
  };
}

describe('student id sort rules', () => {
  it('extracts first two and last three digits from id', () => {
    expect(getStudentIdSortParts('CSE-22-123')).toEqual({ firstTwo: 22, lastThree: 123 });
  });

  it('sorts same first two digits by last three ascending', () => {
    const sorted = ['CSE-22-124', 'CSE-22-123']
      .map(makeStudent)
      .sort(compareStudentByCustomId)
      .map(s => s.studentId);

    expect(sorted).toEqual(['CSE-22-123', 'CSE-22-124']);
  });

  it('sorts by first two digits descending before last three comparison', () => {
    const sorted = ['CSE-21-001', 'CSE-22-999', 'CSE-20-010']
      .map(makeStudent)
      .sort(compareStudentByCustomId)
      .map(s => s.studentId);

    expect(sorted).toEqual(['CSE-22-999', 'CSE-21-001', 'CSE-20-010']);
  });
});