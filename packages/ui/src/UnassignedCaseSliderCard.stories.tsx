import { Meta, StoryFn } from '@storybook/react';
import { within } from '@storybook/testing-library';
import addHours from 'date-fns/addHours';

import { StoryHelperFactory } from '@mediature/docs/.storybook/helpers';
import { uiAttachments } from '@mediature/main/src/fixtures/attachment';
import { cases } from '@mediature/main/src/fixtures/case';
import { citizens } from '@mediature/main/src/fixtures/citizen';
import { CaseSchema } from '@mediature/main/src/models/entities/case';
import { UnassignedCaseSliderCard } from '@mediature/ui/src/UnassignedCaseSliderCard';

type ComponentType = typeof UnassignedCaseSliderCard;
const { generateMetaDefault, prepareStory } = StoryHelperFactory<ComponentType>();

export default {
  title: 'Components/UnassignedCaseSliderCard',
  component: UnassignedCaseSliderCard,
  ...generateMetaDefault({
    parameters: {},
  }),
} as Meta<ComponentType>;

async function playFindElement(canvasElement: HTMLElement): Promise<HTMLElement> {
  return await within(canvasElement).findByText(/avancement du dossier/i);
}

const Template: StoryFn<ComponentType> = (args) => {
  return <UnassignedCaseSliderCard {...args} />;
};

const NormalStory = Template.bind({});
NormalStory.args = {
  caseLink: '',
  case: cases[0],
  citizen: citizens[0],
  attachments: uiAttachments,
  assignAction: async () => {},
};
NormalStory.play = async ({ canvasElement }) => {
  await playFindElement(canvasElement);
};

export const Normal = prepareStory(NormalStory);

const ReminderSoonStory = Template.bind({});
ReminderSoonStory.args = {
  caseLink: '',
  case: CaseSchema.parse({ ...cases[0], termReminderAt: addHours(new Date(), 3) }),
  citizen: citizens[0],
  attachments: uiAttachments,
  assignAction: async () => {},
};
ReminderSoonStory.play = async ({ canvasElement }) => {
  await playFindElement(canvasElement);
};

export const ReminderSoon = prepareStory(ReminderSoonStory);
