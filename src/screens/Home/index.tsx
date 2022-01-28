import React, { useEffect, useState, useCallback } from 'react';
import { Alert, TouchableOpacity, FlatList } from 'react-native';
import { useTheme } from 'styled-components/native'
import { MaterialIcons } from '@expo/vector-icons'
import firestore from '@react-native-firebase/firestore'
import { useNavigation, useFocusEffect } from '@react-navigation/native'

import happyEmoji from '@assets/happy.png'

import { Search } from '@components/Search'
import { ProductCard, ProductProps } from '@components/ProductCard'

import { 
  Container, 
  Header,
  Greeting,
  GreetingEmoji,
  GreetingText,
  MenuHeader,
  MenuItemsNumber,
  Title,
  NewProductButton,
} from './styles';

export function Home(){
  const [ pizzas, setPizzas ] = useState<ProductProps[]>([])
  const [ search, setSearch ] = useState('')
  const { COLORS } = useTheme();
  const navigation = useNavigation();

  function fetchPizzas(value: string) {
    const formattedValue = value.toLowerCase().trim();

    firestore()
    .collection('pizzas')
    .orderBy('name_insensitive')
    .startAt(formattedValue)
    .endAt(`${formattedValue}\uf8ff`)
    //The \uf8ff character used in the query above is a very high code point in the Unicode range. Because it is after most regular characters in Unicode, the query matches all values that start with a term.
    .get()
    .then(response => {
      console.log(response)
      const data = response.docs.map(doc => {
        return {
          id: doc.id,
          ...doc.data(),
        }
      }) as ProductProps[];

      setPizzas(data)
    })
    .catch(() => Alert.alert('Consulta', 'Não foi possível realizar a consulta'));
  }

  function handleSearch(){
    fetchPizzas(search)
  }

  function handleSearchClear(){
    setSearch('')
    fetchPizzas('')
  }

  function handleOpenCard(id: string){
    navigation.navigate('product', { id });
  }

  function handleAddCard(){
    navigation.navigate('product', {});
  }


  useFocusEffect(
    useCallback(() => {
    fetchPizzas('')
  }, []));

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

      <Search 
        value={search}
        onChangeText={setSearch}
        onSearch={handleSearch}
        onClear={handleSearchClear} 
      />

      <MenuHeader>
        <Title>Cardápio</Title>
        <MenuItemsNumber>{pizzas.length} pizzas</MenuItemsNumber>
      </MenuHeader>

      <FlatList
        data={pizzas}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <ProductCard 
            data={item} 
            onPress={() => handleOpenCard(item.id)}
          />
          )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle = {{
          paddingTop: 20,
          paddingBottom: 125,
          marginHorizontal: 24,
        }}
      />

      <NewProductButton 
        title="Cadastrar pizza"
        type="secondary"
        onPress={handleAddCard}
      />
        
    </Container>
  )
}