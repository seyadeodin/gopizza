import React, {useState} from 'react';
import { Button } from 'react-native';

import { Input } from '../../components/Input'

import { Container } from '../SignIn/styles'

export function CheckCep() {
  const [cep, setCep] = useState('');
  console.log({cep})
  
  async function getData(){
    try{
      console.log({cep})
      const response = await fetch(`https://cep.awesomeapi.com.br/json/${cep}`, {
        method: 'GET',
      })
      console.log(await response.json())
    } catch(e) {
      console.log(e)
    }
  }

  return (
   <Container>
     <Input onChangeText={setCep}/>
     <Button title="checar cep" onPress={getData} />
   </Container> 
  );
}