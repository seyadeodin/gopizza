import React, { useState, useEffect } from 'react';
import { Alert, Platform, TouchableOpacity, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import firestore from '@react-native-firebase/firestore';
import  storage from '@react-native-firebase/storage';
import { useNavigation, useRoute } from '@react-navigation/native';

import { ProductNavigationProps } from '@src/@types/navigation';

import { ButtonBack } from '@components/ButtonBack';
import { Photo } from '@components/Photo';
import { InputPrice } from '@components/InputPrice';
import { Input } from '@components/Input';
import { Button } from '@components/Button';
import { ProductProps } from '@components/ProductCard';

import { 
  Container, 
  Header, 
  Title, 
  DeleteLabel,
  Upload,
  PickImageButton,
  Form,
  Label,
  InputGroup,
  InputGroupHeader,
  MaxCharacters,
} from './styles';
import { ScrollView } from 'react-native-gesture-handler';

type PizzaResponse = ProductProps & {
  photo_path: string;
  price_sizes: {
    p: string;
    m: string;
    g: string;
  }
}

export function Product() {
  const [ modifyImage, setModifyImage] = useState(false);
  const [ photoPath, setPhotoPath ] = useState('');
  const [ image, setImage ] = useState('');
  const [ name, setName ] = useState('');
  const [ description, setDescription ] = useState('');
  const [ priceSizeP,  setPriceSizeP ] = useState('');
  const [ priceSizeM,  setPriceSizeM ] = useState('');
  const [ priceSizeG,  setPriceSizeG ] = useState('');
  const [ isLoading, setIsLoading ] = useState(false);

  const navigation = useNavigation();
  const route = useRoute();
  const { id } = route?.params as ProductNavigationProps;

  async function handlePickerImage(){
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if(status === 'granted') {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        aspect: [4, 4]
      });

      if(!result.cancelled){
        setImage(result.uri)
        setModifyImage(true)
      }
    }
  }

  async function handleAdd(){
    if(!name.trim()){
      return Alert.alert('Cadastro', 'Informe o nome da pizza');
    }

    if(!description.trim()){
      return Alert.alert('Cadastro', 'Informe a descrição da pizza');
    }

    if(!priceSizeP || !priceSizeM || !priceSizeG){
      return Alert.alert('Cadastro', 'Informe o preço de todos os tamanhos da pizza');
    }

    if (!image) {
      return Alert.alert('Cadastro', 'Selecione a imagem da pizza');
    }

    setIsLoading(true);

    const fileName = new Date().getTime();
    const reference = storage().ref(`/pizzas/${fileName}.png`)

    await reference.putFile(image);
    const photo_url = await reference.getDownloadURL();

    firestore()
    .collection('pizzas')
    .add({
      name,
      name_insensitive: name.toLowerCase().trim(),
      description,
      price_sizes: {
        p: Number(priceSizeP),
        m: Number(priceSizeM),
        g: Number(priceSizeG),
      },
      photo_url,
      photo_path: reference.fullPath
    })
    .then(() => navigation.navigate('home'))
    .catch(() => Alert.alert('Cadastro', 'Não foi possível cadastrar a pizza'))
    .finally(() => setIsLoading(false))
  }

  async function handleEditCard(){
    let photo_url:any = image;
    let reference:any = {
      fullPath: photoPath,
    }

    if(modifyImage){
      storage()
      .ref(photoPath)
      .delete()
      .catch(error => console.error(error))

      const fileName = new Date().getTime();
      reference = storage().ref(`/pizzas/${fileName}.png`)
      await reference.putFile(image);
      photo_url = await reference.getDownloadURL();
    }
    
    console.log(reference)
    firestore()
    .collection('pizzas')
    .doc(id)
    .update({
      name,
      name_insensitive: name.toLowerCase().trim(),
      description,
      price_sizes: {
        p: Number(priceSizeP),
        m: Number(priceSizeM),
        g: Number(priceSizeG),
      },
      photo_url,
      photo_path: reference.fullPath
    })
    .then(response => Alert.alert('Edição', 'Edição concluída'))
    .catch(e => console.log(e))
  }

  function handleDeleteCard(){
    function deletePizza() {
        storage()
        .ref(photoPath)
        .delete()
        .then(() => {
          firestore()
          .collection('pizzas')
          .doc(id)
          .delete()
          .then(() => navigation.navigate('home'))
          .catch(() => Alert.alert('Erro ao excluír produto'))

        })
        .catch(e => Alert.alert('Erro ao excluir imagem'))
    }

    Alert.alert(
      'Exclusão de produto',
      'Tem certeza que deseja excluir este ítem',
      [
        {
          text: 'Sim',
          onPress: deletePizza
        },
        {
          text: 'Cancelar',
          style: 'cancel'
        }
      ]
    )
  }

  function handleGoBack(){
    navigation.goBack();
  }

  useEffect(() => {
    if (id){
      firestore()
      .collection('pizzas')
      .doc(id)
      .get()
      .then(response => {
        const product = response.data() as PizzaResponse;

        setName(product.name);
        setImage(product.photo_url);
        setDescription(product.description);
        setPriceSizeP(String(product.price_sizes.p));
        setPriceSizeM(String(product.price_sizes.m));
        setPriceSizeG(String(product.price_sizes.g));
        setPhotoPath(product.photo_path)
      })
    }
  }, [id])

  return(
    <Container behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView showsHorizontalScrollIndicator={false} >

      <Header>
        <ButtonBack onPress={handleGoBack}/>
        <Title>Cadastrar</Title>
        { id ?
          <TouchableOpacity onPress={handleDeleteCard}>
            <DeleteLabel>Deletar</DeleteLabel>
          </TouchableOpacity>
          : <View style={{width: 20}}/>
        }
      </Header>

      <Upload>
        <Photo uri={image} />

        <PickImageButton 
          title="Carregar" 
          type="secondary"
          onPress={handlePickerImage}
        />
      </Upload>

      <Form>
        <InputGroup>
          <Label>Nome</Label>
          <Input
            onChangeText={setName}
            value={name}
          />
        </InputGroup>

        <InputGroup>
          <InputGroupHeader>
            <Label>Descrição</Label>
            <MaxCharacters>0 de 60 caracteres</MaxCharacters>
          </InputGroupHeader>
          <Input
            multiline
            maxLength={60}
            style={{ height: 80}}
            onChangeText={setDescription}
            value={description}
          />
        </InputGroup>


        <InputGroup>
          <Label>Tamanhos e preços</Label>

          <InputPrice 
            size="P" 
            onChangeText={setPriceSizeP}
            value={priceSizeP}  
          />
          <InputPrice 
            size="M" 
            onChangeText={setPriceSizeM}
            value={priceSizeM}  
          />
          <InputPrice 
            size="G" 
            onChangeText={setPriceSizeG}
            value={priceSizeG}  
          />
        </InputGroup>

        { id ? 
          <Button
            title="Editar pizza"
            isLoading={isLoading}
            onPress={handleEditCard}
          />
          : <Button
            title="Cadastrar pizza"
            isLoading={isLoading}
            onPress={handleAdd}
          />
        }
      </Form>
     
      </ScrollView>
    </Container>
  )
}