import lookupSingleAddress from '../translator.js'
import chalk from 'chalk';

console.clear();

go();
function go(){
    process.stdout.write(chalk.cyan.bold.underline('enter address')+chalk.cyan(':')+' ') 
    process.stdin.on('data', data => {
        lookupSingleAddress(data.toString()).then((result) => {
            console.log('result: ', result);
            go();
        });
    });
}