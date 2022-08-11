// import React from 'react';
import { render, screen, cleanup, waitFor, act, fireEvent} from '@testing-library/react-native';
import UnsplashImageSearch from './unsplashImageSearch';
import { mockApiGetPhotosSuccessResponse, mockApiGetPhotosErrorResponse, mockApiGetPhotosEmptyResponse } from './__mocks__/unsplashImageSearch';
import { apiMethods } from '../utils/unsplashApi';
import CONSTANT_STRINGS from '../strings/constantStrings';

//spy on the apiGetPhotos function, replace it with a mock with a default implementation that returns a promise that resolves to an example success response from the api
const spiedApiGetPhotos = jest.spyOn(apiMethods, 'apiGetPhotos').mockImplementation(() => Promise.resolve(mockApiGetPhotosSuccessResponse));

// Unmounts React trees that were mounted with render and clears screen variable that holds latest render output
afterEach(cleanup);
//clear all info from the mock arrays of the mocked apiGetPhotos function
beforeEach(() => spiedApiGetPhotos.mockClear());

describe('UnsplashImageSearch Component effects', () => {
  it('should make a call to the unsplash API on mount given a non-blank searchQuery props', async () => { 
    await waitFor(() => render(<UnsplashImageSearch searchQuery={"test query"} onImageDownload={null} width={"100"} height={"100"}></UnsplashImageSearch>));
    expect(spiedApiGetPhotos).toHaveBeenCalled();
  });

  it('should make a call to the unsplash API on mount with the searchQuery provided in the props', async () => { 
    let searchQueryProp = "mountains";
    await waitFor(() => render(<UnsplashImageSearch searchQuery={searchQueryProp} onImageDownload={null} width={"100"} height={"100"}></UnsplashImageSearch>));
    expect(spiedApiGetPhotos).toHaveBeenCalledWith(expect.objectContaining({query: searchQueryProp}));
  });

  it('should not make a call to the unsplash API on mount if the searchQuery provided in the props = ""', async () => { 
    let searchQueryProp = "";
    await waitFor(() => render(<UnsplashImageSearch searchQuery={searchQueryProp} onImageDownload={null} width={"100"} height={"100"}></UnsplashImageSearch>));
    expect(spiedApiGetPhotos).not.toHaveBeenCalled();
  });

  it('should make a new call to the Unsplash API if the searchQuery prop is modified', async () => {
    let searchQueryProp = "mountains";
    let newSearchQueryProp = "apples";
    render(<UnsplashImageSearch searchQuery={searchQueryProp} onImageDownload={null} width={"100"} height={"100"}></UnsplashImageSearch>);
    //check the mocked method was called with the initial searchQuery prop
    await waitFor(() => expect(spiedApiGetPhotos).toHaveBeenCalledWith(expect.objectContaining({query: searchQueryProp})));
    //clear the mock to reset call argument values
    spiedApiGetPhotos.mockClear();
    //rerender the component with the new searchQuery prop
    await act(async() => screen.rerender(<UnsplashImageSearch searchQuery={newSearchQueryProp} onImageDownload={null} width={"100"} height={"100"}></UnsplashImageSearch>));
    //check that the mocked method was called with the modified searchQuery prop...
    expect(spiedApiGetPhotos).toHaveBeenCalledWith(expect.objectContaining({query: newSearchQueryProp}));
    //...and not with the original prop value
    expect(spiedApiGetPhotos).not.toHaveBeenCalledWith(expect.objectContaining({query: searchQueryProp}));
  })

  it('should set the textInput value to empty string upon searchQuery prop change', async () => {
    let searchQueryProp = "mountains";
    let textInputValue = "valleys";
    let newSearchQueryProp = "apples";
    render(<UnsplashImageSearch searchQuery={searchQueryProp} onImageDownload={null} width={"100"} height={"100"}></UnsplashImageSearch>);
    const textInput = screen.getByPlaceholderText(CONSTANT_STRINGS.UNSPLASH_IMAGE_SEARCH.INPUT_PLACEHOLDER);
    await act(async () => fireEvent.changeText(textInput, textInputValue));
    expect(textInput.props.value).toBe(textInputValue);
    //rerender the component with the new searchQuery prop
    await act(async() => screen.rerender(<UnsplashImageSearch searchQuery={newSearchQueryProp} onImageDownload={null} width={"100"} height={"100"}></UnsplashImageSearch>));
    expect(textInput.props.value).toBe("");
  })
})

describe('search input text', () => {
  it('should render', async () =>{
    render(<UnsplashImageSearch searchQuery={""} onImageDownload={null} width={"100"} height={"100"}></UnsplashImageSearch>);
    await waitFor(() => expect(screen.getByPlaceholderText(CONSTANT_STRINGS.UNSPLASH_IMAGE_SEARCH.INPUT_PLACEHOLDER)).toBeTruthy());
  })

  it('should hit the api with a new query upon submission of non-blank text', async () => {
    render(<UnsplashImageSearch searchQuery={""} onImageDownload={null} width={"100"} height={"100"}></UnsplashImageSearch>);
    const textInput = await waitFor(() => screen.getByPlaceholderText(CONSTANT_STRINGS.UNSPLASH_IMAGE_SEARCH.INPUT_PLACEHOLDER));
    const newSearchQuery = "mountains";
    await act(async () => fireEvent.changeText(textInput, newSearchQuery));
    expect(textInput.props.value).toBe(newSearchQuery);
    await act(async() => fireEvent(textInput, 'submitEditing'));
    expect(spiedApiGetPhotos).toHaveBeenCalledWith(expect.objectContaining({query: newSearchQuery}));
  })

  it('should not hit the api with a new query upon submission of blank text', async () => {
    render(<UnsplashImageSearch searchQuery={"Query from props"} onImageDownload={null} width={"100"} height={"100"}></UnsplashImageSearch>);
    const textInput = await waitFor(() => screen.getByPlaceholderText(CONSTANT_STRINGS.UNSPLASH_IMAGE_SEARCH.INPUT_PLACEHOLDER));
    const newSearchQuery = "";
    await act(async () => fireEvent.changeText(textInput, newSearchQuery));
    expect(textInput.props.value).toBe(newSearchQuery);
    await act(async() => fireEvent(textInput, 'submitEditing'));
    expect(spiedApiGetPhotos).not.toHaveBeenCalledWith(expect.objectContaining({query: ""}));
  })

  it('should send the lowercase transform of the input to the api', async () => {
    render(<UnsplashImageSearch searchQuery={""} onImageDownload={null} width={"100"} height={"100"}></UnsplashImageSearch>);
    const textInput = await waitFor(() => screen.getByPlaceholderText(CONSTANT_STRINGS.UNSPLASH_IMAGE_SEARCH.INPUT_PLACEHOLDER));
    const newSearchQuery = "MOuNTaINS aND OtherS";
    await act(async () => fireEvent.changeText(textInput, newSearchQuery));
    expect(textInput.props.value).toBe(newSearchQuery);
    await act(async() => fireEvent(textInput, 'submitEditing'));
    expect(spiedApiGetPhotos).toHaveBeenCalledWith(expect.objectContaining({query: "mountains and others"}));
  })

  it('should trim leading and trailing whitespace characters from the input before querying the api', async () => {
    render(<UnsplashImageSearch searchQuery={""} onImageDownload={null} width={"100"} height={"100"}></UnsplashImageSearch>);
    const textInput = await waitFor(() => screen.getByPlaceholderText(CONSTANT_STRINGS.UNSPLASH_IMAGE_SEARCH.INPUT_PLACEHOLDER));
    const newSearchQuery = "\n  \r mountains  \n\r";
    await act(async () => fireEvent.changeText(textInput, newSearchQuery));
    expect(textInput.props.value).toBe(newSearchQuery);
    await act(async() => fireEvent(textInput, 'submitEditing'));
    expect(spiedApiGetPhotos).toHaveBeenCalledWith(expect.objectContaining({query: "mountains"}));
  })
})

describe('activity indicator', () => {
  it('should be shown on initial render, given a non-blank searchQuery prop', async () => {
    render(<UnsplashImageSearch searchQuery={"test query"}></UnsplashImageSearch>);
    await waitFor(() => expect(screen.getByRole('progressbar')).toBeTruthy());
  })

  it('should be hidden once the api call resolves', async () => {
    //render the component (render is wrapped in an act() call so no need to use here)
    render(<UnsplashImageSearch searchQuery={"test query"}></UnsplashImageSearch>);
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

describe('on no results response from api', () => {
  it('should display only the warning message', async () => {
    //update the spiedApiGetPhotos mock to resolve to the unsplash empty response the next time it is called
    spiedApiGetPhotos.mockResolvedValueOnce(mockApiGetPhotosEmptyResponse);
    //render the component (render is wrapped in an act() call so no need to use here)
    render(<UnsplashImageSearch searchQuery={"test query"}></UnsplashImageSearch>);
    //get the result object value of the first call to the mocked apiGetPhotos function which should be a promise
    const resultOfApiCall = spiedApiGetPhotos.mock.results[0].value;
    //wrap in act because once the promise resolves the state is updated. Await the fulfillment of act before continuing to prevent unexpected behaviour
    await act(async () => {
      //wait for the result of the api call to be resolved and check the resolved value is the mocked response object
      await expect(resultOfApiCall).resolves.toEqual(mockApiGetPhotosEmptyResponse);
    });
    expect(screen.getByText(CONSTANT_STRINGS.UNSPLASH_IMAGE_SEARCH.ON_NO_RESULTS_MESSAGE)).toBeDefined();
    expect(screen.queryByTestId('photoItemFlatlist')).toBeNull();
  })
})

describe('on error response from api', () => {
  it('should display the first error message from the errors object in the api response', async () => {
    //update the spiedApiGetPhotos mock to resolve to the unsplash error response the next time it is called
    spiedApiGetPhotos.mockResolvedValueOnce(mockApiGetPhotosErrorResponse);
    //render the component (render is wrapped in an act() call so no need to use here)
    render(<UnsplashImageSearch searchQuery={"test query"}></UnsplashImageSearch>);
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
    //update the spiedApiGetPhotos mock to resolve to the unsplash error response the next time it is called
    spiedApiGetPhotos.mockResolvedValueOnce(mockApiGetPhotosErrorResponse);
    //render the component (render is wrapped in an act() call so no need to use here)
    render(<UnsplashImageSearch searchQuery={"test query"}></UnsplashImageSearch>);
    //get the result object value of the first call to the mocked apiGetPhotos function which should be a promise
    const resultOfApiCall = spiedApiGetPhotos.mock.results[0].value;
    //wrap in act because once the promise resolves the state is updated. Await the fulfillment of act before continuing to prevent unexpected behaviour
    await act(async () => {
      //wait for the result of the api call to be resolved and check the resolved value is the mocked response object
      await expect(resultOfApiCall).resolves.toEqual(mockApiGetPhotosErrorResponse);
    });
    expect(screen.getByText(CONSTANT_STRINGS.UNSPLASH_IMAGE_SEARCH.ON_ERROR_RESPONSE_MESSAGE)).toBeDefined();
  })

  it('should not render the flatlist', async () => {
     //update the spiedApiGetPhotos mock to resolve to the unsplash error response the next time it is called
     spiedApiGetPhotos.mockResolvedValueOnce(mockApiGetPhotosErrorResponse);
     //render the component (render is wrapped in an act() call so no need to use here)
     render(<UnsplashImageSearch searchQuery={"test query"}></UnsplashImageSearch>);
     //get the result object value of the first call to the mocked apiGetPhotos function which should be a promise
     const resultOfApiCall = spiedApiGetPhotos.mock.results[0].value;
     //wrap in act because once the promise resolves the state is updated. Await the fulfillment of act before continuing to prevent unexpected behaviour
     await act(async () => {
       //wait for the result of the api call to be resolved and check the resolved value is the mocked response object
       await expect(resultOfApiCall).resolves.toEqual(mockApiGetPhotosErrorResponse);
     });
    expect(screen.queryByTestId('photoItemFlatlist')).toBeNull();
  })
})

describe('on success response from the api', () => {
  it('should render flatlist element', async () => {
    render(<UnsplashImageSearch searchQuery={"test query"}></UnsplashImageSearch>);
    await waitFor(() => expect(screen.getByTestId('photoItemFlatlist')).toBeTruthy());
  })
})