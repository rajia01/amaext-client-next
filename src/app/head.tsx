import React from "react";

export default function RootHead({title}:{title:string}) {
	return <>
			<head>
        <link rel="apple-touch-icon" href="/plug.png" />
        <link rel="manifest" href="/manifest.json" />
        <link
          rel="shortcut icon"
          type="image/x-icon"
          href="/plug.png"
        />
        <link rel="icon" type="image/png" sizes="32x32" href="/plug.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/plug.png" />
        <title>{title}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#000000" />
      </head>
	</>
}