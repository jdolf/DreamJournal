import React, {useState, useEffect} from 'react';
import {Modal, Text, View, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity, BackHandler, Alert} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome';
import FilterModal from '../components/FilterModal';
import Toast from 'react-native-toast-message';
import RNFS from 'react-native-fs';

const HomeScreen = ({ navigation }) => {
  const [dreams, setDreams] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [isSelectionMode, setSelectedMode] = useState(false);
  const [selectedDreams, setSelectedDreams] = useState([]);
  const [isUsingFilter, setUsingFilter] = useState(false);
  const [vividnessFilter, setVividnessFilter] = useState('');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');
  const [selectedTagsFilter, setSelectedTagsFilter] = useState([]);
  const [isPopoverVisible, setPopoverVisible] = useState(false);
  const [popoverPosition, setPopoverPosition] = useState({ x: 0, y: 0 });
  let currentMonthCounter = '';

  useEffect(() => {
    if (isSelectionMode && selectedDreams.length == 0) {
      handleSelectionCancel();
    }
  }, [selectedDreams]);

  useEffect(() => {
    const fetchData = async () => {
      updateDisplayedDreams(isUsingFilter);
    }

    fetchData();
  }, [isUsingFilter]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', (e) => {
      if (isSelectionMode) {
        handleSelectionCancel();
        return true;
      }
    });
    return () => backHandler.remove();
  }, [isSelectionMode]);

  useEffect(() => {
    console.log("current isUsingFilter");
    console.log(isUsingFilter);
    navigation.setOptions({
      title: isSelectionMode ? selectedDreams.length.toString() : 'Dreams',
      headerRight: () => (
        <>
          {isSelectionMode && (
            <>
              <TouchableOpacity onPress={exportSelections}>
                <Icon style={[styles.menuEntry, {marginRight: 7, marginTop: 3}]} name="download" size={28} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDelete}>
                <Icon style={[styles.menuEntry, {marginRight: 13}]} name="trash" size={28} />
              </TouchableOpacity>
              <TouchableOpacity onPress={showOptions}>
                <Icon style={[styles.menuEntry, {paddingTop: 5, marginTop: 3, marginRight: -3}]} name="ellipsis-v" size={28} />
              </TouchableOpacity>
            </>
          )}
          <>
          {!isSelectionMode && (
            <>
              {isUsingFilter && (
                  <TouchableOpacity style={styles.filterEnabled} onPress={handleFilterRemove}>
                    <Icon style={styles.filterEnabledIcon} size={14} name='remove'></Icon><Text style={styles.filterEnabledText}>Filter enabled</Text>
                  </TouchableOpacity>
              )}
              <TouchableOpacity onPress={toggleModal}>
                <Icon name="filter" size={28} />
              </TouchableOpacity>
            </>
          )}
          </>
        </>
      ),
      headerLeft: () => (
        <>
          {isSelectionMode && (
            <TouchableOpacity onPress={handleSelectionCancel}>
              <Icon name="remove" size={28} style={[{marginRight: 18}]} />
            </TouchableOpacity>
          )}
        </>
      )
    });
  }, [navigation, isSelectionMode, selectedDreams, isUsingFilter]);

  const toggleModal = () => {
    setModalVisible(!modalVisible);
  };

  const exportSelections = async () => {
    const currentDate = new Date();

    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    const hours = String(currentDate.getHours()).padStart(2, '0');
    const minutes = String(currentDate.getMinutes()).padStart(2, '0');
    const seconds = String(currentDate.getSeconds()).padStart(2, '0');

    const dateTimeString = `${year}-${month}-${day}-${hours}-${minutes}-${seconds}`;
    const directoryPath = RNFS.DownloadDirectoryPath;

    const filePath = directoryPath + "/DreamDump" + "_" + dateTimeString + ".txt";
    let fileContent = "";


    selectedDreams.forEach(dream => {
      const dreamDate = new Date(dream.date);

      const year = dreamDate.getFullYear();
      const month = String(dreamDate.getMonth() + 1).padStart(2, '0');
      const day = String(dreamDate.getDate()).padStart(2, '0');
      const hours = String(dreamDate.getHours()).padStart(2, '0');
      const minutes = String(dreamDate.getMinutes()).padStart(2, '0');
      const seconds = String(dreamDate.getSeconds()).padStart(2, '0');
      const dreamDateTimeString = `${year}-${month}-${day}-${hours}-${minutes}-${seconds}`;

      fileContent += dream.title + "\n" + dream.description + "\nTags: " + dream.tags.toString() + "\nVividness: " + dream.vividness + "\n" + dreamDateTimeString + "\n\n\n";
      console.log(fileContent);
    });

    RNFS.writeFile(filePath, fileContent, 'utf8')
    .then((success) => {
      Toast.show({
        type: 'success',
        text1: 'Export file successfully created under /Downloads'
      });
      console.log('Export file created');
    })
    .catch((err) => {
      Toast.show({
        type: 'error',
        text1: 'Failed to create export file',
        text2: "Error message: " + err.message
      });
      console.log(err.message);
    });

    handleSelectionCancel();
  };

  const updateDisplayedDreams = async (usesFilter) => {
    setDreams([]);
    setIsLoading(true);

    if (usesFilter) {
      await fetchDreamsWithFilter();
    } else {
      await fetchDreams();
    }
  
    currentMonthCounter = '';
    setIsLoading(false);
  };

  const fetchDreams = async () => {
    try {
      const existingDreams = await AsyncStorage.getItem('dreams');
      let parsedDreams = existingDreams ? JSON.parse(existingDreams).sort((a, b) => {return new Date(a.date) - new Date(b.date)}) : [];
      setDreams(parsedDreams);
    } catch (error) {
      console.error('Error fetching dreams:', error);
      return [];
    }
  };

  const stripTime = (date) => {
    // Set the time part to midnight (00:00:00)
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  };

  const fetchDreamsWithFilter = async () => {
    let currentVividness, currentStartDate, currentEndDate, currentSelectedTags; 
    setVividnessFilter(currentFilter => currentVividness = currentFilter);
    setStartDateFilter(currentFilter => currentStartDate = currentFilter);
    setEndDateFilter(currentFilter => currentEndDate = currentFilter);
    setSelectedTagsFilter(currentFilter => currentSelectedTags = currentFilter);

    try {
      const existingDreams = await AsyncStorage.getItem('dreams');
      let relevantDreams = existingDreams ? JSON.parse(existingDreams).sort((a, b) => {return new Date(a.date) - new Date(b.date)}) : [];

      // Filter vividness
      if (currentVividness != '') {
        relevantDreams = relevantDreams.filter(dream => dream.vividness == currentVividness);
      }

      // Filter dates
      const convertedStartDate = stripTime(new Date(currentStartDate));
      const convertedEndDate = stripTime(new Date(currentEndDate));
      if (currentStartDate != '' && currentEndDate != '') {
        relevantDreams = relevantDreams.filter(dream => {
          const convertedDreamDate = stripTime(new Date(dream.date));
          return convertedDreamDate >= convertedStartDate && convertedDreamDate < convertedEndDate ? true : false;
        });
      } else if (currentStartDate != '') {
        relevantDreams = relevantDreams.filter(dream => {
          const convertedDreamDate = stripTime(new Date(dream.date));
          return convertedDreamDate >= convertedStartDate ? true : false;
        });
      } else if (currentEndDate != '') {
        relevantDreams = relevantDreams.filter(dream => {
          const convertedDreamDate = stripTime(new Date(dream.date));
          return convertedDreamDate <= convertedEndDate ? true : false;
        });
      }

      // Filter tags
      if (currentSelectedTags.length > 0) {
        relevantDreams = relevantDreams.filter(dream => {
          let containsRelevantTags = false;
          dream.tags.forEach(tag => {
            if (currentSelectedTags.includes(tag)) {
              containsRelevantTags = true;
              return;
            }
          })
          return containsRelevantTags;
        });
      }

      setDreams(relevantDreams);
    } catch (error) {
      console.error('Error fetching dreams:', error);
      return [];
    }
  };

  const getColorBasedOnVividness = (value) => {
    if (value == 0) {
      return '#f2f2f2';
    } else if (value == 1) {
      return '#fff8cd';
    } else if (value == 2) {
      return '#efffd8';
    } else if (value == 3) {
      return '#d2ffd2';
    } else if (value == 4) {
      return '#b0ebc1';
    } else if (value == 5) {
      return '#87ceeb';
    } else {
      return "#ffffff";
    }
  };

  const handleFilterConfirm = (vividness, startDate, endDate, selectedTags) => {
    if (vividness != '' || startDate != '' || endDate != '' || selectedTags.length > 0) {
      setVividnessFilter(vividness);
      setStartDateFilter(startDate);
      setEndDateFilter(endDate);
      setSelectedTagsFilter(selectedTags);

      // Force manual update if filter was already enabled before this
      if (isUsingFilter) {
        updateDisplayedDreams(true);
      } else {
        setUsingFilter(true);
      }
    } else {
      setUsingFilter(false);
    }
    
    toggleModal();
  };

  const handleDelete = async () => {
    Alert.alert(
      "Delete dreams",
      'Delete the selected dreams?',
      [
        {
          text: 'Cancel',
          onPress: () => console.log('No Pressed'),
          style: 'cancel',
        },
        {
          text: 'Confirm',
          onPress: () => {
            console.log('Yes Pressed');
            deleteSelections();
          },
        },
      ],
      { cancelable: true }
    );
  }

  const deleteSelections = async () => {
    // Get all unfiltered dreams
    const existingDreams = await AsyncStorage.getItem('dreams');
    let parsedDreams = existingDreams ? JSON.parse(existingDreams) : [];

    selectedDreams.forEach(dream => {
      // Returns all dreams that don't include that specific, selected dream
      parsedDreams = parsedDreams.filter((dreamComparison) => dreamComparison.id !== dream.id)
    });

    const jsonDreams = JSON.stringify(parsedDreams);
    await AsyncStorage.setItem('dreams', jsonDreams);
    updateDisplayedDreams(isUsingFilter);

    Toast.show({
      type: 'success',
      text1: 'Dreams successfully deleted'
    });

    handleSelectionCancel();
  }

  const handleLongDreamPress = (index) => {
    if (!isSelectionMode) {
      const reversedIndex = [...dreams].length - 1 - index;
      const selectedDream = dreams.slice(reversedIndex, reversedIndex + 1)[0];
      setSelectedDreams([...selectedDreams, selectedDream]);
    } else {
      setSelectedDreams([]);
    }

    setSelectedMode(!isSelectionMode);
  }

  const handleShortDreamPress = (index) => {
    const reversedIndex = [...dreams].length - 1 - index;
    const selectedDream = dreams.slice(reversedIndex, reversedIndex + 1)[0];

    if (!isSelectionMode) {
      navigation.navigate("Dream", {
        dream: selectedDream,
        onSaved: () => updateDisplayedDreams.bind(this)(isUsingFilter),
        isEditing: true
      });
    } else {
      if (selectedDreams.includes(selectedDream)) {
        const updatedSelectedDreams = [...selectedDreams].filter((dream) => dream !== selectedDream);
        setSelectedDreams(updatedSelectedDreams);
      } else {
        setSelectedDreams([...selectedDreams, selectedDream]);
      }
    }
  }

  const handleSelectionCancel = () => {
    setSelectedMode(false);
    setSelectedDreams([]);
  }

  const handlePlusPress = () => {
    handleSelectionCancel();
    navigation.navigate("Dream", {
      onSaved: () => updateDisplayedDreams.bind(this)(isUsingFilter),
      isEditing: false
    });
  }

  const handleFilterCancel = () => {
    toggleModal();
  }

  const handleFilterRemove = () => {
    setUsingFilter(false);
  }

  // ----- Popover options -----
  const showOptions = (event) => {
    const { pageX, pageY } = event.nativeEvent;
    setPopoverPosition({ x: pageX, y: pageY });
    setPopoverVisible(true);
  }

  const hideOptions = () => {
    setPopoverVisible(false);
  }

  const selectAll = () => {
    setSelectedDreams([]);
    let targetedDreams = [];
    dreams.forEach(dream => {
      targetedDreams.push(dream);
    });
    setSelectedDreams(targetedDreams);
    hideOptions();
  }

  // ----- Date comparison -----
  const compareYearAndMonth = (date1, date2) => {
    // Also return false if date1 is empty
    if (date1 == '') {
      currentMonthCounter = date2;
      return false;
    }

    date1 = new Date(date1);
    date2 = new Date(date2);

    const year1 = date1.getFullYear();
    const month1 = date1.getMonth();
  
    const year2 = date2.getFullYear();
    const month2 = date2.getMonth();
  
    if (year1 === year2 && month1 === month2) {
      return true;
    } else {
      currentMonthCounter = date2;
      return false;
    }
  }

  return (
    <View style={styles.wrapper}>
      <FilterModal visibility={modalVisible} onConfirmChange={handleFilterConfirm} onCancel={handleFilterCancel} />
      {dreams.length > 0 ? (
      <ScrollView style={styles.scrollcontent}>
        <View style={styles.container}>
          { [...dreams].reverse().map((dream, index) =>
          <>
            {!compareYearAndMonth(currentMonthCounter, dream.date) && (
              <View style={styles.monthlydate}>
                <Text style={styles.monthlydatetext}>{new Date(dream.date).toLocaleString('en-us', { month: 'long' })} {new Date(dream.date).getFullYear()}</Text>
              </View>
            )}
            <View key={dream.id} style={[styles.dream, selectedDreams.includes(dream) && styles.selectedDream]}>
              <View>
                <TouchableOpacity onPress={() => handleShortDreamPress(index)} onLongPress={() => handleLongDreamPress(index)}>
                  <View style={[styles.dreamcircle, {backgroundColor: getColorBasedOnVividness(dream.vividness)}]}>
                    <Text style={styles.dreamcircletext}>{dream.vividness}</Text>
                  </View>
                  <Text style={styles.title} numberOfLines={2} ellipsizeMode="tail">{dream.title}</Text>
                  {dream.tags.length > 0 ? (
                    <Text style={{height: 68}} numberOfLines={4} ellipsizeMode="tail">{dream.description.length > 0 ? dream.description : 'No description'}</Text>
                  ) : (
                    <Text style={{height: 105}} numberOfLines={6} ellipsizeMode="tail">{dream.description.length > 0 ? dream.description : 'No description'}</Text>
                  )}
                </TouchableOpacity>
                {dream.tags.length > 0 && (
                  <ScrollView style={styles.tagscontainer} horizontal>
                  {dream.tags.map((tag) => (
                    <View style={styles.tag}>
                      <Text>{tag}</Text>
                    </View>
                  ))}
                  </ScrollView>
                )}
              </View>
              <View style={styles.dreamdate}>
                <Text style={styles.dreamdatetext}>{stripTime(new Date(dream.date)).toDateString()}</Text>
              </View>
            </View>
          </>
          )}
        </View>
      </ScrollView>
      ) : (
        isUsingFilter ? (
          <View style={styles.middlecenter}>
            <Text>No dreams matching the current filter</Text>
          </View>
        ) : (
          <View style={styles.middlecenter}>
            <Text>Add a new dream using the + button</Text>
          </View>
        )
        
      )}
      { isLoading && (
        <View style={styles.middlecenter}>
          <ActivityIndicator size="large" />
        </View>
      )}
      <TouchableOpacity style={styles.circle} onPress={handlePlusPress}>
        <Icon name="plus" size={24} color="#ffffff"></Icon>
      </TouchableOpacity>
      <Modal transparent visible={isPopoverVisible} onRequestClose={hideOptions}>
        <TouchableOpacity style={styles.overlay} onPress={hideOptions}>
          <View style={[styles.popupMenu, { right: 5 }]}>
            <Text onPress={selectAll} style={styles.popupEntry}>Select All</Text>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1
  },
  container: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    marginTop: 10,
    marginLeft: 15
  },
  dream: {
    backgroundColor: '#ededed',
    width: '45%',
    marginBottom: 10,
    marginTop: 10,
    marginLeft: 5,
    marginRight: 5,
    padding: 10,
    paddingBottom: 5,
    paddingTop: 5,
    borderWidth: 1.5,
    borderColor: '#aaaaaa',
    borderRadius: 5
  },
  selectedDream: {
    borderColor: 'blue',
    backgroundColor: '#eaeaea'
  },
  dreamdate: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: 'black',
    top: -30,
    height: 20,
    borderRadius: 5,
    padding: 3
  },
  dreamdatetext: {
    fontSize: 11
  },
  dreamdate: {
    position: 'absolute',
    top: -20,
    right: 0,
    height: 20,
    borderRadius: 5,
    padding: 3
  },
  dreamcircle: {
    position: 'absolute',
    width: 30,
    height: 30,
    top: 3,
    right: -5,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#888888'
  },
  dreamcircletext: {
    fontSize: 15,
    fontWeight: '400'
  },
  title: {
    fontWeight: 'bold',
    height: 38,
    marginRight: 32,
    textAlignVertical: 'center',
    marginBottom: 3
  },
  tagscontainer: {
    flexDirection: 'row',
    height: 35,
    marginTop: 2
  },
  tag: {
    backgroundColor: '#f0f0f0',
    padding: 8,
    borderRadius: 4,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  scrollcontent: {
    flexGrow: 1,
  },
  middlecenter: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center'
  },
  circle: {
    position: 'absolute',
    backgroundColor: '#5C90F8',
    width: 60,
    height: 60,
    bottom: 30,
    right: 30,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center'
  },
  filterEnabled: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    padding: 8,
    paddingLeft: 12,
    paddingRight: 12,
    borderRadius: 15,
    marginRight: 10,
    marginBottom: 10,
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterEnabledText: {
    fontWeight: 'bold',
  },
  filterEnabledIcon: {
    paddingRight: 6
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
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popupMenu: {
    position: 'absolute',
    top: 10,
    backgroundColor: 'white',
    padding: 13,
    borderRadius: 5,
    elevation: 5,
  },
  popupEntry: {
    fontSize: 14,
    color: 'black',
    paddingTop: 5,
    paddingBottom: 5
  },
  monthlydate: {
    width: '100%',
    marginBottom: 12,
    marginTop: 5,
    padding: 7,
    backgroundColor: '#eaeaea',
    borderTopLeftRadius: 6,
    borderBottomLeftRadius: 6
  },
  monthlydatetext: {
    fontWeight: 'bold',
    fontSize: 16
  }
});

export default HomeScreen;