import { useState } from 'react'
import { Autocomplete } from '@mantine/core';
import { IconAt } from '@tabler/icons-react';
import axios from 'axios';

const HomeCard = (props) => {

  const [autocomp_data, setAutocomp_data] = useState([]);
  const [inputs, setInputs] = useState({});

  async function searchCity(string_query){

    if(autocomp_data.includes(string_query) || !string_query.length) return;

    const query_res = await axios.get(`http://localhost:8001/api/cities?q=${string_query}`)
      .catch(err => console.log(err));

    if(!query_res?.data) return;

    setAutocomp_data(query_res.data.map(city_obj => city_obj.name));
  }

  async function selectCity(input_id, autocomp_choice){
    setInputs({...inputs, [input_id]:autocomp_choice});
    const other_input_id = Number(!input_id);
    if(inputs[other_input_id] === autocomp_choice) return; //TODO: global showError
    props.getPolygon(input_id, autocomp_choice.value);
  }

  return (
    <div id="home-card">
      <h3 id="title">City Sizes</h3>

      <Autocomplete
        onChange={searchCity}
        onItemSubmit={(str_query) => selectCity(0, str_query)}
        id="searchbar"
        icon={<IconAt size="0.8rem" />}
        placeholder="ex. New York"
        data={autocomp_data}
      />
      <Autocomplete
        disabled={!inputs[0]}
        onChange={searchCity}
        onItemSubmit={(str_query) => selectCity(1, str_query)}
        id="searchbar"
        icon={<IconAt size="0.8rem" />}
        placeholder="ex. New York"
        data={autocomp_data}
      />
    </div>

  )
}

export default HomeCard