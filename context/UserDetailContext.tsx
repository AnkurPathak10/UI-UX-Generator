import { createContext } from "react";

export type UserDetail = {
  id: number;
  name: string;
  email: string;
  credits: number;
} | null;

export const UserDetailContext = createContext<{
  userDetail: UserDetail;
  setUserDetail: React.Dispatch<React.SetStateAction<UserDetail>>;
}>({
  userDetail: null,
  setUserDetail: () => {},
});