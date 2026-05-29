import { prisma } from "../../lib/prisma";

const getAllUsers = async () => {
  const users = await prisma.user.findMany({
    where: {
      isDeleted: false
    },
  });
  return users;
};


export const UserService = {
  getAllUsers
};