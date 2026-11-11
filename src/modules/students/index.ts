/**
 * Students moduli — PUBLIC API.
 */
export {
  studentKeys,
  useStudentList,
  useStudentDetail,
  useStudentCreate,
  useStudentUpdate,
  useStudentDelete,
} from "./api/student-queries";
export type { Student, StudentListParams } from "./model/types";
export type { StudentValues } from "./model/schemas";
export { studentSchema, studentPayload } from "./model/schemas";
export { studentApi } from "./api/student-api";
export { StudentForm } from "./ui/student-form";
export { StudentTable } from "./ui/student-table";
export { StudentDetail } from "./ui/student-detail";
