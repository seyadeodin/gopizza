import React from 'react';
import { TouchableOpacity } from 'react-native';
import { useTheme } from 'styled-components/native'
import { MaterialIcons } from '@expo/vector-icons'

import happyEmoji from '@assets/happy.png'

import { Search } from '@components/Search'

import { 
  Container, 
  Header,
  Greeting,
  GreetingEmoji,
  GreetingText,
} from './styles';
import { Alert } from 'react-native';

export function Home(){
  const { COLORS } = useTheme();

  return (
    <Container>
      <Header>
        <Greeting>
          <GreetingEmoji source={happyEmoji} />
          <GreetingText>Olá, Jãodmin</GreetingText>
        </Greeting>
        
        <TouchableOpacity onPress={() => Alert.alert('Teste')}>
          <MaterialIcons name="logout" color={COLORS.TITLE} size={24} />
        </TouchableOpacity>


      </Header>
        <Search onSearch={() => {}} onClear={() => {}} />

    </Container>
  )
}