# better-erc20-watcher
Watch ERC20 transactions live. Categorize on-chain actions and give friendly labels to addresses


using:

-MERNS stack (mongo, express, react, node, solidity)

-openAI to prototype scaffold faster

-Moralis API for blockchain data

-React webUI frontend for better visualization and management

<sub>( chainData.js ingestion engine fetching and caching blockchain token TXs to mongo )</sub>
![chainData_action](https://user-images.githubusercontent.com/99688245/202078438-05a839b5-f258-4e94-b2d3-f0d78301fea8.gif)

<sub>( TX hashes are subtly grouped by color in the web frontend. Click an address to filter )</sub>
![image](https://user-images.githubusercontent.com/99688245/202986823-8b2fc64d-6f7b-45c2-b6a4-bc44f46b26b4.png)

<sub>( translator.js service querying OpenSea api for human readable name and caching to mongo )</sub>
![image](https://user-images.githubusercontent.com/99688245/202107232-82cb591c-a2cf-423a-b455-df82a6be85a0.png)

<sub>( OneNote User Guide detailing mechanical operation and use )</sub>
![image](https://user-images.githubusercontent.com/99688245/201840676-3fedcf9d-adc2-4f10-8afb-2a1b1bba0dce.png)


