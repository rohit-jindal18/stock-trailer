import styles from '@stock-trailer/styles/Home.module.css'
import { Inter } from 'next/font/google'
import Head from 'next/head'

const inter = Inter({ subsets: ['latin'] })

export default function Authorize() {
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
          Quick Sort - Entries
        </div>
      </main>
    </>
  )
}
