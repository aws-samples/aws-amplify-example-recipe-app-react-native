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
  View,
} from 'react-native';

import Amplify from 'aws-amplify'
import { Hub, Auth } from 'aws-amplify';

import config from './aws-exports'
Amplify.configure(config)

import LoginScreen from "react-native-login-screen";

interface GlobalAppState {
  user?: string}

const INITIAL_STATE: GlobalAppState = { user: undefined };

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

  render() {
    const state = this.state as GlobalAppState;
    console.debug(state)

    if (!state.user) {

      // user is unauthenticated, render login screen 

      return (
        <LoginScreen
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
          <StatusBar />
          <ScrollView
            contentInsetAdjustmentBehavior="automatic" >
            <View>
              <Text>Application core comes here</Text>
              <Text>Welcome {state.user}</Text>
              <Button
                title="signout"
                onPress={async () => {
                  console.debug("Sign out")
                  await Auth.signOut();
                  this.setState({ user: undefined });
                }}></Button>
            </View>
          </ScrollView>
        </SafeAreaView>
      );
    }
  };

}

export default App;