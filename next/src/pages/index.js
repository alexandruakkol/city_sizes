import GMap from '../components/GMap.js';
import { MantineProvider } from '@mantine/core';
import Head from 'next/head';

function App() {
  return (
    <div className="App">
      <Head>
        <title>City Sizes</title>
        <meta
          name="description"
          content="City size comparison tool. Compare city sizes on a map! We use data from maps of towns and cities."
        />
      </Head>
      <MantineProvider>
        <GMap></GMap>
      </MantineProvider>
    </div>
  );
}

export default App;
