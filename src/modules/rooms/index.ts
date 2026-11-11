/**
 * Rooms moduli — PUBLIC API.
 */
export {
  roomKeys,
  useRoomList,
  useRoomDetail,
  useRoomCreate,
  useRoomUpdate,
  useRoomDelete,
} from "./api/room-queries";
export type { Room, RoomListParams } from "./model/types";
export type { RoomValues } from "./model/schemas";
export { roomSchema, roomPayload } from "./model/schemas";
export { roomApi } from "./api/room-api";
export { RoomForm } from "./ui/room-form";
export { RoomTable } from "./ui/room-table";
