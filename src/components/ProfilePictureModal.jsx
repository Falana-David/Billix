import React from 'react';
import { View, Text, TouchableOpacity, Image, Modal, FlatList, StyleSheet } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';

const presetImages = [
  { id: '1', uri: 'https://via.placeholder.com/100/1' },
  { id: '2', uri: 'https://via.placeholder.com/100/2' },
  { id: '3', uri: 'https://via.placeholder.com/100/3' },
  { id: '4', uri: 'https://via.placeholder.com/100/4' },
  { id: '5', uri: 'https://via.placeholder.com/100/5' },
  { id: '6', uri: 'https://via.placeholder.com/100/6' },
  { id: '7', uri: 'https://via.placeholder.com/100/7' },
  { id: '8', uri: 'https://via.placeholder.com/100/8' },
  { id: '9', uri: 'https://via.placeholder.com/100/9' },
  { id: '10', uri: 'https://via.placeholder.com/100/10' },
];

const ProfilePictureModal = ({ visible, setVisible, setProfilePicture }) => {

  const handleSelectImage = () => {
    const options = {
      mediaType: 'photo',
    };

    launchImageLibrary(options, response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else {
        const source = { uri: response.assets[0].uri };
        setProfilePicture(source);
        setVisible(false);
      }
    });
  };

  const selectPresetImage = (uri) => {
    setProfilePicture({ uri });
    setVisible(false);
  };

  return (
    <Modal visible={visible} transparent={true} animationType="slide">
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Select a Profile Picture</Text>
          <TouchableOpacity style={styles.button} onPress={handleSelectImage}>
            <Text style={styles.buttonText}>Upload from Gallery</Text>
          </TouchableOpacity>
          <FlatList
            data={presetImages}
            keyExtractor={item => item.id}
            numColumns={5}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => selectPresetImage(item.uri)}>
                <Image style={styles.presetImage} source={{ uri: item.uri }} />
              </TouchableOpacity>
            )}
          />
          <TouchableOpacity style={styles.button} onPress={() => setVisible(false)}>
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#5fa052',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  presetImage: {
    width: 50,
    height: 50,
    margin: 5,
  },
});

export default ProfilePictureModal;
