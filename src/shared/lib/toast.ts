import { toast } from "sonner";

export function toastSuccess(message: string) {
  toast.success(message);
}

export function toastError(
  error: Error | string | { message?: string; fieldErrors?: Record<string, string> },
) {
  let msg: string;

  if (typeof error === "string") {
    msg = error;
  } else {
    // Maydon xatosi aniq sababni biladi ("Bu nom allaqachon mavjud") — umumiy
    // "Ma'lumotlar noto'g'ri to'ldirilgan" dan ko'ra foydaliroq.
    const fieldError =
      "fieldErrors" in error && error.fieldErrors
        ? Object.values(error.fieldErrors).find((value) => Boolean(value))
        : undefined;
    msg = fieldError ?? error.message ?? "Noma'lum xatolik yuz berdi";
  }

  toast.error(msg);
}

export function toastInfo(message: string) {
  toast.info(message);
}
