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

const deleteLocallyStoredImage = (imageUri) => {
  //delete the file at the given location. Don't throw an error if no file found.
  FileSystem.deleteAsync(imageUri, {idempotent: true})
}

export { downloadRemoteImageToLocalStorage, deleteLocallyStoredImage }