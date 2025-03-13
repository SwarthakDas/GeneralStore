import { StyleSheet, Text, View } from 'react-native'

const RootLayout = () => {
  return (
    <View style={styles.container}>
      <Text>General Store</Text>
    </View>
  )
}

export default RootLayout

const styles = StyleSheet.create({
  container:{
    display:"flex",
    flex:1,
    alignItems:"center",
    justifyContent:"center"
  }
})