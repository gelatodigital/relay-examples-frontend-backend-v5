import {
  CallWithSyncFeeRequest,
  GelatoRelay,
} from "@gelatonetwork/relay-sdk";
import { ethers } from "ethers";
import * as dotenv from "dotenv";


dotenv.config({ path: ".env" });

const ROOTSTOCK_ID = process.env.ROOTSTOCK_ID;

const RPC_URL = `https://rpc.mainnet.rootstock.io/${ROOTSTOCK_ID}`;

const provider = new ethers.JsonRpcProvider(RPC_URL);
const signer = new ethers.Wallet(process.env.PRIVATE_KEY as string, provider);

const relay = new GelatoRelay();

const testCallWithSyncFee = async () => {
  const counter = "0x730615186326cF8f03E34a2B49ed0f43A38c0603";
  const abi = ["function increment()"];

  const user = await signer.getAddress();

  const chainId = (await provider.getNetwork()).chainId;

  // Generate the target payload
  const contract = new ethers.Contract(counter, abi, signer);
  const { data } = await contract.increment.populateTransaction();

  // address of the token to pay fees
  const feeToken = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";

  // populate the relay SDK request body
  const request: CallWithSyncFeeRequest = {
    chainId,
    target: counter,
    data: data,
    feeToken: feeToken,
    isRelayContext: true,
  };

  const response = await relay.callWithSyncFee(request);

  console.log(`https://relay.gelato.digital/tasks/status/${response.taskId}`);
};

testCallWithSyncFee();
