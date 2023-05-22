import {createDrawerNavigator} from "@react-navigation/drawer";
import {NavigationContainer} from "@react-navigation/native";
import Home from "./screens/Home";
import BarcodeScanner from "../services/BarcodeScanner"
import InproApp from "../../inpro/components/Inpro-App";
import FimApp from "../../fim/components/FimApp";
import AresApp from "../../ares/components/AresApp";
import {Image, StyleSheet} from "react-native";
import {useState} from "react";
import * as Data from '../resources/modules.json'

const Drawer = createDrawerNavigator();

function ShellApp() {

    function SideBarMenu() {
        return (
            <Drawer.Screen name={"FimApp"} component={FimApp} options={{
                title: 'FimApp',
                drawerIcon: ({focused, size}) => (
                    <Image source={require('../resources/images/Fim.png')}
                           style={[focused ? styles.drawerActive : styles.drawerInActive, {
                               height: 30,
                               width: 50
                           }]}
                    />)
            }}/>
        )
    }

    return (
        <NavigationContainer>
            <Drawer.Navigator initialRouteName={"Home"}>
                <Drawer.Screen name={"Home"} component={Home}
                               options={{
                                   title: 'StockBookingScreen Screen',
                                   drawerIcon: ({focused, size}) => (
                                       <Image source={require('../resources/images/mps.png')}
                                              style={[focused ? styles.drawerActive : styles.drawerInActive, {
                                                  height: 30,
                                                  width: 50
                                              }]}
                                       />)
                               }}/>
                <Drawer.Screen name={"Ares"} component={AresApp} options={{
                    title: 'Ares',
                    drawerIcon: ({focused, size}) => (
                        <Image source={require('../resources/images/Ares.png')}
                               style={[focused ? styles.drawerActive : styles.drawerInActive, {
                                   height: 30,
                                   width: 50
                               }]}
                        />)
                }}/>
                <Drawer.Screen name={"FimApp"} component={FimApp} options={{
                    title: 'FimApp',
                    drawerIcon: ({focused, size}) => (
                        <Image source={require('../resources/images/Fim.png')}
                               style={[focused ? styles.drawerActive : styles.drawerInActive, {
                                   height: 30,
                                   width: 50
                               }]}
                        />)
                }}/>
                <Drawer.Screen name={"InproApp"} component={InproApp} options={{
                    title: 'InproApp',
                    drawerIcon: ({focused, size}) => (
                        <Image source={require('../resources/images/Inpro.png')}
                               style={[focused ? styles.drawerActive : styles.drawerInActive, {
                                   height: 40,
                                   width: 50
                               }]}
                        />)
                }}/>
                <Drawer.Screen name={"Barcode Scanner"} component={BarcodeScanner} options={{
                    title: 'Barcode Scanner',
                    drawerIcon: ({focused, size}) => (
                        <Image source={require('../resources/images/BarcodeScanner.png')}
                               style={[focused ? styles.drawerActive : styles.drawerInActive, {
                                   height: 40,
                                   width: 50
                               }]}
                        />)
                }}/>
            </Drawer.Navigator>
        </NavigationContainer>
    )
}

export default ShellApp;

const styles = StyleSheet.create({
    drawerActive: {},
    drawerInActive: {},
})
