![image](https://github.com/bradj00/better-erc20-watcher/assets/99688245/bf78e4a8-2828-48b9-bb4f-ac487db26550)
<div align="center">
    
    Watch ERC-20 transactions live.

    Categorize on-chain actions and give friendly labels to addresses.

    Step into an ERC-20 community and rapidly gain analytical insight.

    Cache analyzed data to your local database.

    Pet project in active development. Contributors welcomed.❤️
</div>




![image](https://github.com/bradj00/better-erc20-watcher/assets/99688245/53669b13-6af8-4915-a7b2-b7d70b0d4b12)


## Requirements:

- Ubuntu (tested on)
- Chrome (tested on)
- Node.js v20
- MongoDB
- Docker
- API keys for enabling data retrieval from third-party services (Infura, Coingecko, Etherscan, etc.)

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/bradj00/better-erc20-watcher
   ```

2. Run the installer script and follow the prompts for initial setup:
   ```
   bash installer.sh
   ```

3. The installer will configure your .env files and build the docker images. It will also generate your self-signed certificate.

4. After the installation is complete, you should be able to access the web UI at `https://<host>:3000`.

   **Note**: During the first run, a second window may pop up in your browser to prompt acceptance of the self-signed certificate.

5. The backend of this project is containerized and managed via Docker.


<sub>Easily view crossover ERC20 tokens mutually held in your watched community</sub>
![image](https://user-images.githubusercontent.com/99688245/212493974-77cdc1bc-a1fe-44bd-83d6-2add1ebc87c5.png)

<sub>Transaction Visualizer using react-force-graph to render transaction flows </sub>
![image](https://github.com/bradj00/better-erc20-watcher/assets/99688245/86447241-407d-4e74-be3a-a628a556650d)



<sub>legacy chainData.js ingestion engine fetching and caching blockchain token TXs to mongo (to do: show new TX-Ingestion-Engine) </sub>
![chainData_action](https://user-images.githubusercontent.com/99688245/202078438-05a839b5-f258-4e94-b2d3-f0d78301fea8.gif)


<sub>legacy translator.js service querying OpenSea api for public identitites (to do: show new Tagging-Engine)</sub>
![image](https://user-images.githubusercontent.com/99688245/202107232-82cb591c-a2cf-423a-b455-df82a6be85a0.png)





Some market data provided by CoinGecko! ❤️<br>

Some blockchain data provided by Infura! ❤️<br>

Some blockchain data provided by Etherscan! ❤️<br>



