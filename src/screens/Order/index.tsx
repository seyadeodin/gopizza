import React, { useState } from 'react';
import { Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { PIZZA_TYPES } from '@utils/pizzaTypes';

import { Input } from '@components/Input';
import { Button } from '@components/Button';
import { ButtonBack } from '@components/ButtonBack'
import { RadioButton } from '@components/RadioButton'

import { 
  Container, 
  Header, 
  Photo, 
  Sizes,
  Form,
  Title,
  Label,
  FormRow,
  InputGroup,
  Price,
  ContentScroll
} from './styles';

export function Order() {
  const navigation = useNavigation()

  const [ size, setSize ] = useState('');

  function handleGoBack(){
    navigation.goBack()
  }

  return(
    <Container behavior={Platform.OS === 'ios' ?'padding' : undefined}>
      <ContentScroll>
        <Header>
          <ButtonBack
            onPress={handleGoBack}
            style={{ marginBottom: 108}}
          />

        </Header>
        
        <Photo source={{ uri: 'http://github.com/seyadeodin.png' }}/>

        <Form>
          <Title>Nome da Pizza</Title>

          <Label>Selecione um tamanho:</Label>
          <Sizes>
            {PIZZA_TYPES.map(item => 
              <RadioButton 
                key={item.id}
                title={item.name} 
                onPress={() => setSize(item.id)}
                selected={size == item.id}
              />
            )}
          </Sizes>

          <FormRow>
            <InputGroup>
              <Label>Número da mesa</Label>
              <Input keyboardType="numeric"/>
            </InputGroup>

            <InputGroup>
              <Label>Quantidade</Label>
              <Input keyboardType="numeric"/>
            </InputGroup>
          </FormRow>

          <Price>Valor de R$: </Price>

          <Button
            title="Confirmar Pedido"
          />
        </Form>
      </ContentScroll>
    </Container>
  )
}