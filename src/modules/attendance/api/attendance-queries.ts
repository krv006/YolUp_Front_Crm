import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { ApiError } from "@/shared/api";
import { toastSuccess, toastError } from "@/shared/lib";
import type {
  AttendanceStatus,
  BulkAttendanceRequest,
  BulkAttendanceResult,
} from "../model/types";
import { attendanceApi, type AttendanceListParamsExtended } from "./attendance-api";

export const attendanceKeys = {
  all: ["attendance"] as const,
  list: (params: AttendanceListParamsExtended) => [...attendanceKeys.all, "list", params] as const,
  detail: (id: string) => [...attendanceKeys.all, "detail", id] as const,
  roster: (lessonId: string) => [...attendanceKeys.all, "roster", lessonId] as const,
};

export function useAttendanceList(params: AttendanceListParamsExtended) {
  return useQuery({
    queryKey: attendanceKeys.list(params),
    queryFn: () => attendanceApi.list(params),
  });
}

/** Bir darsdagi davomat ro'yxati — sahifada belgilash uchun. */
export function useLessonRoster(lessonId: string) {
  return useQuery({
    queryKey: attendanceKeys.roster(lessonId),
    queryFn: () => attendanceApi.roster(lessonId),
    enabled: Boolean(lessonId),
  });
}

export function useAttendanceDetail(id: string) {
  return useQuery({
    queryKey: attendanceKeys.detail(id),
    queryFn: () => attendanceApi.get(id),
    enabled: Boolean(id),
  });
}

export function useAttendanceBulk(onDone?: () => void) {
  const queryClient = useQueryClient();
  return useMutation<BulkAttendanceResult, ApiError, BulkAttendanceRequest>({
    mutationFn: (body) => attendanceApi.bulk(body),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.all });
      // Darsning "belgilangan" holati ham yangilanadi.
      queryClient.invalidateQueries({ queryKey: ["lessons"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toastSuccess(
        result?.saved ? `${result.saved} ta o'quvchi davomati saqlandi` : "Davomat saqlandi",
      );
      onDone?.();
    },
    onError: (error) => toastError(error),
  });
}

export function useAttendanceUpdate(id: string, onDone?: () => void) {
  const queryClient = useQueryClient();
  return useMutation<unknown, ApiError, Record<string, unknown>>({
    mutationFn: (values) => attendanceApi.update(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.all });
      queryClient.invalidateQueries({ queryKey: attendanceKeys.detail(id) });
      toastSuccess("Saqlandi");
      onDone?.();
    },
    onError: (error) => toastError(error),
  });
}

/** Jadvaldagi qatorda holatni bir bosishda o'zgartirish. */
export function useAttendanceSetStatus(onDone?: () => void) {
  const queryClient = useQueryClient();
  return useMutation<unknown, ApiError, { id: string; status: AttendanceStatus }>({
    mutationFn: ({ id, status }) => attendanceApi.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.all });
      toastSuccess("Davomat yangilandi");
      onDone?.();
    },
    onError: (error) => toastError(error),
  });
}
