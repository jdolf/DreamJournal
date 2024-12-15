import React, { useState } from 'react';
import { View, ScrollView, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Modal from 'react-native-modal';
import Icon from 'react-native-vector-icons/FontAwesome';
import Toast from 'react-native-toast-message';

const AutoTagButton = ({ onFetchAutoTags, onConfirm }) => {
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);
  const [tags, setTags] = useState([]);

  const toggleModal = async () => {
    const fetchedTags = await onFetchAutoTags();
    setTags(fetchedTags);
    if (fetchedTags.length > 0) {
      setModalVisible(!isModalVisible);
    } else {
      Toast.show({
        type: 'info',
        text1: 'No nouns or names found in the description'
      });
    }
  };

  const handleTagPress = (tag) => {
    setSelectedTags((prevSelectedTags) =>
      prevSelectedTags.includes(tag)
        ? prevSelectedTags.filter((selectedTag) => selectedTag !== tag)
        : [...prevSelectedTags, tag]
    );
  };

  const handleConfirm = () => {
    console.log('Selected Tags:', selectedTags);
    setModalVisible(false);
    onConfirm(selectedTags);
    setTags([]);
    setSelectedTags([]);
  };

  const handleClose = () => {
    setModalVisible(false);
    setTags([]);
    setSelectedTags([]);
  };

  return (
    <View>
      <TouchableOpacity onPress={toggleModal}>
        <Icon name="cogs" size={24}></Icon><Text>Auto</Text>
      </TouchableOpacity>

      {/* Tag selection modal */}
      <Modal isVisible={isModalVisible}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Select Tags</Text>
          <ScrollView>
            {tags.map((tag, index) => (
              <TouchableOpacity
                key={tag}
                onPress={() => handleTagPress(tag)}
                style={[
                  styles.tagItem,
                  selectedTags.includes(tag) && styles.selectedTagItem,
                  index === 0 && styles.firstTagItem,
                ]}
              >
                <Text style={[styles.tagText, selectedTags.includes(tag) && styles.selectedTagText]}>
                  {tag}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.modalButtons}>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Icon name="close" size={24}></Icon>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleConfirm} style={styles.confirmButton}>
              <Icon name="check" size={24}></Icon>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    marginTop: 150,
    marginBottom: 150,
    marginLeft: 30,
    marginRight: 30
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  firstTagItem: {
    borderColor: '#cccccc',
  },
  tagItem: {
    padding: 10,
    borderColor: '#cccccc',
  },
  selectedTagItem: {
    backgroundColor: '#ededed',
  },
  tagText: {
    fontSize: 16,
  },
  selectedTagText: {
    fontWeight: 'bold',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  closeButton: {
    flex: 1,
    padding: 10,
    backgroundColor: 'lightgrey',
    borderRadius: 5,
    alignItems: 'center',
    marginRight: 5
  },
  confirmButton: {
    flex: 1,
    padding: 10,
    backgroundColor: '#7fff00',
    borderRadius: 5,
    alignItems: 'center',
    marginLeft: 5,
  }
});

export default AutoTagButton;
