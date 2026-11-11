/**
 * Courses moduli — PUBLIC API.
 *
 * Kurs — mahsulot: narx, davomiylik, darslar soni va tavsif.
 * Guruhlar `course_id` orqali bog'lanadi (1 kurs → N guruh).
 */
export {
  courseKeys,
  useCourseList,
  useCourseDetail,
  useCourseCreate,
  useCourseUpdate,
  useCourseDelete,
} from "./api/course-queries";
export type { Course } from "./model/types";
export type { CourseValues } from "./model/schemas";
export { courseSchema, coursePayload } from "./model/schemas";
export { courseApi } from "./api/course-api";
export { CourseForm } from "./ui/course-form";
export { CourseTable } from "./ui/course-table";
export { CourseGroups } from "./ui/course-groups";
