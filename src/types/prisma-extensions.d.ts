import { Prisma, User } from '@prisma/client';

declare global {
  namespace PrismaJson {
    // Extend the User type to include resetToken and resetTokenExpires
    interface UserExtensions {
      resetToken?: string | null;
      resetTokenExpires?: Date | null;
    }

    // Extend the User type
    type ExtendedUser = User & UserExtensions;
  }
}

// Augment the Prisma namespace
declare module '@prisma/client' {
  interface User extends PrismaJson.UserExtensions {}
}

export {};
