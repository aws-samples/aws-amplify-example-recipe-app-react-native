/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import React, { Component } from 'react';
import {
  Button,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  View,
  Image,
  StyleSheet,
  TouchableOpacity
} from 'react-native';

import Amplify from 'aws-amplify'
import { Hub, Auth, API, graphqlOperation } from 'aws-amplify';
import { createRecipe } from './graphql/mutations'
import { listRecipes } from './graphql/queries'

import config from './aws-exports'
Amplify.configure(config)

import LoginScreen from "react-native-login-screen";

interface Recipe {
  id?: number
  title: string
  servings: string
  ingredients: string
  instructions: string
}

interface GlobalAppState {
  user?: string
  recipes: Recipe[]
  formState: Recipe
  showForm: boolean
  message?: string
  recipesChanged: boolean
}

const INITIAL_STATE: GlobalAppState = { user: undefined, recipes: [], showForm: false, message: undefined, recipesChanged: false,
  formState: { id: undefined, title: '', servings: '', ingredients: '', instructions: ''} };

class App extends Component<any, GlobalAppState> {

  private username : string = "";
  private password : string = "";

  constructor(props: any) {
    super(props);
    console.debug('App constructor');
    this.state = INITIAL_STATE;

    Hub.listen('auth', async (data) => {
      console.debug('*** new auth event : ', data.payload);
      if (data.payload.event === 'signIn') {
        await this.getAuthenticatedUser();
      }
    });
  }

  async componentDidMount() {
    console.debug("App componentDidMount");
    await this.getAuthenticatedUser();
    this.fetchRecipes();
  }

  componentDidUpdate(prevProps: any, prevState: GlobalAppState) {
    if (prevState.recipesChanged !== this.state.recipesChanged) {
      this.fetchRecipes();
    }
  }

  async getAuthenticatedUser() {
    try {
      console.debug("getting current auth user");
      const user = await Auth.currentAuthenticatedUser();
      this.setState({ user: user.username });
      console.debug(`user is ${user.username}`);
    } catch (error) {
      console.debug('Auth.currentAuthenticatedUser() threw an error, this means user is not authenticated');
      this.setState({ user: undefined });
    }
  }

  async signIn(username: string, password: string) {
    try {
      await Auth.signIn(username, password);
    } catch (error) {
      console.log('error signing in', error);
    }
  }

  setInput(key: string, value: string) {
    this.setState({ formState: { ...this.state.formState, [key]: value } });
  }

  createRecipe = async() => {
    try {
      const recipe = { ...this.state.formState }
      await API.graphql(graphqlOperation(createRecipe, {input: recipe}));
      this.setState({ recipes: [...this.state.recipes, recipe], formState: INITIAL_STATE.formState, showForm: false, recipesChanged: true, message: 'Recipe created successfully!' });
    } catch (err) {
      console.error('error creating recipe:', err)
      this.setState({ message: 'There was an error creating the recipe. Please try again.' });
    }
  }

  async fetchRecipes() {
    try {
      const recipeData : any = await API.graphql(graphqlOperation(listRecipes))
      const recipes = recipeData.data.listRecipes.items
      this.setState({ recipes: recipes});
    } catch (err) { console.log('error fetching recipes') }
  }

  render() {
    const state = this.state as GlobalAppState;
    console.debug(state)

    if (!state.user) {

      // user is unauthenticated, render login screen

      return (
        <LoginScreen
          source={ require("../img/login-background.png") }
          logoComponent={renderLogo()}
          backgroundColor={"#F2A22B"}
          usernameOnChangeText={(username: string) =>
            this.username = username
          }
          passwordOnChangeText={(password: string) =>
            this.password = password
          }
          onPressLogin={async () => {
            // this.setState({ spinnerVisible: true});
            await Auth.signIn(this.username, this.password);
            // this.setState({ spinnerVisible: false});
          }}
          onPressSignup={() => {
            console.log("onPressSignUp is pressed");
          }}
        />
      );
    } else {

      // user is authenticated, render app view

      return (
        <SafeAreaView>
          <StatusBar/>
          <ScrollView
            contentInsetAdjustmentBehavior="automatic" >
            <View>
              <View
                style={styles.headerLogo}
              >
                <Image
                  resizeMode="contain"
                  source={require("../img/recipesandstuff_logo_transparent.png")}
                  style={{ height: 100, width: 250 }}
                />
                <Button
                    title="Signout"
                    onPress={async () => {
                      console.debug("Sign out")
                      await Auth.signOut();
                      this.setState({ user: undefined });
                    }} color='#ffffff' ></Button>
              </View>
              { state.showForm &&
                <View style={styles.container}>
                  <Text style={styles.title}>New Recipe</Text>
                  <TextInput
                    onChangeText={val => this.setInput('title', val)}
                    style={[styles.input, styles.textInput]}
                    value={this.state.formState.title}
                    placeholder="Title"
                  />
                  <TextInput
                    onChangeText={val => this.setInput('servings', val)}
                    keyboardType = 'number-pad'
                    style={[styles.input, styles.textInput]}
                    value={this.state.formState.servings}
                    placeholder="Servings"
                  />
                  <TextInput
                    onChangeText={val => this.setInput('ingredients', val)}
                    style={[styles.multilineInput, styles.input]}
                    value={this.state.formState.ingredients}
                    multiline
                    numberOfLines={10}
                    placeholder="Ingredients"
                  />
                  <TextInput
                    onChangeText={val => this.setInput('instructions', val)}
                    style={[styles.multilineInput, styles.input]}
                    value={this.state.formState.instructions}
                    multiline={true}
                    numberOfLines={20}
                    placeholder="Instructions"
                  />
                  <TouchableOpacity style={styles.button} onPress={this.createRecipe} >
                    <Text style={styles.buttonText}>Save</Text>
                  </TouchableOpacity>
                  <Button title="Cancel" onPress={async () => {
                          this.setState({ showForm: false });
                        }} color='#333' />
                </View>
              }
              { !state.showForm &&
                <View style={styles.container}>
                  <TouchableOpacity style={[styles.button, { marginTop: -25 }]} onPress={async () => {
                    this.setState({ showForm: true, message: undefined });
                  }} >
                    <Text style={styles.buttonText}>New Recipe</Text>
                  </TouchableOpacity>
                  <Text style={styles.title}>Your Recipes</Text>
                  {this.state.message &&
                    <Text style={styles.message}>{this.state.message}</Text>
                  }
                  {this.state.recipes.length === 0 &&
                    <View>
                      <Text>You have no recipes yet.</Text>
                    </View>
                  }
                  {this.state.recipes.length >= 0 &&
                    this.state.recipes.map((recipe: Recipe, index) => (
                      <View key={recipe.id ? recipe.id : index} style={styles.recipe}>
                        <Text style={styles.recipeTitle}>{recipe.title}</Text>
                        <Text style={styles.recipeLabel}>Servings</Text>
                        <Text style={styles.recipeText}>{recipe.servings}</Text>
                        <Text style={styles.recipeLabel}>Ingredients</Text>
                        <Text style={styles.recipeText}>{recipe.ingredients}</Text>
                        <Text style={styles.recipeLabel}>Instructions</Text>
                        <Text style={styles.recipeText}>{recipe.instructions}</Text>
                      </View>
                    ))
                  }
                </View>
              }
            </View>
          </ScrollView>
        </SafeAreaView>
      );
    }
  };

}

export default App;

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    backgroundColor: "#F2A22B",
    padding: 10,
    marginBottom: 10
  },
  buttonText: { fontSize: 18, color: '#ffffff'},
  headerLogo: { bottom: 50, alignItems: "center", justifyContent: "center", backgroundColor: '#F2A22B', paddingTop: 45 },
  container: { flex: 1, justifyContent: 'center', paddingHorizontal: 20, color: '#333' },
  recipe: {  marginBottom: 15, padding: 10, borderColor: '#F2A22B', borderStyle: 'solid', borderWidth: 1 },
  textInput: { height: 50 },
  multilineInput: { height: 200, textAlignVertical: 'top', },
  input: { backgroundColor: '#efefef', marginBottom: 10, padding: 8 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, color: '#F2A22B' },
  recipeTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 15, color: '#F2A22B' },
  recipeLabel: { fontSize: 14, fontWeight: 'bold', marginBottom: 5, color: '#333' },
  recipeText: { color: '#333'},
  message: { fontWeight: 'bold', color: 'red', marginBottom: 15 }
});

const renderLogo = () => (
  <View
    style={{
      bottom: 50,
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <Image
      resizeMode="contain"
      source={require("../img/recipesandstuff_logo_transparent.png")}
      style={{ height: 250, width: 250 }}
    />
    <Text
      style={{
        bottom: 32,
        color: "#fdfdfd",
        // fontFamily: "Now-Bold",
        fontSize: 32,
        shadowRadius: 3,
        shadowOpacity: 0.7,
        shadowColor: "#757575",
        shadowOffset: {
          width: 0,
          height: 3,
        },
      }}
    >
      Welcome
    </Text>
  </View>
);