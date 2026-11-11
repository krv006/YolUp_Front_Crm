/**
 * Groups moduli — PUBLIC API.
 *
 * Guruh — kurs bo'yicha o'quvchilar guruhi: o'qituvchilar (`/groups/{id}/teachers/`)
 * va a'zolar (`/groups/{id}/students/`) shu yerga bog'lanadi.
 */
export {
  groupKeys,
  useGroupList,
  useGroupDetail,
  useGroupCreate,
  useGroupUpdate,
  useGroupDelete,
  useGroupEnroll,
  useGroupTeachers,
  useGroupTeacherCreate,
  useGroupTeacherUpdate,
  useGroupTeacherSetMain,
  useGroupTeacherDelete,
  useGroupStudents,
  useGroupStudentUpdate,
  useGroupStudentRemove,
} from "./api/group-queries";
export type {
  Group,
  GroupListParams,
  GroupTeacher,
  GroupTeacherPayRule,
  GroupTeacherRole,
  GroupStudent,
} from "./model/types";
export type { GroupValues, GroupTeacherValues } from "./model/schemas";
export {
  groupSchema,
  groupPayload,
  groupTeacherSchema,
  groupTeacherPayload,
  payValueToInput,
  teacherPayLabel,
} from "./model/schemas";
export { groupApi, groupTeacherApi } from "./api/group-api";
export { GroupForm } from "./ui/group-form";
export { GroupFormSheet } from "./ui/group-form-sheet";
export { GroupCard } from "./ui/group-card";
export { GroupTable } from "./ui/group-table";
export { GroupTeachersPanel } from "./ui/group-teachers-panel";
export type { TeacherOption } from "./ui/group-teachers-panel";
export { GroupStudentsPanel } from "./ui/group-students-panel";
export type { StudentOption } from "./ui/group-students-panel";
export { PAY_RULE_LABELS, TEACHER_ROLE_LABELS } from "./model/labels";
