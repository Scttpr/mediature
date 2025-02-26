import { generateMock } from '@anatine/zod-mock';
import { Meta, StoryFn } from '@storybook/react';

import { StoryHelperFactory } from '@mediature/docs/.storybook/helpers';
import { playFindForm } from '@mediature/docs/.storybook/testing';
import { SignUpForm } from '@mediature/main/src/app/(visitor-only)/auth/sign-up/SignUpForm';
import { SignUpPrefillSchema } from '@mediature/main/src/models/actions/auth';
import { UserSchema } from '@mediature/main/src/models/entities/user';
import { getTRPCMock } from '@mediature/main/src/server/mock/trpc';

type ComponentType = typeof SignUpForm;
const { generateMetaDefault, prepareStory } = StoryHelperFactory<ComponentType>();

export default {
  title: 'Forms/SignUp',
  component: SignUpForm,
  ...generateMetaDefault({
    parameters: {},
  }),
} as Meta<ComponentType>;

const defaultMswParameters = {
  msw: {
    handlers: [
      getTRPCMock({
        type: 'mutation',
        path: ['signUp'],
        response: {
          user: generateMock(UserSchema),
        },
      }),
    ],
  },
};

const Template: StoryFn<ComponentType> = (args) => {
  return <SignUpForm {...args} />;
};

const EmptyStory = Template.bind({});
EmptyStory.args = {
  prefill: SignUpPrefillSchema.parse({
    invitationToken: 'abc',
  }),
};
EmptyStory.parameters = { ...defaultMswParameters };
EmptyStory.play = async ({ canvasElement }) => {
  await playFindForm(canvasElement);
};

export const Empty = prepareStory(EmptyStory);

const FilledStory = Template.bind({});
FilledStory.args = {
  prefill: SignUpPrefillSchema.parse({
    invitationToken: 'abc',
    email: 'jean@france.fr',
    password: 'mypassword',
    firstname: 'Jean',
    lastname: 'Derrien',
    termsAccepted: true,
  }),
};
FilledStory.parameters = { ...defaultMswParameters };
FilledStory.play = async ({ canvasElement }) => {
  await playFindForm(canvasElement);
};

export const Filled = prepareStory(FilledStory);
