import React, { useState, useEffect } from 'react';
import { Button, Modal, Text, View, TouchableOpacity, TextInput, StyleSheet, ScrollView, BackHandler } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import AsyncStorage from '@react-native-async-storage/async-storage';

const FilterModal = ({ onCancel, onConfirmChange, visibility }) => {
  const [vividness, setVividness] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [isStartDatePickerVisible, setStartDatePickerVisibility] = useState(false);
  const [isEndDatePickerVisible, setEndDatePickerVisibility] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (visibility) {
        setAllTags(await fetchAllTags());
      }
    }
    
    fetchData();
  }, [visibility]);

  const confirmFilter = () => {
    onConfirmChange(vividness, startDate, endDate, selectedTags);
    resetValues();
  };

  const handleClose = () => {
    onCancel();
    resetValues();
  };

  const resetValues = () => {
    setStartDate('');
    setEndDate('');
    setVividness('');
    setAllTags([]);
    setSelectedTags([]);
    setStartDatePickerVisibility(false);
    setEndDatePickerVisibility(false);
  }

  const fetchAllTags = async () => {
    try {
      const existingDreams = await AsyncStorage.getItem('dreams');
      let parsedDreams = existingDreams ? JSON.parse(existingDreams) : [];
      
      let allTagsFound = [];
      parsedDreams.forEach((dream) => {
        dream.tags.forEach((tag) => {
          if (!allTagsFound.includes(tag)) {
            allTagsFound.push(tag);
          }
        });
      });

      return allTagsFound.sort();
    } catch (error) {
      console.error('Error fetching dreams:', error);
      return [];
    }
  }

  const showStartDatePicker = () => {
    setStartDatePickerVisibility(true);
  };

  const hideStartDatePicker = () => {
    setStartDatePickerVisibility(false);
  };

  const showEndDatePicker = () => {
    setEndDatePickerVisibility(true);
  };

  const hideEndDatePicker = () => {
    setEndDatePickerVisibility(false);
  };

  const handleConfirmStartDate = (date) => {
    setStartDate(new Date(date));
    hideStartDatePicker();
  };

  const handleConfirmEndDate = (date) => {
    setEndDate(new Date(date));
    hideEndDatePicker();
  };

  const handleTagSelection = (index) => {
    const selectedTag = allTags.slice(index, index + 1)[0];

    if (!selectedTags.includes(selectedTag)) {
      setSelectedTags([...selectedTags, selectedTag]);
    } else {
      const updatedSelectedTags = [...selectedTags].filter((tag) => tag !== selectedTag);
      setSelectedTags(updatedSelectedTags);
    }
  };

  const handleVividnessChange = (value) => {
    let finalValue = 0;

    if (Number.isNaN(value)) {
      finalValue = 0;
    } else if (value > 5) {
      finalValue = 5;
    } else if (value < 0) {
      finalValue = 0;
    } else {
      finalValue = value;
    }

    setVividness(finalValue.toString());
  };

  return (
    <View>
      <Modal onRequestClose={onCancel} visible={visibility} animationType="slide">
      <ScrollView style={styles.container}>
        <Text style={styles.header}>Filter Dreams</Text>

        <Text style={styles.label}>Vividness:</Text>
        <TextInput
            style={styles.input}
            placeholder="Any"
            keyboardType="numeric"
            value={vividness}
            onChangeText={handleVividnessChange}
        />
        <View style={styles.dateButtonContainer}>
          <View style={styles.datePicker}>
            <Text style={styles.label}>From:</Text>
            <View>
              <TouchableOpacity onPress={showStartDatePicker}>
                <TextInput
                    style={styles.input}
                    editable={false}
                    placeholder="Any"
                    value={startDate instanceof Date ? startDate.toDateString() : ''}
                />
              </TouchableOpacity>
            </View>
          </View>
          <Icon style={styles.removeDateIcon} name="remove" size={18} onPress={() => setStartDate('')}></Icon>
          <View style={styles.datePicker}>
            <Text style={styles.label}>To:</Text>
            <View>
              <TouchableOpacity onPress={showEndDatePicker}>
                <TextInput
                    style={styles.input}
                    editable={false}
                    placeholder="Any"
                    value={endDate instanceof Date ? endDate.toDateString() : ''}
                />
              </TouchableOpacity>
            </View>
          </View>
          <Icon style={styles.removeDateIcon} name="remove" size={18} onPress={() => setEndDate('')}></Icon>
        </View>
        
        <DateTimePickerModal
            isVisible={isStartDatePickerVisible}
            mode="date"
            onConfirm={handleConfirmStartDate}
            onCancel={hideStartDatePicker}
        />
        <DateTimePickerModal
            isVisible={isEndDatePickerVisible}
            mode="date"
            onConfirm={handleConfirmEndDate}
            onCancel={hideEndDatePicker}
        />

        <Text style={styles.label}>Tags:</Text>
        {allTags.length > 0 ? (
            <View style={styles.tagscontainer}>
            {allTags.map((tag, index) => (
              <TouchableOpacity key={index} style={[styles.tag, selectedTags.includes(tag) && styles.selectedTag]} onPress={() => handleTagSelection(index)}>
                <Text>{tag}</Text>
              </TouchableOpacity>
            ))}
            </View>
        ) : (
          <Text style={{marginTop: 7}}>(No tags available)</Text>
        )}
        
      </ScrollView>
      <View style={styles.modalButtons}>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <Icon name="close" size={24}></Icon>
        </TouchableOpacity>
        <TouchableOpacity onPress={confirmFilter} style={styles.confirmButton}>
          <Icon name="check" size={24}></Icon>
        </TouchableOpacity>
      </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
      padding: 16,
    },
    header: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 16,
    },
    label: {
      fontSize: 16,
      marginTop: 8,
    },
    input: {
      height: 40,
      borderColor: 'gray',
      borderWidth: 1,
      paddingHorizontal: 10,
      marginTop: 8,
      color: 'black'
    },
    dateButtonContainer: {
      flex: 1,
      flexDirection: 'row',
    },
    datePicker: {
      flex: 6
    },
    tagsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: 8,
    },
    selectedTag: {
      backgroundColor: 'lightblue',
      color: 'white',
    },
    tagscontainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      flexWrap: 'wrap',
      borderWidth: 1,
      borderColor: 'gray',
      padding: 10,
      paddingBottom: 2,
      marginTop: 8,
      marginBottom: 90
    },
    tag: {
      backgroundColor: '#f0f0f0',
      padding: 8,
      borderRadius: 4,
      marginRight: 8,
      marginBottom: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    modalButtons: {
      position: 'absolute',
      flexDirection: 'row',
      justifyContent: 'space-between',
      bottom: 0,
      backgroundColor: '#f4f4f4',
      padding: 10
    },
    closeButton: {
      flex: 1,
      padding: 10,
      backgroundColor: 'lightgrey',
      borderRadius: 5,
      alignItems: 'center',
      marginRight: 5,
      marginLeft: 10
    },
    confirmButton: {
      flex: 1,
      padding: 10,
      backgroundColor: '#7fff00',
      borderRadius: 5,
      alignItems: 'center',
      marginLeft: 5,
      marginRight: 10
    },
    removeDateIcon: {
      marginTop: 48,
      flex: 1,
      paddingLeft: 9
    }
  });

export default FilterModal;