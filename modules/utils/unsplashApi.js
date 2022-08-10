import { setupURLPolyfill } from 'react-native-url-polyfill';
import { createApi } from "unsplash-js";
import UnsplashKeys from '../../local/unsplashkeys';

setupURLPolyfill();

const api = createApi({
  accessKey: UnsplashKeys.accessKey,
});

const apiGetPhotos = (args) => {
  // From the Unsplash API docs about the following function
    // When making a request using this SDK, there are 2 possible outcomes to a request.
    // Error: we return a result.errors object containing an array of strings (each one representing one error) and result.source describing the origin of the error (e.g. api, decoding). Typically, you will only have on item in this array.
    // Success: we return a result.response object containing the data.
  return api.search.getPhotos(args);
}

const notifyUnsplashOfImageDownload = (photo) => {
  try{
    api.photos.trackDownload({ downloadLocation: photo.links.download_location });
  }
  catch (error) {
    console.error(`notifyUnsplashOfImageDownload: encountered an error -> ${error}`)
  }
}

export {apiGetPhotos, notifyUnsplashOfImageDownload}