const tokenAddresses = [111, 222, 333, 444, 555, 666];


updateSingleTokenList(tokenAddresses).then((q) =>
    console.log(`all resolved!`)
);
function updateSingleTokenList(tokenAddresses) {
    return tokenAddresses.reduce(
        (acc, tokenAddress) =>
        acc.then((res) =>
            new Promise((resolve) =>{
            var delay = Math.floor(Math.random() * 3000);
            console.log(delay);
            setTimeout(() => {
                console.log(`${tokenAddress} resolved!`)
                resolve(tokenAddress);
            }, delay)
            }
            )
        ),
        Promise.resolve()
    )
}



