// import React from 'react';
import { render, screen, cleanup, waitFor, act} from '@testing-library/react-native';
import UnsplashImageSearch from './unsplashImageSearch';
import { mockApiGetPhotosSuccessResponse, mockApiGetPhotosErrorResponse } from './__mocks__/unsplashImageSearch';
import { apiMethods } from '../utils/unsplashApi';
import CONSTANT_STRINGS from '../strings/constantStrings';

const spiedApiGetPhotos = jest.spyOn(apiMethods, 'apiGetPhotos');

// Unmounts React trees that were mounted with render and clears screen variable that holds latest render output
afterEach(cleanup);
//clear all info from the mock arrays of the mocked apiGetPhotos function and resets implementation to default (a function with no return value)
beforeEach(() => spiedApiGetPhotos.mockReset());

describe('UnsplashImageSearch Component effects', () => {
  it('should make a call to the unsplash API on mount', async () => { 
    spiedApiGetPhotos.mockResolvedValue(mockApiGetPhotosSuccessResponse);
    await waitFor(() => render(<UnsplashImageSearch searchQuery={""} onImageDownload={null} width={"100"} height={"100"}></UnsplashImageSearch>));
    expect(spiedApiGetPhotos).toHaveBeenCalled();
  });

  it('should make a call to the unsplash API on mount with the searchQuery provided in the props', async () => { 
    spiedApiGetPhotos.mockResolvedValue(mockApiGetPhotosSuccessResponse);
    let searchQueryProp = "mountains";
    await waitFor(() => render(<UnsplashImageSearch searchQuery={searchQueryProp} onImageDownload={null} width={"100"} height={"100"}></UnsplashImageSearch>));
    expect(spiedApiGetPhotos).toHaveBeenCalledWith(expect.objectContaining({query: searchQueryProp}));
  });

  it.only('should make a new call to the Unsplash API if the searchQuery prop is modified', async () => {
    //TODO: implement test
    spiedApiGetPhotos.mockResolvedValue(mockApiGetPhotosSuccessResponse);
    let searchQueryProp = "mountains";
    let newSearchQueryProp = "apples";
    await waitFor(() => render(<UnsplashImageSearch searchQuery={searchQueryProp} onImageDownload={null} width={"100"} height={"100"}></UnsplashImageSearch>));
    //check the mocked method was called with the initial searchQuery prop
    expect(spiedApiGetPhotos).toHaveBeenCalledWith(expect.objectContaining({query: searchQueryProp}));
    //clear the mock to reset call argument values
    spiedApiGetPhotos.mockClear();
    // //rerender the component with the new searchQuery prop
    await act(async() => screen.rerender(<UnsplashImageSearch searchQuery={newSearchQueryProp} onImageDownload={null} width={"100"} height={"100"}></UnsplashImageSearch>));   
    expect(spiedApiGetPhotos).toHaveBeenCalledWith(expect.objectContaining({query: newSearchQueryProp}));
    expect(spiedApiGetPhotos).not.toHaveBeenCalledWith(expect.objectContaining({query: searchQueryProp}));
  })

  it('should make a new call to the Unsplash API if the user submits new text to the component\'s text input', () => {
    //TODO: Implement test
  })

})

describe('activity indicator', () => {
  it('should be shown initially', async () => {
    spiedApiGetPhotos.mockResolvedValue(mockApiGetPhotosSuccessResponse);
    render(<UnsplashImageSearch searchQuery={""}></UnsplashImageSearch>);
    expect(await waitFor(() => screen.getByRole('progressbar'))).toBeTruthy();
  })

  it('should be hidden once the api call resolves', async () => {
    spiedApiGetPhotos.mockResolvedValue(mockApiGetPhotosSuccessResponse);
    //render the component (render is wrapped in an act() call so no need to use here)
    render(<UnsplashImageSearch searchQuery={""}></UnsplashImageSearch>);
    //get the result object value of the first call to the mocked apiGetPhotos function which should be a promise
    const resultOfApiCall = spiedApiGetPhotos.mock.results[0].value;
    //wrap in act because once the promise resolves the state is updated. Await the fulfillment of act before continuing to prevent unexpected behaviour
    await act(async () => {
      //wait for the result of the api call to be resolved and check the resolved value is the mocked response object
      await expect(resultOfApiCall).resolves.toEqual(mockApiGetPhotosSuccessResponse);
    })
    //expect that the loading indicator has been removed from the component tree
    expect(screen.queryByRole('progressbar')).toBeNull();
  })
})

describe('UnsplashImageSearch Component effects', () => {
  
})

describe('on error response from api', () => {
  it('should display the first error message from the errors object in the api response', async () => {
    spiedApiGetPhotos.mockResolvedValue(mockApiGetPhotosErrorResponse);
    //render the component (render is wrapped in an act() call so no need to use here)
    render(<UnsplashImageSearch searchQuery={""}></UnsplashImageSearch>);
    //get the result object value of the first call to the mocked apiGetPhotos function which should be a promise
    const resultOfApiCall = spiedApiGetPhotos.mock.results[0].value;
    //wrap in act because once the promise resolves the state is updated. Await the fulfillment of act before continuing to prevent unexpected behaviour
    await act(async () => {
      //wait for the result of the api call to be resolved and check the resolved value is the mocked response object
      await expect(resultOfApiCall).resolves.toEqual(mockApiGetPhotosErrorResponse);
    });
    expect(screen.getByText(mockApiGetPhotosErrorResponse.errors[0])).toBeDefined();
  })

  it('should display the UNSPLASH_IMAGE_SEARCH_ON_ERROR_RESPONSE_MESSAGE error message', async () => {
    spiedApiGetPhotos.mockResolvedValue(mockApiGetPhotosErrorResponse);
    //render the component (render is wrapped in an act() call so no need to use here)
    render(<UnsplashImageSearch searchQuery={""}></UnsplashImageSearch>);
    //get the result object value of the first call to the mocked apiGetPhotos function which should be a promise
    const resultOfApiCall = spiedApiGetPhotos.mock.results[0].value;
    //wrap in act because once the promise resolves the state is updated. Await the fulfillment of act before continuing to prevent unexpected behaviour
    await act(async () => {
      //wait for the result of the api call to be resolved and check the resolved value is the mocked response object
      await expect(resultOfApiCall).resolves.toEqual(mockApiGetPhotosErrorResponse);
    });
    expect(screen.getByText(CONSTANT_STRINGS.UNSPLASH_IMAGE_SEARCH_ON_ERROR_RESPONSE_MESSAGE)).toBeDefined();
  })
})