/* eslint-disable react/jsx-filename-extension */
import React from 'react';
import {
  render, screen, cleanup, fireEvent,
} from '@testing-library/react-native';
// eslint-disable-next-line import/no-extraneous-dependencies
import {
  describe, expect, it, beforeEach, jest, afterEach,
} from '@jest/globals';
import PlanRepeaterView from './planRepeaterView';
import animations from '../utils/animations';
import colors from '../utils/colors';
import CONSTANT_STRINGS from '../strings/constantStrings';

// despite following all the setup instructions for mocking reanimated animations I can't
// get it to work so here I am replacing those animations called in this component with mocks
jest.spyOn(animations.plans.planView, 'entering').mockImplementation(() => null);
jest.spyOn(animations.plans.planView, 'exiting').mockImplementation(() => null);
const mockLayoutAnimation = jest.spyOn(animations.plans.planView, 'layout').mockImplementation(() => null);

const mockOnRepeaterModified = jest.fn();
const mockHeaderText = 'Dailies';

afterEach(() => {
  jest.clearAllMocks();
  cleanup();
});

describe('PlanRepeaterView expanded view', () => {
  beforeEach(() => {
    render(
      <PlanRepeaterView
        planRepeaters={null}
        tintColor={colors.general.defaultWhite}
        headerText={mockHeaderText}
        onRepeaterModified={mockOnRepeaterModified}
      />,
    );
  });

  it('matches snapshot', () => {
    const tree = screen.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('should render', async () => {
    expect(screen.getByTestId('PlanRepeaterView')).toBeTruthy();
  });

  it('should display the correct title in the header', () => {
    expect(screen.getByText(mockHeaderText)).toBeTruthy();
  });

  it('should show the expand/collapse icon on render', () => {
    expect(screen.getByLabelText(
      CONSTANT_STRINGS.PLANS.PLAN_VIEW.EXPAND_COLLAPSE_ICON_LABEL,
    )).toBeTruthy();
  });

  it('should should not show the addNewPlan button on render', () => {
    expect(screen.queryByRole('button')).toBeNull();
  });
});

describe('PlanRepeaterView collapsed view', () => {
  beforeEach(() => {
    render(
      <PlanRepeaterView
        planRepeaters={null}
        tintColor={colors.general.defaultWhite}
        headerText={mockHeaderText}
        onRepeaterModified={mockOnRepeaterModified}
      />,
    );
    const expandCollapseIcon = screen.getByLabelText(
      CONSTANT_STRINGS.PLANS.PLAN_VIEW.EXPAND_COLLAPSE_ICON_LABEL,
    );
    mockLayoutAnimation.mockClear();
    fireEvent.press(expandCollapseIcon);
  });

  it('matches snapshot', () => {
    const tree = screen.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('should render', () => {
    expect(screen.getByTestId('PlanRepeaterView')).toBeTruthy();
  });

  it('should display the correct title in the header', () => {
    expect(screen.getByText(mockHeaderText)).toBeTruthy();
  });

  it('should render the expand/collapse icon button', () => {
    expect(screen.getByLabelText(
      CONSTANT_STRINGS.PLANS.PLAN_VIEW.EXPAND_COLLAPSE_ICON_LABEL,
    )).toBeTruthy();
  });

  it('should call layout animation when collapsing', () => {
    expect(mockLayoutAnimation).toHaveBeenCalledTimes(1);
  });

  it('should not show the addNewPlan button', () => {
    expect(screen.queryByRole('button')).toBeNull();
  });
});
