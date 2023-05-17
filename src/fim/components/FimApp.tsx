import * as React from 'react';
import {View, Text, Image} from "react-native";

export default function FimApp() {
    return (
        <>
            <View>
                <Image source={require('../../basis/resources/images/Fim.png')}/>
                <Text>Fim</Text>
            </View>
        </>
    )
}
