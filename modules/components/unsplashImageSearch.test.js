// import React from 'react';
import { render, screen, cleanup, waitFor, act, waitForElementToBeRemoved } from '@testing-library/react-native';
import UnsplashImageSearch from './unsplashImageSearch';
import { mockApiGetPhotosResponse } from './__mocks__/unsplashImageSearch';
import { UNSPLASH_IMAGE_SEARCH_INPUT_PLACEHOLDER } from '../strings/constantStrings';

const mockApiGetPhotos = jest.fn(() => {
  return Promise.resolve(mockApiGetPhotosResponse)
}) 

//mock the apiGetPhotos function 
jest.mock('../utils/unsplashApi', () => {
  return {
    apiGetPhotos: () => mockApiGetPhotos()
  }
});

afterEach(cleanup);

//this is a pointless test at the moment
// it('should have object results', async () => {
//   const response = await apiGetPhotos({});
//   expect(response.response.results).toBeDefined();
// });

it('should show the activity indicator initially', async () => {
  render(<UnsplashImageSearch searchQuery={""}></UnsplashImageSearch>);
  expect(await waitFor(() => screen.getByRole('progressbar'))).toBeTruthy();
})

it('should hide the activity indicator after the api call resolves', async () => {
  //render the component
  render(<UnsplashImageSearch searchQuery={""}></UnsplashImageSearch>);
  //get the result object value of the first call to the mocked apiGetPhotos function
  const resultOfApiCall = mockApiGetPhotos.mock.results[0].value;
  //wrap in act because once the promise resolves the state is updated. Await the fulfillment of act before continuing to prevent unexpected behaviour
  await act(async () => {
    //await for the result of the api call to be resolved and check the resolved value is the mocked response
    await expect(resultOfApiCall).resolves.toEqual(mockApiGetPhotosResponse);
  })
  //expect that the loading indicator has been removed from the component tree
  expect(screen.queryByRole('progressbar')).toBeNull();
})

it('should make a call to the unsplash API on mount', async () => { 
  await waitFor(() => render(<UnsplashImageSearch searchQuery={""} onImageDownload={null} width={"100"} height={"100"}></UnsplashImageSearch>));
});