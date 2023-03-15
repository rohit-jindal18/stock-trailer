import Head from 'next/head'
import Image from 'next/image'
import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.css'
import { Button } from '@chakra-ui/react'
import { KITE_LOGIN } from '@/constants'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {

  const loginToKiet = () => {
    console.log("proce", process.env);
    // window.location.href = `${KITE_LOGIN}${process.env.KITE_SECRET}`;
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
          <Button onClick={loginToKiet}>Login to Continue</Button>
        </div>
      </main>
    </>
  )
}
