import { UserRoles } from "../../generated/prisma/enums";

export interface IRequestUser {
  userId: string;
  role: UserRoles;
  email: string;
}