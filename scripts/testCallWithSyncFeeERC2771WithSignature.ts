import {
  CallWithSyncFeeERC2771Request,
  CallWithSyncFeeRequest,
  ERC2771Type,
  GelatoRelay,
  SponsoredCallRequest,
} from "@gelatonetwork/relay-sdk";
import { ethers } from "ethers";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env" });

const ALCHEMY_ID = process.env.ALCHEMY_ID;
const GELATO_RELAY_API_KEY = process.env.GELATO_RELAY_API_KEY;

const RPC_URL = `https://eth-goerli.g.alchemy.com/v2/${ALCHEMY_ID}`;

const provider = new ethers.JsonRpcProvider(RPC_URL);
const signer = new ethers.Wallet(process.env.PRIVATE_KEY as string, provider);

const relay = new GelatoRelay();

const testCallWithSyncFeeERC2771WithSignature = async () => {
  const counter = "0x5dD1100f23278e0e27972eacb4F1B81D97D071B7";
  const abi = ["function increment()"];
  // const provider = new ethers.providers.Web3Provider(window.ethereum);
  // const signer = provider.getSigner();
  const user = await signer.getAddress();

  const chainId = (await provider.getNetwork()).chainId;



  // Generate the target payload
  const contract = new ethers.Contract(counter, abi, signer);
  const { data } = await contract.increment.populateTransaction();

  // address of the token to pay fees
  const feeToken = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";

  // populate the relay SDK request body
  const request: CallWithSyncFeeERC2771Request = {
    chainId,
    target: counter,
    data: data,
    user: user,
    feeToken: feeToken,
    isRelayContext: true,
  };
 
  

  // sign the Payload and get struct and signature
  const { struct, signature} = await relay.getSignatureDataERC2771(request,signer,ERC2771Type.CallWithSyncFee)

  // send the request with signature
  const response = await relay.callWithSyncFeeERC2771WithSignature(struct,{feeToken,isRelayContext:true},signature)


  console.log(`https://relay.gelato.digital/tasks/status/${response.taskId}`);
};

testCallWithSyncFeeERC2771WithSignature();
