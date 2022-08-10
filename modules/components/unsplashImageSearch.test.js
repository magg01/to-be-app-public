// import React from 'react';
import { render, screen, cleanup, waitFor, act, waitForElementToBeRemoved } from '@testing-library/react-native';
import UnsplashImageSearch from './unsplashImageSearch';
import { mockApiGetPhotosSuccessResponse, mockApiGetPhotosErrorResponse } from './__mocks__/unsplashImageSearch';
import CONSTANT_STRINGS from '../strings/constantStrings';

//mock to replace the genuine apiGetPhotos method in utils/unsplashApi
const mockApiGetPhotos = jest.fn() 

//replace the genuine function with the mock to prevent API hits in testing
jest.mock('../utils/unsplashApi', () => {
  return {
    apiGetPhotos: () => mockApiGetPhotos()
  }
});

// Unmounts React trees that were mounted with render and clears screen variable that holds latest render output
afterEach(cleanup);
//clear all info from the mock arrays of the mocked apiGetPhotos function and resets implementation to default (no implementation)
beforeEach(() => mockApiGetPhotos.mockReset());


it('should show the activity indicator initially', async () => {
  mockApiGetPhotos.mockResolvedValue(mockApiGetPhotosSuccessResponse);
  render(<UnsplashImageSearch searchQuery={""}></UnsplashImageSearch>);
  expect(await waitFor(() => screen.getByRole('progressbar'))).toBeTruthy();
})

it('should hide the activity indicator after the api call resolves', async () => {
  mockApiGetPhotos.mockResolvedValue(mockApiGetPhotosSuccessResponse);
  //render the component (render is wrapped in an act() call so no need to use here)
  render(<UnsplashImageSearch searchQuery={""}></UnsplashImageSearch>);
  //get the result object value of the first call to the mocked apiGetPhotos function which should be a promise
  const resultOfApiCall = mockApiGetPhotos.mock.results[0].value;
  //wrap in act because once the promise resolves the state is updated. Await the fulfillment of act before continuing to prevent unexpected behaviour
  await act(async () => {
    //wait for the result of the api call to be resolved and check the resolved value is the mocked response object
    await expect(resultOfApiCall).resolves.toEqual(mockApiGetPhotosSuccessResponse);
  })
  //expect that the loading indicator has been removed from the component tree
  expect(screen.queryByRole('progressbar')).toBeNull();
})

it('should make a call to the unsplash API on mount', async () => { 
  mockApiGetPhotos.mockResolvedValue(mockApiGetPhotosSuccessResponse);
  await waitFor(() => render(<UnsplashImageSearch searchQuery={""} onImageDownload={null} width={"100"} height={"100"}></UnsplashImageSearch>));
  expect(mockApiGetPhotos).toHaveBeenCalled();
});

describe('on error response from api', () => {
  it('should display the first error message from the errors object in the api response', async () => {
    mockApiGetPhotos.mockResolvedValue(mockApiGetPhotosErrorResponse);
    //render the component (render is wrapped in an act() call so no need to use here)
    render(<UnsplashImageSearch searchQuery={""}></UnsplashImageSearch>);
    //get the result object value of the first call to the mocked apiGetPhotos function which should be a promise
    const resultOfApiCall = mockApiGetPhotos.mock.results[0].value;
    //wrap in act because once the promise resolves the state is updated. Await the fulfillment of act before continuing to prevent unexpected behaviour
    await act(async () => {
      //wait for the result of the api call to be resolved and check the resolved value is the mocked response object
      await expect(resultOfApiCall).resolves.toEqual(mockApiGetPhotosErrorResponse);
    });
    expect(screen.getByText(mockApiGetPhotosErrorResponse.errors[0])).toBeDefined();
  })

  it('should display the static error string message', async () => {
    mockApiGetPhotos.mockResolvedValue(mockApiGetPhotosErrorResponse);
    //render the component (render is wrapped in an act() call so no need to use here)
    render(<UnsplashImageSearch searchQuery={""}></UnsplashImageSearch>);
    //get the result object value of the first call to the mocked apiGetPhotos function which should be a promise
    const resultOfApiCall = mockApiGetPhotos.mock.results[0].value;
    //wrap in act because once the promise resolves the state is updated. Await the fulfillment of act before continuing to prevent unexpected behaviour
    await act(async () => {
      //wait for the result of the api call to be resolved and check the resolved value is the mocked response object
      await expect(resultOfApiCall).resolves.toEqual(mockApiGetPhotosErrorResponse);
    });
    expect(screen.getByText(CONSTANT_STRINGS.UNSPLASH_IMAGE_SEARCH_ON_ERROR_RESPONSE_MESSAGE)).toBeDefined();
  })
})
  