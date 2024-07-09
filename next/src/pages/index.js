import GMap from '../components/GMap.js';
import { MantineProvider } from '@mantine/core';
import Head from 'next/head';
import HomeCard from '../components/HomeCard.js';
import {useState} from 'react';

function App() {

  const [polygon, setPolygon] = useState({});

  return (
    <div className="App">
      <Head>
        <title>City Sizes | Compare city sizes on a map</title>
        <meta
          name="description"
          content="City size comparison tool. Compare city sizes on a map! We use data from maps of towns and cities."
        />
      </Head>
      <link
          rel="canonical"
          href="https://citysizes.com/"
          key="canonical"
      />
      <MantineProvider>
        <HomeCard setPolygon={setPolygon}></HomeCard>
        <GMap polygon={polygon}></GMap>
      </MantineProvider>
    </div>
  );
}

export default App;
