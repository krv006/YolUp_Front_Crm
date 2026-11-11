/**
 * Parents moduli — PUBLIC API.
 */
export {
  parentKeys,
  useParentList,
  useParentDetail,
  useParentCreate,
  useParentUpdate,
  useParentDelete,
} from "./api/parent-queries";
export {
  parentStudentLinkKeys,
  useParentStudentLinks,
  useParentStudentLinkCreate,
  useParentStudentLinkRemove,
} from "./api/parent-queries";
export type { Parent, ParentListParams, ParentStudentLink } from "./model/types";
export type { ParentValues, ParentStudentLinkValues } from "./model/schemas";
export { parentSchema, parentPayload, parentStudentLinkSchema } from "./model/schemas";
export { parentApi, parentStudentLinkApi } from "./api/parent-api";
export { ParentForm } from "./ui/parent-form";
export { ParentTable } from "./ui/parent-table";
