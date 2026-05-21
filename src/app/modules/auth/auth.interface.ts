import { UserRoles } from "../../../generated/prisma/enums";

export interface IRegisterUserPayload {
  name: string;
  email: string;
  password: string;
  role: UserRoles;
}

export interface ILoginUserPayload {
  email: string;
  password: string;
}