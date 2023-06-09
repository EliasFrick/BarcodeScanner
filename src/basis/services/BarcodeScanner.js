/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import {registerRootComponent} from "expo";
import {Component, useState} from "react";
import * as Device from "expo-device";
import Constants from "expo-constants";
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    FlatList,
    TouchableHighlight,
} from "react-native";
import {CheckBox, Button} from "react-native-elements";
import {DeviceEventEmitter} from "react-native";
import * as React from "react";
import {sendIntent} from "expo-linking";


// Variablen für API Calls
const SOFT_SCAN_TRIGGER = "com.symbol.datawedge.api.SOFT_SCAN_TRIGGER";
const TOGGLE_SCANNING = "TOGGLE_SCANNING";
const profile_name = "ZebraExpoDemo";
const Create_Profile = "com.symbol.datawedge.api.CREATE_PROFILE";
const Set_Config = "com.symbol.datawedge.api.SET_CONFIG";
const Action = 'com.zebra.expodemo.ACTION';
const Result_Action = 'com.symbol.datawedge.api.RESULT_ACTION';
const Get_Version_Info = "com.symbol.datawedge.api.RESULT_GET_VERSION_INFO";
const Enumerate_Scanner = "com.symbol.datawedge.api.RESULT_ENUMERATE_SCANNERS";
const Result_Active_Profile = "com.symbol.datawedge.api.RESULT_GET_ACTIVE_PROFILE";
const Data_String = "com.symbol.datawedge.data_string";
const Label_String = "com.symbol.datawedge.label_type";
const API_Action = "com.symbol.datawedge.api.ACTION";
const Android_intent_category = 'android.intent.category.DEFAULT';
const Package_Name = "com.barcodescanner";
//de.mps.mobile
export default class App extends Component {
    constructor(Props) {
        super(Props);

        this.state = {
            DataWedgeIntents: undefined,
            ean8checked: true,
            ean13checked: true,
            code39checked: true,
            code128checked: true,
            lastApiVisible: false,
            lastApiText: "Messages from DataWedge will go here",
            checkBoxesDisabled: false,
            scanButtonVisible: true,
            dwVersionText:
                "Pre 6.3.  Please create and configure profile manually.  See the ReadMe for more details",
            dwVersionTextStyle: styles.itemTextAttention,
            activeProfileText: "Requires DataWedge 6.3+",
            enumeratedScannersText: "Requires DataWedge 6.3=+",
            scans: [],
        };
        this.scans = [
            // { decoder: "label", timeAtDecode: "time", data: "123" },
            // { decoder: "label", timeAtDecode: "time", data: "321" },
            // { decoder: "label", timeAtDecode: "time", data: "123" },
        ];
        this.state.sendCommandResult = "false";

        if (Constants.executionEnvironment === "bare") {
            this.state.DataWedgeIntents = require("../resources/scripts/DataWedge");
        }
    }

    componentDidMount() {
        this.setState(this.state);

        this.state.deviceEmitterSubscription = DeviceEventEmitter.addListener(
            "datawedge_broadcast_intent",
            intent => {
                this.broadcastReceiver(intent);
            }
        );

        this.registerBroadcastReceiver();

        this.checkProfile();

        this.determineVersion();
    }

    componentWillUnmount() {
        this.state.deviceEmitterSubscription.remove();
    }

    _onPressScanButton() {
        this.sendCommand(
            SOFT_SCAN_TRIGGER,
            TOGGLE_SCANNING
        );
    }

    createProfile() {

        if (this.state.activeProfileText !== profile_name) {
            console.log("Profil erstellst")

            this.sendCommand(
                Create_Profile,
                profile_name
            );

            //  Configure the created profile (associated app and keyboard plugin)
            var profileConfig = {
                PROFILE_NAME: profile_name,
                PROFILE_ENABLED: "true",
                CONFIG_MODE: "UPDATE",
                PLUGIN_CONFIG: {
                    PLUGIN_NAME: "BARCODE",
                    RESET_CONFIG: "true",
                    PARAM_LIST: {},
                },
                APP_LIST: [
                    {
                        PACKAGE_NAME: Package_Name,
                        ACTIVITY_LIST: ["*"],
                    },
                ],
            };
            this.sendCommand(Set_Config, profileConfig);

            //  Configure the created profile (intent plugin)
            var profileConfig2 = {
                PROFILE_NAME: profile_name,
                PROFILE_ENABLED: "true",
                CONFIG_MODE: "UPDATE",
                PLUGIN_CONFIG: {
                    PLUGIN_NAME: "INTENT",
                    RESET_CONFIG: "true",
                    PARAM_LIST: {
                        intent_output_enabled: "true",
                        intent_action: Action,
                        intent_delivery: "2",
                    },
                },
            };
            this.sendCommand(Set_Config, profileConfig2);
        } else {
            console.log("Profil existiert bereits")
        }
    }

    determineVersion() {
        this.sendCommand("com.symbol.datawedge.api.GET_VERSION_INFO", "");
    }

    checkProfile() {
        this.sendCommand("com.symbol.datawedge.api.GET_ACTIVE_PROFILE", "");
    }

    setDecoders() {
        //  Set the new configuration
        var profileConfig = {
            PROFILE_NAME: profile_name,
            PROFILE_ENABLED: "true",
            CONFIG_MODE: "UPDATE",
            PLUGIN_CONFIG: {
                PLUGIN_NAME: "BARCODE",
                PARAM_LIST: {
                    "current-device-id": this.selectedScannerId,
                    scanner_selection: "auto",
                    decoder_ean8: "" + this.state.ean8checked,
                    decoder_ean13: "" + this.state.ean13checked,
                    decoder_code128: "" + this.state.code128checked,
                    decoder_code39: "" + this.state.code39checked,
                },
            },
        };

        //this.sendCommand("com.symbol.datawedge.api.SET_CONFIG", profileConfig);
    }

    sendCommand(extraName, extraValue) {
        if (Constants.executionEnvironment === "bare") {
            // console.log(
            //   "Sending Command: " + extraName + ", " + JSON.stringify(extraValue)
            // );
            var broadcastExtras = {};
            broadcastExtras[extraName] = extraValue;
            broadcastExtras["SEND_RESULT"] = this.state.sendCommandResult;

            this.state.DataWedgeIntents.sendBroadcastWithExtras({
                action: API_Action,
                extras: broadcastExtras,
            });
        }
    }

    registerBroadcastReceiver() {

        if (Constants.executionEnvironment === "bare") {
            this.state.DataWedgeIntents.registerBroadcastReceiver({
                filterActions: [
                    Action,
                    Result_Action
                ],
                filterCategories: [
                    Android_intent_category
                ]
            });
        } else {
            console.log("no hardwarescanner active");
        }
    }

    broadcastReceiver(intent) {
        //  Broadcast received
        console.log("Received Intent: " + JSON.stringify(intent));
        if (intent.hasOwnProperty("RESULT_INFO")) {
            var commandResult =
                intent.RESULT +
                " (" +
                intent.COMMAND.substring(
                    intent.COMMAND.lastIndexOf(".") + 1,
                    intent.COMMAND.length
                ) +
                ")";
            // + JSON.stringify(intent.RESULT_INFO);
            this.commandReceived(commandResult.toLowerCase());
        }

        if (intent.hasOwnProperty(Get_Version_Info)) {

            //  The version has been returned (DW 6.3 or higher).  Includes the DW version along with other subsystem versions e.g MX
            var versionInfo =
                intent[Get_Version_Info];
            // console.log("Version Info: " + JSON.stringify(versionInfo));
            var datawedgeVersion = versionInfo["DATAWEDGE"];
            // console.log("Datawedge version: " + datawedgeVersion);

            //  Fire events sequentially so the application can gracefully degrade the functionality available on earlier DW versions
            if (datawedgeVersion >= "6.3") this.datawedge63();
            if (datawedgeVersion >= "6.4") this.datawedge64();
            if (datawedgeVersion >= "6.5") this.datawedge65();

            this.setState(this.state);
        } else if (intent.hasOwnProperty(Enumerate_Scanner)) {
            //  Return from our request to enumerate the available scanners
            var enumeratedScannersObj = intent[Enumerate_Scanner];
            this.enumerateScanners(enumeratedScannersObj);
        } else if (intent.hasOwnProperty(Result_Active_Profile)) {
            //  Return from our request to obtain the active profile
            var activeProfileObj = intent[Result_Active_Profile];
            this.activeProfile(activeProfileObj);
        } else if (!intent.hasOwnProperty("RESULT_INFO")) {
            //  A barcode has been scanned
            console.log("barcode has been scanned");
            this.barcodeScanned(intent, new Date().toLocaleString());
        }
    }


    datawedge63() {
        // console.log("Datawedge 6.3 APIs are available");
        //  Create a profile for our application
        // this.sendCommand(
        //   "com.symbol.datawedge.api.CREATE_PROFILE",
        //   "ZebraExpoDemo"
        // );

        this.state.dwVersionText =
            "6.3.  Please configure profile manually.  See ReadMe for more details.";

        //  Although we created the profile we can only configure it with DW 6.4.
        // this.sendCommand("com.symbol.datawedge.api.GET_ACTIVE_PROFILE", "");

        //  Enumerate the available scanners on the device
        // this.sendCommand("com.symbol.datawedge.api.ENUMERATE_SCANNERS", "");

        //  Functionality of the scan button is available
        this.state.scanButtonVisible = true;
    }

    datawedge64() {
        // console.log("Datawedge 6.4 APIs are available");

        //  Documentation states the ability to set a profile config is only available from DW 6.4.
        //  For our purposes, this includes setting the decoders and configuring the associated app / output params of the profile.
        this.state.dwVersionText = "6.4.";
        this.state.dwVersionTextStyle = styles.itemText;
        //document.getElementById('info_datawedgeVersion').classList.remove("attention");

        //  Decoders are now available
        this.state.checkBoxesDisabled = false;

        //  Give some time for the profile to settle then query its value
        // setTimeout(() => {
        //   this.sendCommand("com.symbol.datawedge.api.GET_ACTIVE_PROFILE", "");
        // }, 1000);
    }

    datawedge65() {
        // console.log("Datawedge 6.5 APIs are available");

        this.state.dwVersionText = "6.5 or higher.";

        //  Instruct the API to send
        this.state.sendCommandResult = "true";
        this.state.lastApiVisible = true;
    }

    commandReceived(commandText) {
        this.state.lastApiText = commandText;
        this.setState(this.state);
    }

    enumerateScanners(enumeratedScanners) {
        var humanReadableScannerList = "";
        for (var i = 0; i < enumeratedScanners.length; i++) {
            console.log(
                "Scanner found: name= " +
                enumeratedScanners[i].SCANNER_NAME +
                ", id=" +
                enumeratedScanners[i].SCANNER_INDEX +
                ", connected=" +
                enumeratedScanners[i].SCANNER_CONNECTION_STATE
            );
            humanReadableScannerList += enumeratedScanners[i].SCANNER_NAME;
            if (i < enumeratedScanners.length - 1) humanReadableScannerList += ", ";
        }
        this.state.enumeratedScannersText = humanReadableScannerList;
    }

    activeProfile(theActiveProfile) {
        this.state.activeProfileText = theActiveProfile;
        this.setState(this.state);

        this.createProfile();
    }

    barcodeScanned(scanData, timeOfScan) {
        var scannedData = scanData[Data_String];
        var scannedType = scanData[Label_String];
        console.log("Scan: " + scannedData);
        this.state.scans.unshift({
            data: scannedData,
            decoder: scannedType,
            timeAtDecode: timeOfScan,
        });
        console.log(this.state.scans);
        this.setState(this.state);
    }

    render() {
        return (
            /*<ScrollView>*/
            <View style={styles.container}>
                <Text style={styles.h1}>Zebra Expo DataWedge Demo</Text>
                <Text style={styles.expo}>
                    Manufacturer (via Expo API): {Device.manufacturer}
                </Text>
                <Text style={styles.h3}>Information / Configuration</Text>
                <Text style={styles.itemHeading}>DataWedge version:</Text>
                <Text style={this.state.dwVersionTextStyle}>
                    {this.state.dwVersionText}
                </Text>
                <Text style={styles.itemHeading}>Active Profile</Text>
                <Text style={styles.itemText}>{this.state.activeProfileText}</Text>
                {this.state.lastApiVisible && (
                    <Text style={styles.itemHeading}>Last API message</Text>
                )}
                {this.state.lastApiVisible && (
                    <Text style={styles.itemText}>{this.state.lastApiText}</Text>
                )}
                <Text style={styles.itemHeading}>Available scanners:</Text>
                <Text style={styles.itemText}>{this.state.enumeratedScannersText}</Text>
                <View style={{flexDirection: "row", flex: 1}}>
                    <CheckBox
                        title="EAN 8"
                        checked={this.state.ean8checked}
                        disabled={this.state.checkBoxesDisabled}
                        onPress={() => {
                            this.state.ean8checked = !this.state.ean8checked;
                            this.setDecoders();
                            this.setState(this.state);
                        }}
                    />
                    <CheckBox
                        title="EAN 13"
                        checked={this.state.ean13checked}
                        disabled={this.state.checkBoxesDisabled}
                        onPress={() => {
                            this.state.ean13checked = !this.state.ean13checked;
                            this.setDecoders();
                            this.setState(this.state);
                        }}
                    />
                </View>
                <View style={{flexDirection: "row", flex: 1}}>
                    <CheckBox
                        title="Code 39"
                        checked={this.state.code39checked}
                        disabled={this.state.checkBoxesDisabled}
                        onPress={() => {
                            this.state.code39checked = !this.state.code39checked;
                            this.setDecoders();
                            this.setState(this.state);
                        }}
                    />
                    <CheckBox
                        title="Code 128"
                        checked={this.state.code128checked}
                        disabled={this.state.checkBoxesDisabled}
                        onPress={() => {
                            this.state.code128checked = !this.state.code128checked;
                            this.setDecoders();
                            this.setState(this.state);
                        }}
                    />
                </View>
                {this.state.scanButtonVisible && (
                    <Button
                        title="Scan"
                        color="#333333"
                        buttonStyle={{
                            backgroundColor: "#ffd200",
                            height: 45,
                            borderColor: "transparent",
                            borderWidth: 0,
                            borderRadius: 5,
                        }}
                        onPress={() => {
                            this._onPressScanButton();
                        }}
                    />
                )}

                <Text style={styles.itemHeading}>
                    Scanned barcodes will be displayed here:
                </Text>

                <FlatList
                    data={this.state.scans}
                    extraData={this.state}
                    keyExtractor={(item) => item.timeAtDecode}
                    renderItem={({item, separators}) => (
                        <TouchableHighlight
                            onShowUnderlay={separators.highlight}
                            onHideUnderlay={separators.unhighlight}
                        >
                            <View
                                style={{
                                    backgroundColor: "#0077A0",
                                    margin: 10,
                                    borderRadius: 5,
                                }}
                            >
                                <View style={{flexDirection: "row", flex: 1}}>
                                    <Text style={styles.scanDataHead}>{item.decoder}</Text>
                                    <View style={{flex: 1}}>
                                        <Text style={styles.scanDataHeadRight}>
                                            {item.timeAtDecode}
                                        </Text>
                                    </View>
                                </View>
                                <Text style={styles.scanData}>{item.data}</Text>
                            </View>
                        </TouchableHighlight>
                    )}
                />
            </View>
            /*</ScrollView>*/
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        //    justifyContent: 'center',
        //    alignItems: 'center',
        backgroundColor: "#F5FCFF",
    },
    instructions: {
        textAlign: "center",
        color: "#333333",
        marginBottom: 5,
    },
    h1: {
        fontSize: 20,
        textAlign: "center",
        margin: 5,
        fontWeight: "bold",
    },
    h3: {
        fontSize: 14,
        textAlign: "center",
        margin: 10,
        fontWeight: "bold",
    },
    itemHeading: {
        fontSize: 12,
        textAlign: "left",
        left: 10,
        fontWeight: "bold",
    },
    itemText: {
        fontSize: 12,
        textAlign: "left",
        margin: 10,
    },
    itemTextAttention: {
        fontSize: 12,
        textAlign: "left",
        margin: 10,
        backgroundColor: "#ffd200",
    },
    expo: {
        fontSize: 12,
        textAlign: "left",
        margin: 10,
        padding: 10,
        fontWeight: "bold",
        borderRadius: 5,
        backgroundColor: "#ffd200",
    },
    scanDataHead: {
        fontSize: 10,
        margin: 2,
        fontWeight: "bold",
        color: "white",
    },
    scanDataHeadRight: {
        fontSize: 10,
        margin: 2,
        textAlign: "right",
        fontWeight: "bold",
        color: "white",
    },
    scanData: {
        fontSize: 16,
        fontWeight: "bold",
        textAlign: "center",
        margin: 2,
        color: "white",
    },
});
