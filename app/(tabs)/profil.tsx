import { Pressable, StyleSheet } from 'react-native';

import EditScreenInfo from '@/components/EditScreenInfo';
import { Text, View } from '@/components/Themed';
import ButtonCard from '@/components/ui/ButtonCard';
import { getUserDetails } from '@/services/auth.services';
import { useEffect, useState } from 'react';
export default function TabTwoScreen() {
  const [userDetails, setUserDetails] = useState<any>();
  
  useEffect(()=> {
    setUserDetails(userDetails);
  });

  return (
    <View style={styles.container}>
      <ButtonCard 
        title='Show details'
        onPress={()=> {
          console.log(userDetails)
        }}
      />
        
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});
