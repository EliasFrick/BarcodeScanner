import * as React from 'react';
import {View, Text, Image} from "react-native";

export default function InproApp() {
    return (
        <>
            <View>
                <Image source={require('../../basis/resources/images/Inpro.png')}/>
                <Text>Inpro</Text>
            </View>
        </>
    )
}
