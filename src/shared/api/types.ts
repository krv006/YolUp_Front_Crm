export interface DrfErrorPayload {
  detail?: unknown;
  non_field_errors?: unknown[];
  [key: string]: unknown;
}

export interface ApiError {
  status: number;
  message: string;
  payload?: DrfErrorPayload;
  fieldErrors?: Record<string, string>;
}

export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ListParams {
  page?: number;
  page_size?: number;
  search?: string;
}

/**
 * What a list request actually carries: paging + search + `ordering` (DRF)
 * plus any exact-match filter the screen adds (status, branch_id, …).
 * `useListState` produces exactly this shape.
 */
export interface ListQueryParams extends ListParams {
  ordering?: string;
  [key: string]: string | number | boolean | undefined;
}
