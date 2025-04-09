import { StatusBar } from "expo-status-bar";
import { StyleSheet, View } from "react-native";
import { FlatList } from "react-native";
import { Button, ButtonGroup, CheckBox, Input, Text } from "@rneui/themed";
import * as Font from "expo-font";
// FontAwesome goes here
import { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

async function cacheFonts(fonts) {
  return fonts.map(async (font) => await Font.loadAsync(font));
}

const Stack = createNativeStackNavigator();
const sampleData = [
  {
    prompt: "What is the orange part of an egg called?",
    type: "multiple-choice",
    choices: ["Yolk", "White", "Shell", "Juice"],
    correct: 0,
  },
  {
    prompt: "How long is 1 year?",
    type: "multiple-answer",
    choices: ["12 months", "24 hours", "365 days", "30 days"],
    correct: [0, 2],
  },
  {
    prompt: "The mother of your mother is your Aunt.",
    type: "true-false",
    choices: ["True", "False"],
    correct: 1,
  },
  {
    prompt: "What is the closest planet to the Sun?",
    type: "multiple-choice",
    choices: ["Earth", "Jupiter", "Mars", "Mercury"],
    correct: 3,
  },
  {
    prompt: "Light is faster than sound.",
    type: "true-false",
    choices: ["True", "False"],
    correct: 0,
  },
];

function Question({ navigation, route }) {
  console.log(route.params);
  const { questionNumber, userChoices, data } = route.params;
  let { choices, prompt, type } = data[questionNumber];
  let initialSelection = 0;
  let [selectedIndex, setSelectedIndex] = useState(0);
  let [selectedIndexes, setSelectedIndexes] = useState([]);
  let nextQuestion = () => {
    let nextQuestion = questionNumber + 1;
    console.log(selectedIndex);
    if (type !== "multiple-answer") {
      userChoices.push(selectedIndex);
    } else {
      userChoices.push(selectedIndexes);
    }
    if (nextQuestion < sampleData.length) {
      console.log("Navigating to next question...");
      console.log({ questionNumber: nextQuestion, sampleData, userChoices });
      navigation.navigate("Question", {
        questionNumber: nextQuestion,
        sampleData,
        userChoices,
      });
    } else {
      navigation.navigate("SummaryScreen", {
        questionNumber: nextQuestion,
        sampleData,
        userChoices,
      });
    }
  };

  return (
    <View style={StyleSheet.container}>
      <Text>{prompt}</Text>
      {type !== "multiple-answer" ? (
        <ButtonGroup
          testID="choices"
          buttons={choices}
          vertical
          selectedIndex={selectedIndex}
          onPress={(value) => {
            console.log(value);
            console.log(selectedIndex);
            setSelectedIndex(value);
          }}
          containerStyle={{ marginBottom: 20, width: "70&" }}
        />
      ) : (
        <ButtonGroup
          testID="choices"
          buttons={choices}
          vertical
          selectMultiple
          selectedIndexes={selectedIndexes}
          onPress={(value) => {
            setSelectedIndexes(value);
          }}
          containerStyle={{ marginBottom: 20, width: "70&" }}
        />
      )}
      <Button
        testID="next-question"
        onPress={nextQuestion}
        title="Submit"
      ></Button>
    </View>
  );
}

function SummaryScreen({ route }) {
  let calculateCorrect = (userSelected, correct, type) => {
    let userCorrect = false;
    if (type == "multiple-answer") {
      userCorrect =
        userSelected.sort().toString() === correct.sort().toString();
    } else {
      userCorrect = userSelected == correct;
    }
    return userCorrect;
  };

  let calculateCorrectSet = (userSelected, correct, type) => {
    let userCorrect = false;
    if (type == "multiple-answer") {
      userCorrect =
        correct.every((item) => userSelected.includes(item)) &&
        userSelected.every((item) => correct.includes(item));
    } else {
      userCorrect = userSelected === correct;
    }
    return userCorrect;
  };
  let totalScore = 0;
  for (let i = 0; i < route.params.data.length; i++) {
    if (
      calculateCorrect(
        route.params.userChoices[i],
        route.params.data[i].correct,
        route.params.data[i].type
      )
    ) {
      totalScore++;
    }
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={route.params.data}
        renderItem={({ item, index }) => {
          let { choices, prompt, type, correct } = item;
          // The user's selection for this question

          let userSelected = route.params.userChoices[index];
          let userCorrect = calculateCorrect(userSelected, correct, type);

          return (
            <View key={index}>
              <Text>{prompt}</Text>
              {choices.map((value, choiceIndex) => {
                let incorrect = false;
                let userDidSelect = false;
                if (type == "multiple-answer") {
                  userDidSelect = userSelected.includes(choiceIndex);
                  incorrect = userDidSelect && !correct.includes(choiceIndex);
                } else {
                  userDidSelect = userSelected == choiceIndex;
                  incorrect = userDidSelect && userSelected !== correct;
                }
                return (
                  <CheckBox
                    containerStyle={{
                      backgroundColor: userDidSelect
                        ? incorrect == false
                          ? "lightgreen"
                          : "gray"
                        : undefined,
                    }}
                    checked={
                      type == "multiple-answer"
                        ? correct.includes(choiceIndex)
                        : correct == choiceIndex
                    }
                    textStyle={{
                      textDecorationLine: incorrect
                        ? "line-through"
                        : undefined,
                    }}
                    key={value}
                    title={value}
                  ></CheckBox>
                );
              })}
            </View>
          );
        }}
      ></FlatList>
      <Text> Score: {totalScore} </Text>
    </View>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Question">
        <Stack.Screen
          initialParams={{
            questionNumber: 0,
            data: sampleData,
            userChoices: [],
          }}
          name="Question"
          options={{ headerShown: false }}
        >
          {(props) => <Question {...props} />}
        </Stack.Screen>
        <Stack.Screen
          name="SummaryScreen"
          initialParams={{
            questionNumber: sampleData.length - 1,
            data: sampleData,
            userChoices: [0, [0, 2], 1, 3, 0],
          }}
          options={{ headerShown: false }}
          component={SummaryScreen}
        ></Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  image: {
    flex: 1,
    aspectRatio: 1,
    width: "50%",
    backgroundColor: "#0553",
  },
  horizontal: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 10,
  },
  container: {
    flex: 1,
    backgrondColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    alignItems: "center",
    backgroundColor: "#DDDDDD",
    padding: 10,
  },
});
