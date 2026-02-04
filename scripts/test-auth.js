
import pinataSDK from '@pinata/sdk';

const apiKey = 'ee9450c46c4e2de96be6';
const apiSecret = '8e370bcf5fb73dfaeab11e2387b1b2cf12b36b7d05d6e8c9d5c9750737a26364';
const pinata = new pinataSDK(apiKey, apiSecret);

pinata.testAuthentication().then((result) => {
    console.log(result);
}).catch((err) => {
    console.error(err);
});
