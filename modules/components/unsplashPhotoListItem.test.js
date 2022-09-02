/* eslint-disable react/jsx-filename-extension */
import React from 'react';
import {
  render, screen, cleanup, fireEvent, waitFor,
} from '@testing-library/react-native';
// eslint-disable-next-line import/no-extraneous-dependencies
import {
  describe, expect, it, beforeEach, afterEach, jest,
} from '@jest/globals';
import UnsplashPhotoListItem from './unsplashPhotoListItem';
import * as apiMethods from '../utils/unsplashApi';
import CONSTANT_STRINGS from '../strings/constantStrings';
import { singlePhotoItem } from './__mocks__/unsplashPhotoListItem';

const mockedLocalFilePath = 'file:///aRealFilePath/';
const mockOnImageDownload = jest.fn();
const mockDownloadImageFromUnsplash = jest.spyOn(apiMethods, 'downloadImageFromUnsplash').mockImplementation(() => Promise.resolve(mockedLocalFilePath));

afterEach(() => {
  jest.clearAllMocks();
  cleanup();
});

describe('unsplashPhotoListItem', () => {
  beforeEach(() => {
    render(
      <UnsplashPhotoListItem
        photo={singlePhotoItem}
        onImageDownload={mockOnImageDownload}
        width={200}
      />,
    );
  });

  it('should render', async () => {
    expect(screen.getByTestId('unsplashPhotoListItem')).toBeTruthy();
  });

  it('should display photo attribution to user and Unsplash', async () => {
    render(
      <UnsplashPhotoListItem
        photo={singlePhotoItem}
        onImageDownload={mockOnImageDownload}
        width={200}
      />,
    );
    waitFor(() => {
      expect(screen.getByText(
        CONSTANT_STRINGS.UNSPLASH_IMAGE_SEARCH.IMAGE_ATTRIBUTION(singlePhotoItem.user.name),
      )).toBeTruthy();
    });
  });
});

describe('unsplashPhotoListItem choose button', () => {
  it('should render', () => {
    render(
      <UnsplashPhotoListItem
        photo={singlePhotoItem}
        onImageDownload={mockOnImageDownload}
        width={200}
      />,
    );
    expect(screen.getByText(CONSTANT_STRINGS.UNSPLASH_IMAGE_SEARCH.CHOOSE_IMAGE_TEXT)).toBeTruthy();
  });

  it('should replace button text with loading indicator when pressed', () => {
    render(
      <UnsplashPhotoListItem
        photo={singlePhotoItem}
        onImageDownload={mockOnImageDownload}
        width={200}
      />,
    );
    const chooseButton = screen.getByText(CONSTANT_STRINGS.UNSPLASH_IMAGE_SEARCH.CHOOSE_IMAGE_TEXT);
    // the activity indicator should not be there
    expect(screen.queryByTestId('chooseButtonActivityIndicator')).toBeNull();
    // press the button
    fireEvent.press(chooseButton);
    // text should be removed
    expect(screen.queryByText(CONSTANT_STRINGS.UNSPLASH_IMAGE_SEARCH.CHOOSE_IMAGE_TEXT)).toBeNull();
    // activity indicator should be present
    waitFor(() => expect(screen.queryByTestId('chooseButtonActivityIndicator')).not.toBeNull());
  });

  it('should call downloadImageFromUnsplash api method when pressed', () => {
    render(
      <UnsplashPhotoListItem
        photo={singlePhotoItem}
        onImageDownload={mockOnImageDownload}
        width={200}
      />,
    );
    const chooseButton = screen.getByText(CONSTANT_STRINGS.UNSPLASH_IMAGE_SEARCH.CHOOSE_IMAGE_TEXT);
    fireEvent.press(chooseButton);
    expect(mockDownloadImageFromUnsplash).toHaveBeenCalledWith(singlePhotoItem);
  });
});
