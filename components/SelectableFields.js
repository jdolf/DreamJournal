import React, {useState, useEffect} from 'react';
import {TextInput, Text, View, StyleSheet, KeyboardAvoidingView, Alert} from 'react-native';
import TouchableField from '../components/TouchableField';

const SelectableFields = ({onValueChange, value}) => {
  const [selectedValue, setSelectedValue] = useState(0);

  useEffect(() => {
    calcHighlightedField(value);
  }, []);

  const calcHighlightedField = (value) => {
    setSelectedValue(value);
    onValueChange(value);
  }

  return (
    <View style={styles.vividness}>
        <Text style={styles.vividnesstext}>Vividness</Text>
        <View style={styles.touchablefields}>
            <TouchableField onChildClick={calcHighlightedField} value='0' selectedValue={selectedValue}></TouchableField>
            <TouchableField onChildClick={calcHighlightedField} value='1' selectedValue={selectedValue}></TouchableField>
            <TouchableField onChildClick={calcHighlightedField} value='2' selectedValue={selectedValue}></TouchableField>
            <TouchableField onChildClick={calcHighlightedField} value='3' selectedValue={selectedValue}></TouchableField>
            <TouchableField onChildClick={calcHighlightedField} value='4' selectedValue={selectedValue}></TouchableField>
            <TouchableField onChildClick={calcHighlightedField} value='5' selectedValue={selectedValue}></TouchableField>
        </View>
    </View>
  );
};

const styles = StyleSheet.create({
    vividnesstext: {
        fontSize: 16,
        textAlign: 'center',
        textAlignVertical: 'center',
        fontWeight: 'bold',
        flex: 1
    },
    vividness: {
        flexDirection: 'row',
        marginTop: 10,
        marginBottom: 10,
    },
    touchablefields: {
        flex: 3.5,
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        marginRight: 5
    }
  });

  export default SelectableFields;