import * as React from 'react';
// import useHardwareBarcodes from 'xy';
import {View, Text, Image} from "react-native";

export default function StockBookingScreen() {

    // useHardwareBarcodes((barcodeData) => {
    //     console.log(barcodeData);
    // });

    return (
        <>
            <View>
                <Image source={require('../../resources/images/mps.png')}/>
                <Text>Home Screen</Text>
            </View>
        </>
    )
}
