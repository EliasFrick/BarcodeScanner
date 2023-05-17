import * as React from 'react';
import {View, Text, Image} from "react-native";

export default function Home() {
    return (
        <>
            <View>
                <Image source={require('../../resources/images/mps.png')}/>
                <Text>Home Screen</Text>
            </View>
        </>
    )
}
