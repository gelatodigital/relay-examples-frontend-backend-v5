import { GelatoRelay, SponsoredCallRequest } from "@gelatonetwork/relay-sdk";
import { ethers } from "ethers";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env" });

const ROOTSTOCK_ID = process.env.ROOTSTOCK_ID;
const GELATO_RELAY_API_KEY = process.env.GELATO_RELAY_API_KEY


const RPC_URL = `https://rpc.mainnet.rootstock.io/${ROOTSTOCK_ID}`;

const provider = new ethers.JsonRpcProvider(RPC_URL);
const signer = new ethers.Wallet(process.env.PRIVATE_KEY as string, provider);

const relay = new GelatoRelay();


const testSponsoredCall= async () => {
    const counter = "0xEEeBe2F778AA186e88dCf2FEb8f8231565769C27"; 
    const abi = ["function increment()"];

    const chainId = (await provider.getNetwork()).chainId
    console.log(chainId)
    // Generate the target payload
    const contract = new ethers.Contract(counter, abi, signer);
    const { data } = await contract.increment.populateTransaction();
    
    // Populate a relay request
    const request: SponsoredCallRequest = {
      chainId,
      target: counter,
      data: data as string
    };
    
    // Without a specific API key, the relay request will fail! 
    // Go to https://relay.gelato.network to get a testnet API key with 1Balance.
    // Send a relay request using Gelato Relay!
    const response = await relay.sponsoredCall(request, GELATO_RELAY_API_KEY as string);

  //   const body =  JSON.stringify({
  //     "chainId": +chainId.toString(),
  //     "target": counter,
  //     "data": data as string,
  //     "sponsorApiKey": GELATO_RELAY_API_KEY
  //   })

  //   console.log(body)
  //   const response = await fetch('https://api.gelato.digital/relays/v2/sponsored-call', {
  //     method: 'POST',
  //     headers: {
  //       "Content-Type": "application/json"
  //     },
  //     body,
  // });
  // const data2 = await response.json();
  //   console.log(data2)


     console.log(`https://relay.gelato.digital/tasks/status/${response.taskId}`)

}


testSponsoredCall()