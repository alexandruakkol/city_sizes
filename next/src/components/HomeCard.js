import { useState } from 'react'
import { Autocomplete, Button, Modal } from '@mantine/core';
import { IconMapSearch } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';

import axios from 'axios';

const HomeCard = (props) => {

  const [autocomp_data, setAutocomp_data] = useState([]);
  const [inputs, setInputs] = useState({});
  const [opened, { open, close }] = useDisclosure(false);

  async function searchCity(string_query){

    if(autocomp_data.includes(string_query) || !string_query.length) return;

    const query_res = await axios.get(`https://citysizes.com/api/?q=${string_query}`)
      .catch(err => console.log(err));

    if(!query_res?.data) return;
    
    setAutocomp_data(query_res.data.map(city_obj => city_obj.name));
  }

  async function selectCity(input_id, autocomp_choice){
    setInputs({...inputs, [input_id]:autocomp_choice});
    const other_input_id = Number(!input_id);
    if(inputs[other_input_id] === autocomp_choice) return; //TODO: global showError
    props.setPolygon({input_id, value:autocomp_choice.value});
  }

  const optionsFilter = (search) => {
    return autocomp_data.filter((option) => {
      return option.toLowerCase().trim().includes(search.toLowerCase().trim());
    });
  };

  return (
    <div id="home-card">
        <Modal.Root size='30rem' opened={opened} onClose={close} overlayProps={{'background-color':'black'}} withCloseButton={true}>
        <Modal.Overlay />
        <Modal.Content>
          <Modal.Header style={{backgroundColor:'#09094de6'}}>
            <Modal.Title>
              <h2 id="title" style={{color:'antiquewhite'}}>City Sizes</h2>
            </Modal.Title>
            <Modal.CloseButton />
          </Modal.Header>
          <Modal.Body>
            <p>Welcome to <b>City Sizes</b>, your go-to web app for visualizing and comparing the sizes of cities around the world. Our platform provides an intuitive and interactive experience, allowing users to easy <b>city size comparison</b>.</p>
            <p>Whether you&apos;re curious about how your hometown stacks up against major metropolitan areas or you&apos;re planning a trip and want to understand the scale of your destination, our tool offers a comprehensive solution for all your city size comparison needs.</p>
            <p>The maps of towns and city boundaries are administrative, provided by OpenStreetMap. Not all cities are available.</p>
            <p>Contact us at support@citysizes.com</p></Modal.Body>
        </Modal.Content>
      </Modal.Root>

      <h1 id="title">City Sizes</h1>
      <h4 id="subtitle">city size comparison</h4>
  
      <Autocomplete
        onChange={searchCity}
        onItemSubmit={(str_query) => selectCity(0, str_query)}
        id="searchbar"
        icon={<IconMapSearch size="1.3rem" />}
        placeholder="ex. New York"
        data={autocomp_data}
        filter={optionsFilter}
      />
      <Autocomplete
        disabled={!inputs[0]}
        onChange={searchCity}
        onItemSubmit={(str_query) => selectCity(1, str_query)}
        id="searchbar"
        icon={<IconMapSearch size="1.3rem" />}
        placeholder="ex. Amsterdam"
        data={autocomp_data}
        filter={optionsFilter}
      />
      <Button       
        variant="gradient"
        gradient={{ from: 'blue', to: 'grape', deg: 90 }} 
        onClick={open}
      >
        About
      </Button>
    </div>

  )
}

export default HomeCard