import { LiveChatSettings } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

import { prisma } from '@mediature/main/prisma/client';
import {
  CancelInvitationSchema,
  GetInterfaceSessionSchema,
  GetLiveChatSettingsSchema,
  GetProfileSchema,
  GetPublicFacingInvitationSchema,
  UpdateProfileSchema,
} from '@mediature/main/src/models/actions/user';
import { InvitationStatusSchema, PublicFacingInvitationSchema } from '@mediature/main/src/models/entities/invitation';
import { UserInterfaceSessionSchema } from '@mediature/main/src/models/entities/ui';
import { LiveChatSettingsSchema, LiveChatSettingsSchemaType } from '@mediature/main/src/models/entities/user';
import { isUserMainAgentOfAuthority } from '@mediature/main/src/server/routers/agent';
import { isUserAnAdmin } from '@mediature/main/src/server/routers/authority';
import { attachmentIdPrismaToModel, userPrismaToModel } from '@mediature/main/src/server/routers/mappers';
import { privateProcedure, publicProcedure, router } from '@mediature/main/src/server/trpc';
import { signEmail } from '@mediature/main/src/utils/crisp';

export const userRouter = router({
  getPublicFacingInvitation: publicProcedure.input(GetPublicFacingInvitationSchema).query(async ({ ctx, input }) => {
    const invitation = await prisma.invitation.findFirst({
      where: {
        token: input.token,
      },
      include: {
        issuer: true,
      },
    });

    if (!invitation) {
      throw new Error(`le jeton d'invitation fournit n'est pas valide`);
    } else if (invitation.status !== InvitationStatusSchema.Values.PENDING) {
      throw new Error(`le jeton d'invitation n'est plus utilisable`);
    }

    return {
      invitation: PublicFacingInvitationSchema.parse({
        inviteeEmail: invitation.inviteeEmail,
        inviteeFirstname: invitation.inviteeFirstname,
        inviteeLastname: invitation.inviteeLastname,
        issuer: {
          id: invitation.issuer.id,
          email: invitation.issuer.email,
          firstname: invitation.issuer.firstname,
          lastname: invitation.issuer.lastname,
        },
        status: invitation.status,
      }),
    };
  }),
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
    return { user: userPrismaToModel(user) };
  }),
  getProfile: privateProcedure.input(GetProfileSchema).query(async ({ ctx, input }) => {
    const user = await prisma.user.findUnique({
      where: {
        id: ctx.user.id,
      },
    });

    if (!user) {
      throw new Error(`cet utilisateur n'existe pas`);
    }

    // TODO: exclude hashed password
    return { user: userPrismaToModel(user) };
  }),
  getInterfaceSession: privateProcedure.input(GetInterfaceSessionSchema).query(async ({ ctx, input }) => {
    const user = await prisma.user.findUnique({
      where: {
        id: ctx.user.id,
      },
      include: {
        Admin: true,
        Agent: {
          include: {
            authority: true,
          },
        },
      },
    });

    if (!user) {
      return {
        session: UserInterfaceSessionSchema.parse({
          agentOf: [],
          isAdmin: false,
        }),
      };
    }

    return {
      session: UserInterfaceSessionSchema.parse({
        agentOf: await Promise.all(
          user.Agent.map(async (agent) => {
            return {
              id: agent.authority.id,
              logo: await attachmentIdPrismaToModel(agent.authority.logoAttachmentId),
              name: agent.authority.name,
              slug: agent.authority.slug,
              isMainAgent: agent.id === agent.authority.mainAgentId,
            };
          })
        ),
        isAdmin: !!user.Admin,
      }),
    };
  }),
  getLiveChatSettings: privateProcedure.input(GetLiveChatSettingsSchema).query(async ({ ctx, input }) => {
    const user = await prisma.user.findUnique({
      where: {
        id: ctx.user.id,
      },
      include: {
        LiveChatSettings: true,
      },
    });

    let settings: LiveChatSettings;
    if (!user) {
      throw new Error(`cet utilisateur n'existe pas`);
    } else if (!user.LiveChatSettings) {
      // It has never been initialized, so we do it
      settings = await prisma.liveChatSettings.create({
        data: {
          sessionToken: uuidv4(),
          user: {
            connect: {
              id: user.id,
            },
          },
        },
      });
    } else {
      settings = user.LiveChatSettings;
    }

    return {
      settings: LiveChatSettingsSchema.parse({
        userId: user.id,
        email: user.email,
        emailSignature: signEmail(user.email),
        firstname: user.firstname,
        lastname: user.lastname,
        sessionToken: settings.sessionToken,
      }),
    };
  }),
  cancelInvitation: privateProcedure.input(CancelInvitationSchema).mutation(async ({ ctx, input }) => {
    const invitation = await prisma.invitation.findUnique({
      where: {
        id: input.invitationId,
      },
      include: {
        AgentInvitation: true,
        AdminInvitation: true,
      },
    });

    if (!invitation) {
      throw new Error(`l'invitation spécifiée n'existe pas`);
    }

    if (invitation.status !== InvitationStatusSchema.Values.PENDING) {
      throw new Error(`l'invitation spécifiée ne peut pas être annulée`);
    }

    if (invitation.AgentInvitation) {
      if (!(await isUserAnAdmin(ctx.user.id)) && !(await isUserMainAgentOfAuthority(invitation.AgentInvitation.authorityId, ctx.user.id))) {
        throw new Error(`vous devez être médiateur principal de la collectivité ou administrateur pour effectuer cette action`);
      }
    } else {
      if (!(await isUserAnAdmin(ctx.user.id))) {
        throw new Error(`vous devez être un administrateur pour effectuer cette action`);
      }
    }

    const canceledInvitation = await prisma.invitation.update({
      where: {
        id: invitation.id,
      },
      data: {
        status: InvitationStatusSchema.Values.CANCELED,
      },
    });
  }),
});
