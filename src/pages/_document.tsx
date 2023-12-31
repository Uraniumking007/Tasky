/* eslint-disable @typescript-eslint/no-unused-vars */
import { Html, Head, Main, NextScript } from "next/document";

export default function Document(props) {
  return (
    <Html lang="en">
      <Head>
        <meta
          name="One of the best Task Manager in Creation."
          content="Created by Bhavesh Patil : bhaveshp.dev"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <body className="h-screen w-screen">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
