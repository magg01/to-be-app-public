import * as FileSystem from 'expo-file-system';

const downloadRemoteImageToLocalStorage = (imageUrl, filepathSuffix) => {
  return new Promise((resolve, reject) => {
    FileSystem.downloadAsync(
      imageUrl,
      FileSystem.documentDirectory + filepathSuffix
    )
    .then(({ uri }) => {
      console.log('Finished downloading to ', uri);
      resolve(uri);
    })
    .catch(error => {
      console.error(`downloadRemoteImageToLocalStorage encountered an error -> ${error}`);
      reject(error);        
    });
  })
}

export { downloadRemoteImageToLocalStorage }