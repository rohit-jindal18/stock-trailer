import { Box, Button, Heading, Input, InputGroup, InputLeftAddon, Text } from '@chakra-ui/react'
import styles from '@stock-trailer/styles/Home.module.css'
import { IInstrumentInfo } from '@stock-trailer/types'
import { Inter } from 'next/font/google'
import Head from 'next/head'
import { useState } from 'react'

const inter = Inter({ subsets: ['latin'] })

export default function Authorize() {
  const [instruments, setInstruments] = useState<IInstrumentInfo[]>([{
    id: 'Sample',
    qty: 0
  }]);

  const addMoreInstrument = () => {
    const newInstruments = [...instruments, {
      id: 'Sample',
      qty: 0
    }]
    setInstruments(newInstruments);
  }
  return (
    <>
      <Head>
        <title>Stock - Trailer</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <div className={styles.description}>
          <Heading>Quick Sort - Entries</Heading>
        </div>
        <Box>
          {
            instruments.map((instrument, index) => {
              return (
                <Box marginY={'16px'} display={'flex'} alignItems='center' key={`qs-${index}`} >
                  <Text mr={'16px'}>{index + 1}.</Text>
                  <InputGroup>
                    <InputLeftAddon children='Instrument ID' />
                    <Input placeholder='Enter' title='Instrument Id' display={'Instrument Id'} value={instrument.id} onChange={(event) => {
                      const newInstruments = [
                        ...instruments
                      ]
                      newInstruments[index].id = event.target.value
                      setInstruments(newInstruments);
                    }} />
                  </InputGroup>
                  <InputGroup>
                    <InputLeftAddon children='Quantity' />
                    <Input placeholder='Enter' value={instrument.qty} onChange={(event) => {
                      const newInstruments = [
                        ...instruments
                      ]
                      newInstruments[index].qty = +event.target.value
                      setInstruments(newInstruments);
                    }} />
                  </InputGroup>
                </Box>
              );
            })
          }
          <Box>
            <Button mr={'16px'} variant={'solid'} mt={'16px'} onClick={addMoreInstrument}>Add more instrument</Button>
            <Button variant={'solid'} mt={'16px'}>Submit</Button>
          </Box>
        </Box>
      </main>
    </>
  )
}
