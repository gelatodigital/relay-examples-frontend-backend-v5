import { CallWithERC2771Request, GelatoRelay } from "@gelatonetwork/relay-sdk";
import { ethers } from "ethers";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env" });
const ROOTSTOCK_ID = process.env.ROOTSTOCK_ID;
const RPC_URL = `https://rpc.mainnet.rootstock.io/${ROOTSTOCK_ID}`;
const provider = new ethers.JsonRpcProvider(RPC_URL);
const signer = new ethers.Wallet(process.env.PRIVATE_KEY as string, provider);
const relay = new GelatoRelay();

const testSponsoredCallERC2771 = async () => {
  const GELATO_RELAY_API_KEY = process.env.GELATO_RELAY_API_KEY;
    const counter = "0x00172f67db60E5fA346e599cdE675f0ca213b47b"; 
    const abi = ["function increment()"];

    const user = await signer.getAddress();
    
    const chainId = (await provider.getNetwork()).chainId

    // Generate the target payload
    const contract = new ethers.Contract(counter, abi, signer);
    const { data } = await contract.increment.populateTransaction();
    
    // Populate a relay request
    const request: CallWithERC2771Request = {
      chainId,
      target: counter,
      data: data as string,
      user: user as string,
    };
    
    const response = await relay.sponsoredCallERC2771(request, signer, GELATO_RELAY_API_KEY as string);

    console.log(`https://relay.gelato.digital/tasks/status/${response.taskId}`)

}


testSponsoredCallERC2771()