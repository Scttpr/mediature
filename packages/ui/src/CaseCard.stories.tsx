import { Meta, StoryFn } from '@storybook/react';
import { within } from '@storybook/testing-library';

import { StoryHelperFactory } from '@mediature/docs/.storybook/helpers';
import { agents } from '@mediature/main/src/fixtures/agent';
import { cases } from '@mediature/main/src/fixtures/case';
import { citizens } from '@mediature/main/src/fixtures/citizen';
import { CaseCard } from '@mediature/ui/src/CaseCard';

type ComponentType = typeof CaseCard;
const { generateMetaDefault, prepareStory } = StoryHelperFactory<ComponentType>();

export default {
  title: 'Components/CaseCard',
  component: CaseCard,
  ...generateMetaDefault({
    parameters: {},
  }),
} as Meta<ComponentType>;

async function playFindElement(canvasElement: HTMLElement): Promise<HTMLElement> {
  return await within(canvasElement).findByText(/avancement du dossier/i);
}

const Template: StoryFn<ComponentType> = (args) => {
  return <CaseCard {...args} />;
};

const NormalStory = Template.bind({});
NormalStory.args = {
  caseLink: '',
  case: cases[0],
  citizen: citizens[0],
  agent: agents[0],
  assignAction: async () => {},
  unassignAction: async () => {},
};
NormalStory.play = async ({ canvasElement }) => {
  await playFindElement(canvasElement);
};

export const Normal = prepareStory(NormalStory);

const NotAssignedStory = Template.bind({});
NotAssignedStory.args = {
  caseLink: '',
  case: { ...cases[0], agentId: null },
  citizen: citizens[0],
  agent: undefined,
  assignAction: async () => {},
  unassignAction: async () => {},
};
NotAssignedStory.play = async ({ canvasElement }) => {
  await playFindElement(canvasElement);
};

export const NotAssigned = prepareStory(NotAssignedStory);
