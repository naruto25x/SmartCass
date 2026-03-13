import type { StudentInfo } from '@/data/types';

export function getStudentIdSortParts(studentId: string) {
  const digits = (studentId.match(/\d/g) || []).join('');
  const firstTwo = Number(digits.slice(0, 2) || '0');
  const lastThree = Number(digits.slice(-3) || '0');

  return { firstTwo, lastThree };
}

export function compareStudentByCustomId(a: StudentInfo, b: StudentInfo) {
  const aParts = getStudentIdSortParts(a.studentId);
  const bParts = getStudentIdSortParts(b.studentId);

  if (aParts.firstTwo !== bParts.firstTwo) {
    return bParts.firstTwo - aParts.firstTwo;
  }

  if (aParts.lastThree !== bParts.lastThree) {
    return aParts.lastThree - bParts.lastThree;
  }

  return a.studentId.localeCompare(b.studentId);
}