import React, {useState, useEffect} from 'react';
import {Text, ScrollView, TextInput, TouchableOpacity, View, StyleSheet, KeyboardAvoidingView, BackHandler, Alert} from 'react-native';
import SelectableFields from '../components/SelectableFields';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import TagInput from '../components/TagInput';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/FontAwesome';
import DateTimePickerModal from "react-native-modal-datetime-picker";

const DreamScreen = ({ route }) => {
  // Fetch potential route parameters
  const passedDream = route.params?.dream;
  
  let passedId, passedVividness, passedTitle, passedDescription, passedTags;

  if (passedDream !== undefined) {
    passedId = passedDream.id;
    passedVividness = passedDream.vividness;
    passedTitle = passedDream.title;
    passedDescription = passedDream.description;
    passedTags = passedDream.tags;
  }

  const [id, setId] = useState(passedId || '_' + Math.random().toString(36).substr(2, 9));
  const [vividness, setVividness] = useState(passedVividness || 0);
  const [title, setTitle] = useState(passedTitle || '');
  const [description, setDescription] = useState(passedDescription || '');
  const [tags, setTags] = useState(passedTags || []);
  const [customDate, setCustomDate] = useState('');
  const [isCustomDatePickerVisible, setCustomDatePickerVisibility] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', async (e) => {
      await save();
      route.params?.onSaved();
    });
    return unsubscribe;
  }, [title, description, vividness, tags, customDate]);

  useEffect(() => {
    navigation.setOptions({
      title: route.params.isEditing ? "Edit Dream" : "Create Dream",
      headerRight: () => (
        <TouchableOpacity onPress={showCustomDatePicker}>
          <Icon style={[styles.menuEntry, {paddingTop: 5, marginTop: 0, marginRight: -3}]} name="calendar" size={28} />
        </TouchableOpacity>
      )
    });
  }, []);

  const save = async () => {
    if (title.length <= 0 && description.length <= 0 && tags.length == 0) {
      Toast.show({
        type: 'info',
        text1: 'Input is empty. Not creating dream.'
      });
      console.log("The input is empty. Not saving.");
      return;
    }

    try {
      // Retrieve dreams array
      const existingDreams = await AsyncStorage.getItem('dreams');
      let parsedDreams = existingDreams ? JSON.parse(existingDreams) : [];

      // Retrieve dreams backup array
      const existingDreamsBackup = await AsyncStorage.getItem('dreams_backup');
      let parsedDreamsBackup = existingDreamsBackup ? JSON.parse(existingDreamsBackup) : [];

      let idToInsert = id;
      let vividnessToInsert = vividness;
      let titleToInsert = title.length === 0 ? "Untitled" : title;
      let descriptionToInsert = description.length === 0 ? "" : description;
      let tagsToInsert = tags.length === 0 ? [] : tags;
      let dateToInsert = (customDate instanceof Date ? customDate : (passedDream !== undefined ? new Date(passedDream.date) : new Date()))

      console.log(customDate);
      console.log((customDate instanceof Date ? "1" : (passedDream !== undefined ? "2" : "3")));

      // Create new dream
      let dream = {
        id: idToInsert,
        vividness: vividnessToInsert,
        title: titleToInsert,
        description: descriptionToInsert,
        tags: tagsToInsert,
        date: dateToInsert
      };

      // Check if id already exists
      const existingDreamIndex = parsedDreams.findIndex(dream => id === dream.id);

      // If id already exists, edit dream instead
      if (existingDreamIndex !== -1) {
        console.log(dream.date);
        parsedDreams[existingDreamIndex] = dream;
      } else {
        console.log("yep , created");
        console.log(dream.date.toDateString());
        parsedDreams.push(dream);
      }

      // Always add dream new backup
      parsedDreamsBackup.push(dream);

      const jsonDreams = JSON.stringify(parsedDreams);
      const jsonDreamsBackup = JSON.stringify(parsedDreamsBackup);
      await AsyncStorage.setItem('dreams', jsonDreams);
      await AsyncStorage.setItem('dreams_backup', jsonDreamsBackup);
      console.log("Saved");
    } catch (e) {
      console.log("Saving error");
    }
  };

  const showCustomDatePicker = () => {
    setCustomDatePickerVisibility(true);
  };

  const hideCustomDatePicker = () => {
    setCustomDatePickerVisibility(false);
  };

  const handleConfirmCustomDate = (date) => {
    setCustomDate(new Date(date));
    hideCustomDatePicker();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.date}>{customDate instanceof Date ? customDate.toDateString() : (passedDream !== undefined ? new Date(passedDream.date).toDateString() : new Date().toDateString())}</Text>
      <SelectableFields value={vividness} onValueChange={value => setVividness(value)}></SelectableFields>
      <TextInput style={styles.title} value={title} placeholder="Dream Title" onChangeText={text => setTitle(text)} />
      <ScrollView style={(tags.length === 0 ? styles.scrollview : styles.scrollviewWithTags)}>
        <TextInput style={styles.description} multiline value={description} placeholder="Description" onChangeText={text => setDescription(text)} />
      </ScrollView>
      <KeyboardAvoidingView style={styles.tags}>
        <TagInput onTagsChanged={tags => setTags(tags)} description={description} value={tags}></TagInput>
      </KeyboardAvoidingView>
      <DateTimePickerModal
        isVisible={isCustomDatePickerVisible}
        mode="date"
        onConfirm={handleConfirmCustomDate}
        onCancel={hideCustomDatePicker}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 5,
    marginRight: 5
  },
  scrollview: {
    marginBottom: 63
  },
  scrollviewWithTags: {
    marginBottom: 105
  },
  description: {
    fontSize: 16,
    marginLeft: 5,
    marginRight: 5
  },
  vividness: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginLeft: 25,
    marginRight: 25,
  },
  tags: {
    backgroundColor: '#DDDDDD',
    position: 'absolute',
    bottom: 0,
    width: '100%'
  },
  tagstext: {
    textAlignVertical: 'center',
    flex: 1,
    fontWeight: 'bold',
    paddingLeft: 5
  },
  menuEntry: {
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 5,
    paddingBottom: 5,
    alignItems: 'center',
    alignContent: 'center',
    justifyContent: 'flex-end'
  },
  date: {
    textAlign: 'right',
    marginRight: 13,
    marginTop: 5,
    marginBottom: -5,
    fontSize: 12
  }
});

export default DreamScreen;