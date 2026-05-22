import { UserRoles } from "../../generated/prisma/enums";
import { auth } from "../lib/auth";
import { prisma } from "../lib/prisma";

export const seedAdmin = async () => {
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@gmail.com";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "123456Aa";

  try {
    const isAdminExist = await prisma.user.findFirst({
      where: {
        email: adminEmail,
        role: UserRoles.ADMIN
      }
    })

    if (isAdminExist) {
      console.log("Admin already exists. Skipping admin seeding.");
      return;
    }

    const adminUser = await auth.api.signUpEmail({
      body: {
        email: adminEmail,
        password: adminPassword,
        name: "Admin",
        role: UserRoles.ADMIN,
      }
    })

    if (adminUser.user) {
      await prisma.user.update({
        where: {
          id: adminUser.user.id
        },
        data: {
          emailVerified: true,
        }
      });
    }

    const seededAdmin = await prisma.user.findFirst({
      where: {
        email: adminEmail,
        role: UserRoles.ADMIN
      }
    })

    console.log("Admin created", seededAdmin);
  } 
  
  catch (error) {
    console.error("Error seeding admin: ", error);
  }
}