/* eslint-disable react/jsx-filename-extension */
/* eslint-disable no-undef */
import React from 'react';
import {
  render, screen, cleanup, waitFor, act, fireEvent,
} from '@testing-library/react-native';
import UnsplashImageSearch from './unsplashImageSearch';
import {
  mockApiGetPhotosSuccessResponse, mockApiGetPhotosErrorResponse, mockApiGetPhotosEmptyResponse,
} from './__mocks__/unsplashImageSearch';
import { apiMethods } from '../utils/unsplashApi';
import CONSTANT_STRINGS from '../strings/constantStrings';

// spy on the apiGetPhotos function, replace it with a mock with a default implementation that
// returns a promise that resolves to an example success response from the api
const spiedApiGetPhotos = jest.spyOn(apiMethods, 'apiGetPhotos')
  .mockImplementation(() => Promise.resolve(mockApiGetPhotosSuccessResponse));

// Unmounts React trees that were mounted with render
// and clears screen variable that holds latest render output
afterEach(cleanup);
// clear all info from the mock arrays of the mocked apiGetPhotos function
beforeEach(() => spiedApiGetPhotos.mockClear());

describe('UnsplashImageSearch Component effects', () => {
  it('should make a call to the unsplash API on mount given a non-blank providedSearchQuery prop', async () => {
    await waitFor(() => render(
      <UnsplashImageSearch
        providedSearchQuery="test query"
        onImageDownload={null}
        width="100"
        height="100"
      />,
    ));
    expect(spiedApiGetPhotos).toHaveBeenCalled();
  });

  it('should make a call to the unsplash API on mount with the providedSearchQuery provided in the props', async () => {
    const providedSearchQueryProp = 'mountains';
    await waitFor(() => render(
      <UnsplashImageSearch
        providedSearchQuery={providedSearchQueryProp}
        onImageDownload={null}
        width="100"
        height="100"
      />,
    ));
    expect(spiedApiGetPhotos)
      .toHaveBeenCalledWith(expect.objectContaining({ query: providedSearchQueryProp }));
  });

  it('should not make a call to the unsplash API on mount if the providedSearchQuery provided in the props = ""', async () => {
    const providedSearchQueryProp = '';
    await waitFor(() => render(
      <UnsplashImageSearch
        providedSearchQuery={providedSearchQueryProp}
        onImageDownload={null}
        width="100"
        height="100"
      />,
    ));
    expect(spiedApiGetPhotos).not.toHaveBeenCalled();
  });

  it('should make a new call to the Unsplash API if the providedSearchQuery prop is modified', async () => {
    const providedSearchQueryProp = 'mountains';
    const newProvidedSearchQueryProp = 'apples';
    render(
      <UnsplashImageSearch
        providedSearchQuery={providedSearchQueryProp}
        onImageDownload={null}
        width="100"
        height="100"
      />,
    );
    // check the mocked method was called with the initial providedSearchQuery prop
    await waitFor(() => {
      expect(spiedApiGetPhotos)
        .toHaveBeenCalledWith(expect.objectContaining({ query: providedSearchQueryProp }));
    });
    // clear the mock to reset call argument values
    spiedApiGetPhotos.mockClear();
    // rerender the component with the new providedSearchQuery prop
    await act(async () => {
      screen.rerender(
        <UnsplashImageSearch
          providedSearchQuery={newProvidedSearchQueryProp}
          onImageDownload={null}
          width="100"
          height="100"
        />,
      );
    });
    // check that the mocked method was called with the modified providedSearchQueryProp ...
    expect(spiedApiGetPhotos)
      .toHaveBeenCalledWith(expect.objectContaining({ query: newProvidedSearchQueryProp }));
    // ...and not with the original prop value
    expect(spiedApiGetPhotos)
      .not.toHaveBeenCalledWith(expect.objectContaining({ query: providedSearchQueryProp }));
  });

  it('should set the textInput value to empty string upon providedSearchQuery prop change', async () => {
    const providedSearchQueryProp = 'mountains';
    const textInputValue = 'valleys';
    const newProvidedSearchQueryProp = 'apples';
    render(
      <UnsplashImageSearch
        providedSearchQuery={providedSearchQueryProp}
        onImageDownload={null}
        width="100"
        height="100"
      />,
    );
    const textInput = screen
      .getByPlaceholderText(CONSTANT_STRINGS.UNSPLASH_IMAGE_SEARCH.INPUT_PLACEHOLDER);
    await act(async () => fireEvent.changeText(textInput, textInputValue));
    expect(textInput.props.value).toBe(textInputValue);
    // rerender the component with the new providedSearchQuery prop
    await act(async () => screen.rerender(
      <UnsplashImageSearch
        providedSearchQuery={newProvidedSearchQueryProp}
        onImageDownload={null}
        width="100"
        height="100"
      />,
    ));
    expect(textInput.props.value).toBe('');
  });
});

describe('search input text', () => {
  it('should render', async () => {
    render(
      <UnsplashImageSearch
        providedSearchQuery=""
        onImageDownload={null}
        width="100"
        height="100"
      />,
    );
    await waitFor(() => expect(
      screen.getByPlaceholderText(CONSTANT_STRINGS.UNSPLASH_IMAGE_SEARCH.INPUT_PLACEHOLDER),
    ).toBeTruthy());
  });

  it('should hit the api with a new query upon submission of non-blank text', async () => {
    render(<UnsplashImageSearch providedSearchQuery="" onImageDownload={null} width="100" height="100"></UnsplashImageSearch>);
    const textInput = await waitFor(() => screen.getByPlaceholderText(CONSTANT_STRINGS.UNSPLASH_IMAGE_SEARCH.INPUT_PLACEHOLDER));
    const newProvidedSearchQuery = 'mountains';
    await act(async () => fireEvent.changeText(textInput, newProvidedSearchQuery));
    expect(textInput.props.value).toBe(newProvidedSearchQuery);
    await act(async() => fireEvent(textInput, 'submitEditing'));
    expect(spiedApiGetPhotos).toHaveBeenCalledWith(expect.objectContaining({query: newProvidedSearchQuery}));
  });

  it('should not hit the api with a new query upon submission of blank text', async () => {
    render(<UnsplashImageSearch providedSearchQuery="Query from props" onImageDownload={null} width="100" height="100"></UnsplashImageSearch>);
    const textInput = await waitFor(() => screen.getByPlaceholderText(CONSTANT_STRINGS.UNSPLASH_IMAGE_SEARCH.INPUT_PLACEHOLDER));
    const newProvidedSearchQuery = '';
    await act(async () => fireEvent.changeText(textInput, newProvidedSearchQuery));
    expect(textInput.props.value).toBe(newProvidedSearchQuery);
    await act(async() => fireEvent(textInput, 'submitEditing'));
    expect(spiedApiGetPhotos).not.toHaveBeenCalledWith(expect.objectContaining({query: ''}));
  });

  it('should send the lowercase transform of the input to the api', async () => {
    render(<UnsplashImageSearch providedSearchQuery="" onImageDownload={null} width="100" height="100"></UnsplashImageSearch>);
    const textInput = await waitFor(() => screen.getByPlaceholderText(CONSTANT_STRINGS.UNSPLASH_IMAGE_SEARCH.INPUT_PLACEHOLDER));
    const newProvidedSearchQuery = 'MOuNTaINS aND OtherS';
    await act(async () => fireEvent.changeText(textInput, newProvidedSearchQuery));
    expect(textInput.props.value).toBe(newProvidedSearchQuery);
    await act(async() => fireEvent(textInput, 'submitEditing'));
    expect(spiedApiGetPhotos).toHaveBeenCalledWith(expect.objectContaining({query: newProvidedSearchQuery.toLowerCase()}));
  });

  it('should trim leading and trailing whitespace characters from the input before querying the api', async () => {
    render(<UnsplashImageSearch providedSearchQuery="" onImageDownload={null} width="100" height="100"></UnsplashImageSearch>);
    const textInput = await waitFor(() => screen.getByPlaceholderText(CONSTANT_STRINGS.UNSPLASH_IMAGE_SEARCH.INPUT_PLACEHOLDER));
    const newProvidedSearchQuery = '\n  \r mountains  \n\r';
    await act(async () => fireEvent.changeText(textInput, newProvidedSearchQuery));
    expect(textInput.props.value).toBe(newProvidedSearchQuery);
    await act(async() => fireEvent(textInput, 'submitEditing'));
    expect(spiedApiGetPhotos).toHaveBeenCalledWith(expect.objectContaining({query: 'mountains'}));
  });
});

describe('activity indicator', () => {
  it('should be shown on initial render, given a non-blank providedSearchQuery prop', async () => {
    render(<UnsplashImageSearch providedSearchQuery="test query"></UnsplashImageSearch>);
    await waitFor(() => expect(screen.getByRole('progressbar')).toBeTruthy());
  });

  it('should be hidden once the api call resolves', async () => {
    // render the component (render is wrapped in an act() call so no need to use here)
    render(<UnsplashImageSearch providedSearchQuery="test query"></UnsplashImageSearch>);
    // get the result object value of the first call to the mocked apiGetPhotos function which should be a promise
    const resultOfApiCall = spiedApiGetPhotos.mock.results[0].value;
    // wrap in act because once the promise resolves the state is updated. Await the fulfillment of act before continuing to prevent unexpected behaviour
    await act(async () => {
      // wait for the result of the api call to be resolved and check the resolved value is the mocked response object
      await expect(resultOfApiCall).resolves.toEqual(mockApiGetPhotosSuccessResponse);
    });
    // expect that the loading indicator has been removed from the component tree
    expect(screen.queryByRole('progressbar')).toBeNull();
  });
});

describe('on successful response from the api with no results', () => {
  it('should display only the warning message', async () => {
    // update the spiedApiGetPhotos mock to resolve to the unsplash empty response the next time it is called
    spiedApiGetPhotos.mockResolvedValueOnce(mockApiGetPhotosEmptyResponse);
    // render the component (render is wrapped in an act() call so no need to use here)
    render(<UnsplashImageSearch providedSearchQuery="test query"></UnsplashImageSearch>);
    // get the result object value of the first call to the mocked apiGetPhotos function which should be a promise
    const resultOfApiCall = spiedApiGetPhotos.mock.results[0].value;
    // wrap in act because once the promise resolves the state is updated. Await the fulfillment of act before continuing to prevent unexpected behaviour
    await act(async () => {
      // wait for the result of the api call to be resolved and check the resolved value is the mocked response object
      await expect(resultOfApiCall).resolves.toEqual(mockApiGetPhotosEmptyResponse);
    });
    expect(screen.getByText(CONSTANT_STRINGS.UNSPLASH_IMAGE_SEARCH.ON_NO_RESULTS_MESSAGE)).toBeDefined();
    expect(screen.queryByText(CONSTANT_STRINGS.UNSPLASH_IMAGE_SEARCH.ON_ERROR_RESPONSE_MESSAGE)).toBeNull();
    expect(screen.queryByTestId('photoItemFlatlist')).toBeNull();
  });
});

describe('on error response from api', () => {
  it('should display the first error message from the errors object in the api response', async () => {
    // update the spiedApiGetPhotos mock to resolve to the unsplash error response the next time it is called
    spiedApiGetPhotos.mockResolvedValueOnce(mockApiGetPhotosErrorResponse);
    // render the component (render is wrapped in an act() call so no need to use here)
    render(<UnsplashImageSearch providedSearchQuery="test query"></UnsplashImageSearch>);
    // get the result object value of the first call to the mocked apiGetPhotos function which should be a promise
    const resultOfApiCall = spiedApiGetPhotos.mock.results[0].value;
    // wrap in act because once the promise resolves the state is updated. Await the fulfillment of act before continuing to prevent unexpected behaviour
    await act(async () => {
      // wait for the result of the api call to be resolved and check the resolved value is the mocked response object
      await expect(resultOfApiCall).resolves.toEqual(mockApiGetPhotosErrorResponse);
    });
    expect(screen.getByText(mockApiGetPhotosErrorResponse.errors[0])).toBeDefined();
  });

  it('should display the UNSPLASH_IMAGE_SEARCH_ON_ERROR_RESPONSE_MESSAGE error message', async () => {
    // update the spiedApiGetPhotos mock to resolve to the unsplash error response the next time it is called
    spiedApiGetPhotos.mockResolvedValueOnce(mockApiGetPhotosErrorResponse);
    // render the component (render is wrapped in an act() call so no need to use here)
    render(<UnsplashImageSearch providedSearchQuery="test query"></UnsplashImageSearch>);
    // get the result object value of the first call to the mocked apiGetPhotos function which should be a promise
    const resultOfApiCall = spiedApiGetPhotos.mock.results[0].value;
    // wrap in act because once the promise resolves the state is updated. Await the fulfillment of act before continuing to prevent unexpected behaviour
    await act(async () => {
      // wait for the result of the api call to be resolved and check the resolved value is the mocked response object
      await expect(resultOfApiCall).resolves.toEqual(mockApiGetPhotosErrorResponse);
    });
    expect(screen.getByText(CONSTANT_STRINGS.UNSPLASH_IMAGE_SEARCH.ON_ERROR_RESPONSE_MESSAGE)).toBeDefined();
  });

  it('should not render the flatlist or the no results warning message', async () => {
     // update the spiedApiGetPhotos mock to resolve to the unsplash error response the next time it is called
     spiedApiGetPhotos.mockResolvedValueOnce(mockApiGetPhotosErrorResponse);
     // render the component (render is wrapped in an act() call so no need to use here)
     render(<UnsplashImageSearch providedSearchQuery="test query"></UnsplashImageSearch>);
     // get the result object value of the first call to the mocked apiGetPhotos function which should be a promise
     const resultOfApiCall = spiedApiGetPhotos.mock.results[0].value;
     // wrap in act because once the promise resolves the state is updated. Await the fulfillment of act before continuing to prevent unexpected behaviour
     await act(async () => {
       // wait for the result of the api call to be resolved and check the resolved value is the mocked response object
       await expect(resultOfApiCall).resolves.toEqual(mockApiGetPhotosErrorResponse);
     });
    expect(screen.queryByTestId('photoItemFlatlist')).toBeNull();
    expect(screen.queryByText(CONSTANT_STRINGS.UNSPLASH_IMAGE_SEARCH.ON_NO_RESULTS_MESSAGE)).toBeNull();
  });
});

describe('on success response from the api', () => {
  it('should render flatlist element', async () => {
    render(<UnsplashImageSearch providedSearchQuery="test query"></UnsplashImageSearch>);
    await waitFor(() => expect(screen.getByTestId('photoItemFlatlist')).toBeTruthy());
  });
});
