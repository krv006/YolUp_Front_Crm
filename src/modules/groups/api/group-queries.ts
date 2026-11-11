import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { ApiError, ListQueryParams } from "@/shared/api";
import { toastSuccess, toastError } from "@/shared/lib";
import { groupApi, groupTeacherApi } from "./group-api";

export const groupKeys = {
  all: ["groups"] as const,
  list: (params: ListQueryParams) => [...groupKeys.all, "list", params] as const,
  detail: (id: string) => [...groupKeys.all, "detail", id] as const,
  teachers: (id: string) => [...groupKeys.all, "teachers", id] as const,
  students: (id: string) => [...groupKeys.all, "students", id] as const,
};

/**
 * Jadval/a'zolik o'zgarganda darslar va davomat ham eskiradi: yangi guruh
 * uchun darslar serverda generatsiya qilinadi, a'zolar soni esa dars
 * kartalarida ko'rinadi.
 */
function invalidateScheduleViews(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ["lessons"] });
  queryClient.invalidateQueries({ queryKey: ["attendance"] });
  queryClient.invalidateQueries({ queryKey: ["dashboard"] });
}

export function useGroupList(params: ListQueryParams) {
  return useQuery({
    queryKey: groupKeys.list(params),
    queryFn: () => groupApi.list(params),
  });
}

export function useGroupDetail(id: string) {
  return useQuery({
    queryKey: groupKeys.detail(id),
    queryFn: () => groupApi.get(id),
    enabled: Boolean(id),
  });
}

export function useGroupCreate(onDone?: () => void) {
  const queryClient = useQueryClient();
  return useMutation<unknown, ApiError, Record<string, unknown>>({
    mutationFn: (values) => groupApi.create(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupKeys.all });
      invalidateScheduleViews(queryClient);
      toastSuccess("Guruh yaratildi");
      onDone?.();
    },
    onError: (error) => toastError(error),
  });
}

export function useGroupUpdate(id: string, onDone?: () => void) {
  const queryClient = useQueryClient();
  return useMutation<unknown, ApiError, Record<string, unknown>>({
    mutationFn: (values) => groupApi.update(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupKeys.all });
      queryClient.invalidateQueries({ queryKey: groupKeys.detail(id) });
      invalidateScheduleViews(queryClient);
      toastSuccess("Guruh yangilandi");
      onDone?.();
    },
    onError: (error) => toastError(error),
  });
}

export function useGroupDelete(onDone?: () => void) {
  const queryClient = useQueryClient();
  return useMutation<unknown, ApiError, string>({
    mutationFn: (id) => groupApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupKeys.all });
      invalidateScheduleViews(queryClient);
      toastSuccess("Guruh o'chirildi");
      onDone?.();
    },
    onError: (error) => toastError(error),
  });
}

export function useGroupEnroll(id: string, onDone?: () => void) {
  const queryClient = useQueryClient();
  return useMutation<unknown, ApiError, Record<string, unknown>>({
    mutationFn: (values) => groupApi.enroll(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupKeys.all });
      queryClient.invalidateQueries({ queryKey: groupKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: groupKeys.students(id) });
      invalidateScheduleViews(queryClient);
      toastSuccess("O'quvchi guruhga qo'shildi");
      onDone?.();
    },
    onError: (error) => toastError(error),
  });
}

/* -------------------------------------------------------------------------- */
/*  Guruh o'qituvchilari                                                       */
/* -------------------------------------------------------------------------- */

export function useGroupTeachers(groupId: string) {
  return useQuery({
    queryKey: groupKeys.teachers(groupId),
    queryFn: () => groupTeacherApi.list(groupId),
    enabled: Boolean(groupId),
  });
}

export function useGroupTeacherCreate(groupId: string, onDone?: () => void) {
  const queryClient = useQueryClient();
  return useMutation<unknown, ApiError, Record<string, unknown>>({
    mutationFn: (values) => groupTeacherApi.create(groupId, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupKeys.teachers(groupId) });
      queryClient.invalidateQueries({ queryKey: groupKeys.all });
      invalidateScheduleViews(queryClient);
      toastSuccess("O'qituvchi biriktirildi");
      onDone?.();
    },
    onError: (error) => toastError(error),
  });
}

export function useGroupTeacherUpdate(groupId: string, onDone?: () => void) {
  const queryClient = useQueryClient();
  return useMutation<unknown, ApiError, { id: string; values: Record<string, unknown> }>({
    mutationFn: ({ id, values }) => groupTeacherApi.update(groupId, id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupKeys.teachers(groupId) });
      queryClient.invalidateQueries({ queryKey: groupKeys.all });
      invalidateScheduleViews(queryClient);
      toastSuccess("O'qituvchi ma'lumoti yangilandi");
      onDone?.();
    },
    onError: (error) => toastError(error),
  });
}

/**
 * Asosiy o'qituvchini almashtirish: avvalgi asosiy yordamchiga o'tadi, keyin
 * tanlangan o'qituvchi asosiy bo'ladi (guruhda doim bitta asosiy bo'ladi).
 */
export function useGroupTeacherSetMain(groupId: string, onDone?: () => void) {
  const queryClient = useQueryClient();
  return useMutation<unknown, ApiError, { teacherId: string; currentMainId?: string }>({
    mutationFn: async ({ teacherId, currentMainId }) => {
      if (currentMainId) {
        await groupTeacherApi.update(groupId, currentMainId, { role: "assistant" });
      }
      return groupTeacherApi.update(groupId, teacherId, { role: "main" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupKeys.teachers(groupId) });
      queryClient.invalidateQueries({ queryKey: groupKeys.all });
      invalidateScheduleViews(queryClient);
      toastSuccess("Asosiy o'qituvchi o'zgartirildi");
      onDone?.();
    },
    onError: (error) => toastError(error),
  });
}

export function useGroupTeacherDelete(groupId: string, onDone?: () => void) {
  const queryClient = useQueryClient();
  return useMutation<unknown, ApiError, string>({
    mutationFn: (teacherId) => groupTeacherApi.remove(groupId, teacherId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupKeys.teachers(groupId) });
      queryClient.invalidateQueries({ queryKey: groupKeys.all });
      invalidateScheduleViews(queryClient);
      toastSuccess("O'qituvchi olib tashlandi");
      onDone?.();
    },
    onError: (error) => toastError(error),
  });
}

/* -------------------------------------------------------------------------- */
/*  Guruh o'quvchilari (a'zolik)                                               */
/* -------------------------------------------------------------------------- */

export function useGroupStudents(groupId: string) {
  return useQuery({
    queryKey: groupKeys.students(groupId),
    queryFn: () => groupApi.students(groupId),
    enabled: Boolean(groupId),
  });
}

export function useGroupStudentUpdate(groupId: string, onDone?: () => void) {
  const queryClient = useQueryClient();
  return useMutation<unknown, ApiError, { id: string; values: Record<string, unknown> }>({
    mutationFn: ({ id, values }) => groupApi.updateStudent(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupKeys.students(groupId) });
      queryClient.invalidateQueries({ queryKey: groupKeys.detail(groupId) });
      invalidateScheduleViews(queryClient);
      toastSuccess("O'quvchi holati yangilandi");
      onDone?.();
    },
    onError: (error) => toastError(error),
  });
}

export function useGroupStudentRemove(groupId: string, onDone?: () => void) {
  const queryClient = useQueryClient();
  return useMutation<unknown, ApiError, string>({
    mutationFn: (enrollmentId) => groupApi.removeStudent(enrollmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupKeys.students(groupId) });
      queryClient.invalidateQueries({ queryKey: groupKeys.detail(groupId) });
      queryClient.invalidateQueries({ queryKey: groupKeys.all });
      invalidateScheduleViews(queryClient);
      toastSuccess("O'quvchi guruhdan chiqarildi");
      onDone?.();
    },
    onError: (error) => toastError(error),
  });
}
