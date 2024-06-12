import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

const UploadScreen = () => {
  const [imageUri, setImageUri] = useState(null);

  const takePhotoFromCamera = () => {
    launchCamera({ mediaType: 'photo', saveToPhotos: true }, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorCode);
      } else {
        const uri = response.assets[0].uri;
        setImageUri(uri);
      }
    });
  };

  const choosePhotoFromLibrary = () => {
    launchImageLibrary({ mediaType: 'photo' }, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorCode);
      } else {
        const uri = response.assets[0].uri;
        setImageUri(uri);
      }
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Upload Bill</Text>
      <View style={styles.imageContainer}>
        {imageUri ? <Image source={{ uri: imageUri }} style={styles.image} /> : null}
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={takePhotoFromCamera}>
          <Text style={styles.buttonText}>Take Photo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={choosePhotoFromLibrary}>
          <Text style={styles.buttonText}>Choose from Library</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 20,
    marginBottom: 20,
  },
  imageContainer: {
    marginBottom: 20,
    width: '100%',
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    backgroundColor: '#5fa052',
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  buttonText: {
    color: 'white',
  },
});

export default UploadScreen;
