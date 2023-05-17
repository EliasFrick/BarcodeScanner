import * as React from 'react';
import {View, Text, Image} from "react-native";

export default function AresApp() {
    return (
        <>
            <View>
                <Image source={require('../../basis/resources/images/Ares.png')}/>
                <Text>Ares</Text>
            </View>
        </>
    )
}
