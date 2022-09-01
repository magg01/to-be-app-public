/* eslint-disable react/jsx-filename-extension */
/* eslint-disable no-undef */
/* eslint-disable max-len */
import React from 'react';
import {
  render, screen, cleanup, fireEvent,
} from '@testing-library/react-native';
import AddNotificationModal from './addNotificationModal';
import { mockOneOffEventItem } from './__mocks__/addNotificationModal';
import { calEventTypeEnum } from '../utils/enums';
import CONSTANT_STRINGS from '../strings/constantStrings';

const mockedPlanTitle = 'Go to be early';
const mockedEventItem = mockOneOffEventItem(calEventTypeEnum.singleEvent, mockedPlanTitle);
const mockOnShouldSetNotification = jest.fn(() => null);
const mockOnDismiss = jest.fn(() => null);

// Unmounts React trees that were mounted with render and clears screen variable that holds latest render output
afterEach(cleanup);

beforeEach(() => {
  mockOnShouldSetNotification.mockClear();
  mockOnDismiss.mockClear();
});

describe('addNotificationModal', () => {
  it('should render', () => {
    render(<AddNotificationModal isVisible eventItem={mockedEventItem} />);
    expect(screen.getByTestId('addNotificationModal')).toBeDefined();
  });

  it('should display title message with plan title', () => {
    render(<AddNotificationModal isVisible eventItem={mockedEventItem} />);
    expect(screen.getByText(CONSTANT_STRINGS.NOTIFICATIONS.ADD_NOTIFICATION_MODAL.TITLE(mockedEventItem.planTitle))).toBeDefined();
  });

  it('should display prompt for input', () => {
    render(<AddNotificationModal isVisible eventItem={mockedEventItem} />);
    expect(screen.getByText(CONSTANT_STRINGS.NOTIFICATIONS.ADD_NOTIFICATION_MODAL.INPUT_PROMPT)).toBeDefined();
  });

  it('should render text input', () => {
    render(<AddNotificationModal isVisible eventItem={mockedEventItem} />);
    expect(screen.getByLabelText(CONSTANT_STRINGS.NOTIFICATIONS.ADD_NOTIFICATION_MODAL.INPUT_ACCESSIBILITY_LABEL)).toBeDefined();
  });

  it('should render cancel and submit buttons', () => {
    render(<AddNotificationModal isVisible eventItem={mockedEventItem} />);
    expect(screen.queryAllByText(CONSTANT_STRINGS.NOTIFICATIONS.ADD_NOTIFICATION_MODAL.CANCEL_BUTTON_TITLE)).toHaveLength(1);
    expect(screen.queryAllByText(CONSTANT_STRINGS.NOTIFICATIONS.ADD_NOTIFICATION_MODAL.SUBMIT_BUTTON_TITLE)).toHaveLength(1);
  });

  it('should call onShouldSetNotification prop function when submit button is pressed, and with correct value passed', () => {
    render(<AddNotificationModal isVisible eventItem={mockedEventItem} onShouldSetNotification={mockOnShouldSetNotification} onDismiss={mockOnDismiss} />);
    const submitButton = screen.queryAllByText(CONSTANT_STRINGS.NOTIFICATIONS.ADD_NOTIFICATION_MODAL.SUBMIT_BUTTON_TITLE)[0];
    const textInput = screen.getByLabelText(CONSTANT_STRINGS.NOTIFICATIONS.ADD_NOTIFICATION_MODAL.INPUT_ACCESSIBILITY_LABEL);
    const numericalInputValue = '30';
    fireEvent.changeText(textInput, numericalInputValue);
    fireEvent.press(submitButton);
    expect(mockOnShouldSetNotification).toHaveBeenCalled();
    expect(mockOnShouldSetNotification).toHaveBeenCalledWith(numericalInputValue);
  });

  it('should call onDismiss prop function when submit button is pressed', () => {
    render(<AddNotificationModal isVisible eventItem={mockedEventItem} onShouldSetNotification={mockOnShouldSetNotification} onDismiss={mockOnDismiss} />);
    const submitButton = screen.queryAllByText(CONSTANT_STRINGS.NOTIFICATIONS.ADD_NOTIFICATION_MODAL.SUBMIT_BUTTON_TITLE)[0];
    fireEvent.press(submitButton);
    expect(mockOnDismiss).toHaveBeenCalled();
  });

  it('should not call onShouldSetNotification prop function when cancel button is pressed', () => {
    render(<AddNotificationModal isVisible eventItem={mockedEventItem} onShouldSetNotification={mockOnShouldSetNotification} onDismiss={mockOnDismiss} />);
    const cancelButton = screen.queryAllByText(CONSTANT_STRINGS.NOTIFICATIONS.ADD_NOTIFICATION_MODAL.CANCEL_BUTTON_TITLE)[0];
    fireEvent.press(cancelButton);
    expect(mockOnShouldSetNotification).not.toHaveBeenCalled();
  });

  it('should call onDismiss prop function when cancel button is pressed', () => {
    render(<AddNotificationModal isVisible eventItem={mockedEventItem} onShouldSetNotification={mockOnShouldSetNotification} onDismiss={mockOnDismiss} />);
    const cancelButton = screen.queryAllByText(CONSTANT_STRINGS.NOTIFICATIONS.ADD_NOTIFICATION_MODAL.CANCEL_BUTTON_TITLE)[0];
    fireEvent.press(cancelButton);
    expect(mockOnDismiss).toHaveBeenCalled();
  });
});

describe('addNotificationModal input field', () => {
  it('should allow numerical input', () => {
    render(<AddNotificationModal isVisible eventItem={mockedEventItem} />);
    const textInput = screen.getByLabelText(CONSTANT_STRINGS.NOTIFICATIONS.ADD_NOTIFICATION_MODAL.INPUT_ACCESSIBILITY_LABEL);
    const numericalInputValue = '30';
    fireEvent.changeText(textInput, numericalInputValue);
    expect(textInput.props.value).toBe(numericalInputValue);
  });

  it('should reset the value to "0" given non-numerical input', () => {
    render(<AddNotificationModal isVisible eventItem={mockedEventItem} />);
    const textInput = screen.getByLabelText(CONSTANT_STRINGS.NOTIFICATIONS.ADD_NOTIFICATION_MODAL.INPUT_ACCESSIBILITY_LABEL);
    const textInputValue = 'Hi';
    fireEvent.changeText(textInput, textInputValue);
    expect(textInput.props.value).toBe('0');
  });
});
