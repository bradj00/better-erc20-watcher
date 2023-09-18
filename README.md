# better-erc20-watcher
Watch ERC-20 transactions live. 

Categorize on-chain actions and give friendly labels to addresses.

Step into a tokenized community and rapidly gain analytical insight.


## Coming soon: Install instructions and pre-requisites to use this tool.


using:

-MERNS stack (mongo, express, react, node, solidity)

-openAI to prototype scaffold faster

-Third Party External APIs for blockchain and market data

-React webUI frontend for better visualization and management


<sub>( Feature rich front-end UI with live data updates )</sub>
![image](https://user-images.githubusercontent.com/99688245/215305627-7dff968a-9350-4022-abd8-1ce0293d93a8.png)


<sub>( Address Summary stats, includes held tokens common to the existing database of watched addresses )</sub>

<sub>( This will be good for stepping into a community and quickly seeing commonly held ERC20 tokens and patterns)</sub>
![image](https://user-images.githubusercontent.com/99688245/212493974-77cdc1bc-a1fe-44bd-83d6-2add1ebc87c5.png)

<sub>Transaction Visualizer using react-force-graph to render transaction flows </sub>
![image](https://github.com/bradj00/better-erc20-watcher/assets/99688245/86447241-407d-4e74-be3a-a628a556650d)




<sub>( chainData.js ingestion engine fetching and caching blockchain token TXs to mongo )</sub>
![chainData_action](https://user-images.githubusercontent.com/99688245/202078438-05a839b5-f258-4e94-b2d3-f0d78301fea8.gif)


<sub>( translator.js service querying OpenSea api for human readable name and caching to mongo )</sub>
![image](https://user-images.githubusercontent.com/99688245/202107232-82cb591c-a2cf-423a-b455-df82a6be85a0.png)


<sub>Architecture design</sub>
![image](https://github.com/bradj00/better-erc20-watcher/assets/99688245/00df9568-e148-48a0-8bb1-1d6f993c498f)





(Some Market Data provided by CoinGecko! Backlink to be added in webUI.)


