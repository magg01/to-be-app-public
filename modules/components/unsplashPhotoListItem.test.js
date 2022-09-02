/* eslint-disable react/jsx-filename-extension */
import React from 'react';
import {
  render, screen, cleanup, fireEvent,
} from '@testing-library/react-native';
// eslint-disable-next-line import/no-extraneous-dependencies
import {
  describe, expect, it, beforeEach,
} from '@jest/globals';
import UnsplashPhotoListItem from './unsplashPhotoListItem';
import * as apiMethods from '../utils/unsplashApi';
import CONSTANT_STRINGS from '../strings/constantStrings';
import { singlePhotoItem } from './__mocks__/unsplashPhotoListItem';

const mockedLocalFilePath = "file:///aRealFilePath/";
const mockOnImageDownload = jest.fn();
const mockDownloadImageFromUnsplash = jest.spyOn(apiMethods, 'downloadImageFromUnsplash').mockImplementation(() => Promise.resolve(mockedLocalFilePath));
const mockNotifyUnsplashOfImageDownload = jest.spyOn(apiMethods, 'notifyUnsplashOfImageDownload').mockImplementation(() => null);

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

  it('should display photo attribution to user and Unsplash', () => {
    expect(screen.getByText(singlePhotoItem.user.name)).toBeTruthy();
    expect(screen.getByText('Unsplash')).toBeTruthy();
  });
});
