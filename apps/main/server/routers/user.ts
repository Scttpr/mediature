import { GetProfileSchema, UpdateProfileSchema } from '@mediature/main/models/actions/user';
import { prisma } from '@mediature/main/prisma/client';
import { privateProcedure, router } from '@mediature/main/server/trpc';

export const userRouter = router({
  updateProfile: privateProcedure.input(UpdateProfileSchema).mutation(async ({ ctx, input }) => {
    const user = await prisma.user.update({
      where: {
        id: ctx.user.id,
      },
      data: {
        firstname: input.firstname,
        lastname: input.lastname,
        profilePicture: input.profilePicture,
      },
    });

    // TODO: exclude hashed password
    return { user };
  }),
  getProfile: privateProcedure.input(GetProfileSchema).query(async ({ ctx, input }) => {
    const user = await prisma.user.findUnique({
      where: {
        id: ctx.user.id,
      },
    });

    // TODO: exclude hashed password
    return { user };
  }),
});
