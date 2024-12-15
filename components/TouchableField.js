import React, {useState} from 'react';
import {TouchableHighlight, StyleSheet, Button, Text, View} from 'react-native';

const TouchableField = (props) => {
    const handlePress = () => (
      props.onChildClick(props.value)
    );

    const getColorBasedOnValue = (value) => {
      if (value == 0) {
        return '#979197';
      } else if (value == 1) {
        return '#fced93';
      } else if (value == 2) {
        return '#d7f67c';
      } else if (value == 3) {
        return '#c2eac2';
      } else if (value == 4) {
        return '#92d9aa';
      } else if (value == 5) {
        return '#87ceeb';
      } else {
        return "#ffffff";
      }
    };

  return (
    <View>
        <TouchableHighlight activeOpacity={0.6} underlayColor="#DDDDDD" onPress={handlePress}>
            <View style={[props.selectedValue == props.value ? [styles.itemhighlighted, {backgroundColor: getColorBasedOnValue(props.value)}] : styles.itemunhighlighted]}>
                <Text style={styles.text}>{props.value}</Text>
            </View>
        </TouchableHighlight>
    </View>
  );
};

const styles = StyleSheet.create({
    itemhighlighted: {
      alignItems: 'center',
      backgroundColor: '#add8e6',
      paddingTop: 10,
      paddingBottom: 10,
      paddingLeft: 18,
      paddingRight: 18,
      borderRadius: 5
    },
    itemunhighlighted: {
      alignItems: 'center',
      backgroundColor: '#DDDDDD',
      paddingTop: 10,
      paddingBottom: 10,
      paddingLeft: 18,
      paddingRight: 18,
      borderRadius: 5
    },
    text: {
      fontSize: 20
    }
  });

export default TouchableField;