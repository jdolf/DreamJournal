import React, { useState, useEffect } from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import nlp from 'compromise';
import AutoTagButton from './AutoTagButton';
import Toast from 'react-native-toast-message';

const TagInput = ({ description, value, onTagsChanged }) => {
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    addAutoTags(value);
  }, []);

  useEffect(() => {
    onTagsChanged(tags);
    console.log(tags);
  }, [tags]);

  const addTag = () => {
    let purifiedValue = tagInput.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
    if (purifiedValue !== '' && !tags.includes(purifiedValue)) {
      setTags([...tags, purifiedValue.trim()]);
      setTagInput('');
    } else {
      Toast.show({
        type: 'info',
        text1: 'Identical tag name already exists inside tags'
      });
    }
  };

  const addAutoTags = (values) => {
    values.forEach((value, index) => {
      let purifiedValue = value.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
      if (value !== '' && !tags.includes(purifiedValue)) {
        setTags((prevTags) => {
          if (!prevTags.includes(purifiedValue.trim())) {
            console.log(purifiedValue);
            return [...prevTags, purifiedValue.trim()];
          }
          return prevTags;
        });
      }
    });
  };

  const removeTag = (index) => {
    const reversedIndex = [...tags].length - 1 - index;

    const updatedTags = [...tags];
    updatedTags.splice(reversedIndex, 1);
    setTags(updatedTags);
  };

  const fetchAutoTags = async () => {
    let doc = nlp(description).normalize();
    let docRemovedNouns = doc.remove('#Pronoun').remove("#Uncountable").remove("#Possessive").remove("#Demonym");
    doc.debug();
    const foundNouns = docRemovedNouns.match('#Noun').nouns().toSingular().out('array');

    let purifiedNouns = [];
    foundNouns.forEach((value) => {
      let purifiedValue = value.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
      if (value !== '' && !tags.includes(purifiedValue) && !purifiedNouns.includes(purifiedValue)) {
          purifiedNouns.push(purifiedValue);
      }
    })

    return purifiedNouns;
  }

  return (
    <View style={styles.container}>
      <View style={styles.inputcontainer}>
        <TouchableOpacity style={styles.addbutton} onPress={addTag}>
          <Icon name="plus-square-o" size={28}></Icon>
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          placeholder="Add Tag"
          value={tagInput}
          onChangeText={(text) => setTagInput(text)}
        />
        <AutoTagButton style={styles.autobutton} onFetchAutoTags={fetchAutoTags} onConfirm={addAutoTags}></AutoTagButton>
      </View>
      <ScrollView style={styles.tagscontainer} horizontal>
        {[...tags].reverse().map((tag, index) => (
          <TouchableOpacity key={index} style={styles.tag} onPress={() => removeTag(index)}>
            <Text>{tag}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    paddingBottom: 0
  },
  inputcontainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  input: {
    flex: 1,
    marginLeft: 8,
    marginRight: 11,
    paddingLeft: 10,
    paddingTop: 3,
    paddingBottom: 3,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    height: 38
  },
  addbutton: {
    width: 38,
    height: 38,
    padding: 2,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagscontainer: {
    flexDirection: 'row'
  },
  tag: {
    backgroundColor: '#f0f0f0',
    padding: 8,
    borderRadius: 4,
    marginRight: 8,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default TagInput;