/* eslint-disable react/jsx-filename-extension */
/* eslint-disable no-undef */
/* eslint-disable max-len */
import React from 'react';
import {
  render, screen, cleanup,
} from '@testing-library/react-native';
import * as db from '../database/database';
import animations from '../utils/animations';
import AddPlan from './addPlan';
import colors from '../utils/colors';
import CONSTANT_STRINGS from '../strings/constantStrings';

// const spiedDbAddPlan = jest.spyOn(db, 'addPlan').mockImplementation(() => Promise.resolve(true));
const toBeItemTitle = 'Happy';
const mockOnNewPlanAdded = jest.fn();

// despite following all the setup instructions for mocking reanimated animations I can't get it to work
// so here I am replacing those animations called in this component with mocks
jest.spyOn(animations.addPlan.addPlanView, 'entering').mockImplementation(() => null);
jest.spyOn(animations.addPlan.addPlanView, 'exiting').mockImplementation(() => null);

// Unmounts React trees that were mounted with render and clears screen variable that holds latest render output
afterEach(() => {
  cleanup();
});

beforeEach(() => {
});

describe('addPlan', () => {
  it('should render', () => {
    render(<AddPlan toBeId={0} onAdd={mockOnNewPlanAdded} toBeItemTitle={toBeItemTitle} tintColor={colors.general.defaultWhite} />);
    expect(screen.getByTestId('addPlanView')).toBeDefined();
  });

  it('should show the prompt text with correct to be item title', () => {
    render(<AddPlan toBeId={0} onAdd={mockOnNewPlanAdded} toBeItemTitle={toBeItemTitle} tintColor={colors.general.defaultWhite} />);
    expect(screen.getByText(CONSTANT_STRINGS.PLANS.ADD_PLAN.PROMPT_TEXT(toBeItemTitle))).toBeDefined();
  });

  it('should show the text input for the title', () => {
    render(<AddPlan toBeId={0} onAdd={mockOnNewPlanAdded} toBeItemTitle={toBeItemTitle} tintColor={colors.general.defaultWhite} />);
    expect(screen.getByLabelText(CONSTANT_STRINGS.PLANS.ADD_PLAN.TEXT_INPUT_LABEL)).toBeDefined();
  });
});

describe('add button', () => {
  it('should render', () => {

  });

  it('should not call onAdd if there is no text input present when pressed', () => {

  });

  it('should show the empty title alert if there is not text input present when pressed', () => {

  });
});
