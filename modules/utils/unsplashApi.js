import { setupURLPolyfill } from 'react-native-url-polyfill';
import { createApi } from "unsplash-js";
import UnsplashKeys from '../../local/unsplashkeys';

setupURLPolyfill();

const api = createApi({
  accessKey: UnsplashKeys.accessKey,
});

const apiGetPhotos = (args) => {
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