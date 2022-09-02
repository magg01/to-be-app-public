/* eslint-disable react/jsx-filename-extension */
/* eslint-disable no-undef */
/* eslint-disable max-len */
import React from 'react';
import {
  render, screen, cleanup, fireEvent, waitFor, act,
} from '@testing-library/react-native';
import { Alert } from 'react-native';
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

// spy on and mock the implementation of the addPlan database method
const mockDbAddPlan = jest.spyOn(db, 'addPlan').mockImplementation(() => Promise.resolve(true));

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
    render(<AddPlan toBeId={0} onAdd={mockOnNewPlanAdded} toBeItemTitle={toBeItemTitle} tintColor={colors.general.defaultWhite} />);
    expect(screen.queryAllByText(CONSTANT_STRINGS.PLANS.ADD_PLAN.ADD_BUTTON)).toHaveLength(1);
  });

  it('should not call onAdd if there is no text input present when pressed', async () => {
    render(<AddPlan toBeId={0} onAdd={mockOnNewPlanAdded} toBeItemTitle={toBeItemTitle} tintColor={colors.general.defaultWhite} />);
    const addButton = screen.queryAllByText(CONSTANT_STRINGS.PLANS.ADD_PLAN.ADD_BUTTON)[0];
    await waitFor(() => fireEvent.press(addButton));
    expect(mockOnNewPlanAdded).not.toHaveBeenCalled();
  });

  it('should show the empty-title-alert if there is no text input present when pressed, with the correct message', () => {
    mockedAlert = jest.spyOn(Alert, 'alert').mockImplementation(() => null);
    render(<AddPlan toBeId={0} onAdd={mockOnNewPlanAdded} toBeItemTitle={toBeItemTitle} tintColor={colors.general.defaultWhite} />);
    const addButton = screen.queryAllByText(CONSTANT_STRINGS.PLANS.ADD_PLAN.ADD_BUTTON)[0];
    fireEvent.press(addButton);
    expect(mockedAlert).toHaveBeenCalledWith(CONSTANT_STRINGS.PLANS.ADD_PLAN.ADD_BLANK_PLAN_ALERT);
  });

  it('given valid text input, should call the database method addPlan with the toBeId and title when pressed', async () => {
    const toBeIdUsed = 1;
    render(<AddPlan toBeId={toBeIdUsed} onAdd={mockOnNewPlanAdded} toBeItemTitle={toBeItemTitle} tintColor={colors.general.defaultWhite} />);
    const textInput = screen.getByLabelText(CONSTANT_STRINGS.PLANS.ADD_PLAN.TEXT_INPUT_LABEL);
    const newTitleText = 'Eat more fruit';
    // changing the text updates the state so we need to wrap in await act(async () => ...)
    await act(async () => fireEvent.changeText(textInput, newTitleText));
    const addButton = screen.queryAllByText(CONSTANT_STRINGS.PLANS.ADD_PLAN.ADD_BUTTON)[0];
    await act(async () => fireEvent.press(addButton));
    expect(mockDbAddPlan).toHaveBeenCalledWith(newTitleText, toBeIdUsed);
  });
});
