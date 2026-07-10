import { IRequestUser } from "../../interfaces/requestUser.interface"
import { prisma } from "../../lib/prisma"
import { IEditMyProfilePayload } from "./myProfile.interface"

const editMyProfile = async (user: IRequestUser, payload: IEditMyProfilePayload) => {
  const isUserExists = await prisma.user.findUnique({
    where: {
      id: user.userId
    }
  });

  if(!isUserExists) {
    throw new Error("User not found");
  }

  const {name, image} = payload;

  await prisma.user.update({
    where: {
      id: user.userId
    },
    data: {
      name,
      image,
    }
  });
}

export const myProfileService = {
  editMyProfile
}