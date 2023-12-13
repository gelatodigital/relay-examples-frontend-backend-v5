import {
  CallWithERC2771Request,
  GelatoRelay,
  SponsoredCallRequest,
  CallWithSyncFeeERC2771Request,
} from "@gelatonetwork/relay-sdk";
import {
  ethers,
  JsonRpcProvider,
  parseEther,
  Wallet,
  parseUnits,
} from "ethers";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env" });

// const GELATO_RELAY_API_KEY = process.env.GELATO_API_KEY;

// const zydeMainnetAbi = require("../abis/ZydeV1.json"); //need this
// const zydeMainnetAbi = ["function transferUSDC(address _to, uint256 _amount)"];
const abi = [
  "function transferUSDC(address payable _recipient, uint _amount) public returns (bool)",
];
const zydeContractAddress = "0xc5477E44f532d83dbfec4F62ad655e99Eee64627";

const usdcABI = require("../abis/USDCMainnet.json");
const USDCTokenAddress = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174";
const receipientAddress = "0x58FE81429f0F3c77691C9d73Ee92edb05C8E05D3";

const provider = new JsonRpcProvider(`${process.env.ALCHEMY_MAINNET_URL}`);
const wallet = new Wallet((process.env.PRIVATE_KEY as string) || "", provider);
console.log(wallet.address);
const relay = new GelatoRelay();

const ZydeContractInstance = new ethers.Contract(
  zydeContractAddress,
  abi,
  wallet
);
const USDCContractInstance = new ethers.Contract(usdcABI, USDCTokenAddress);
const testCallWithSyncFeeERC2771Request = async () => {
  const transferAmount = 0.002;
  const fee = (transferAmount * 1.1) / 100;
  console.log(fee);
  const totalApproveAmount = transferAmount + fee;
  console.log(totalApproveAmount);

  const user = wallet.address;

  const chainId = (await provider.getNetwork()).chainId;

  const approveData = await USDCContractInstance.approve(
    zydeContractAddress,
    parseUnits(totalApproveAmount.toString(), 6)
  );

  // Generate the target payload
  const { data } = await ZydeContractInstance.transferUSDC(
    receipientAddress,
    parseUnits(transferAmount.toString(), 6)
  );
  // populate the relay SDK request body
  const request: CallWithSyncFeeERC2771Request = {
    chainId: chainId,
    target: "0xc5477E44f532d83dbfec4F62ad655e99Eee64627",
    data: data,
    user: user,
    feeToken: USDCTokenAddress,
    isRelayContext: true,
  };

  // send relayRequest to Gelato Relay API
  const relayResponse = await relay.callWithSyncFeeERC2771(
    request,
    provider as any
  );
  console.log(relayResponse);
  console.log(
    `https://relay.gelato.digital/tasks/status/${relayResponse.taskId}`
  );
};

testCallWithSyncFeeERC2771Request();
