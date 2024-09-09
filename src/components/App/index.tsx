import { useEffect, useState } from "react";
import { Status, State, Chain, Message } from "../../types/Status";

import { ethers } from "ethers";
import metamask from "../../assets/images/metamask.png";
import Header from "../Header";

import "./style.css";
import Action from "../Action";
import Loading from "../Loading";
import Button from "../Button";
import {
  CallWithERC2771Request,
  CallWithSyncFeeERC2771Request,
  CallWithSyncFeeRequest,
  GelatoRelay,
  SponsoredCallRequest,
  TransactionStatusResponse,
} from "@gelatonetwork/relay-sdk";
import { fetchStatusPoll, fetchStatusSocket } from "./task";
import { GELATO_RELAY__KEY } from "../../constants";

const GELATO_RELAY_API_KEY =GELATO_RELAY__KEY // YOUR SPONSOR KEY

const App = () => {
  // these could potentially be unified into one provider
  // provider will initially be the static JsonRpcProvider (read-only)
  // once a wallet is connected it will be set to the WalletProvider (can sign)

  const [ready, setReady] = useState(false);

  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [signerAddress, setSignerAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<Chain>({ name: "", id: 0 });
  const [message, setMessage] = useState<Message>({
    header: "Loading",
    body: undefined,
    taskId: undefined,
  });
  const [max, setMax] = useState<boolean>(false);
  const [connectStatus, setConnectStatus] = useState<Status | null>({
    state: State.missing,
    message: "Loading",
  });

  const onConnect = async () => {
    console.log("connec");
    try {
      await window.ethereum.request({
        method: "wallet_requestPermissions",
        params: [
          {
            eth_accounts: {},
          },
        ],
      });
      window.location.reload();
    } catch (error) {}
  };

  const onDisconnect = async () => {
    setConnectStatus({
      state: State.failed,
      message: "Waiting for Disconnection",
    });

    await window.ethereum.request({
      method: "eth_requestAccounts",
      params: [
        {
          eth_accounts: {},
        },
      ],
    });
  };

  const onAction = async (action: number) => {
    setLoading(true);
    switch (action) {
      case 0:
        sponsoredCallERC2771();
        break;
      case 1:
        sponsoredCall();
        break;
      case 2:
        callWithSyncFeeERC2771();
        break;
      case 3:
        callWithSyncFee();
        break;
      default:
        setLoading(false);
        break;
    }
  };

  const sponsoredCallERC2771 = async () => {
    const relay = new GelatoRelay();
    const counter = "0x00172f67db60E5fA346e599cdE675f0ca213b47b";
    const abi = ["function increment()"];

    const signer = await provider!.getSigner();
    const user = await signer.getAddress();

    const chainId = (await provider!.getNetwork()).chainId;

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

    relay.onTaskStatusUpdate((taskStatus: TransactionStatusResponse) => {
      console.log("Task status update", taskStatus);
      fetchStatusSocket(taskStatus, setMessage, setLoading);
    });

    const response = await relay.sponsoredCallERC2771(
      request,
      provider!,
      GELATO_RELAY_API_KEY as string
    );
    console.log(`https://relay.gelato.digital/tasks/status/${response.taskId}`);
  };

  const sponsoredCall = async () => {
    const relay = new GelatoRelay();
    const counter = "0xEEeBe2F778AA186e88dCf2FEb8f8231565769C27";
    const abi = ["function increment()"];

    const chainId = (await provider!.getNetwork()).chainId;

    // Generate the target payload
    const contract = new ethers.Contract(counter, abi, signer);
    const { data } = await contract.increment.populateTransaction();

    // Populate a relay request
    const request: SponsoredCallRequest = {
      chainId,
      target: counter,
      data: data as string,
    };
  
    const response = await relay.sponsoredCall(
      request,
      GELATO_RELAY_API_KEY as string
    );

    const relayStatusWs = new WebSocket(
      "wss://api.gelato.digital/tasks/ws/status"
    );
      relayStatusWs.onopen = (event) => {
        relayStatusWs.send(
          JSON.stringify({
            action: "subscribe" as string,
            taskId: response.taskId,
          })
        );
        relayStatusWs.onmessage = (event) => {
          fetchStatusSocket(JSON.parse(event.data).payload, setMessage, setLoading);
        };
      }

    console.log(`https://relay.gelato.digital/tasks/status/${response.taskId}`);

  
      
  };

  const callWithSyncFee = async () => {
    const counter = "0x730615186326cF8f03E34a2B49ed0f43A38c0603";
    const abi = ["function increment()"];
    const signer = await provider!.getSigner();
    const relay = new GelatoRelay();

    const chainId = (await provider!.getNetwork()).chainId;

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

    // alert(`TaskId: https://relay.gelato.digital/tasks/status/${response.taskId}`)
    console.log(`https://relay.gelato.digital/tasks/status/${response.taskId}`);
    fetchStatusPoll(response.taskId, setMessage, setLoading);
  };

  const callWithSyncFeeERC2771 = async () => {
    const relay = new GelatoRelay();
    const counter = "0x5dD1100f23278e0e27972eacb4F1B81D97D071B7";
    const abi = ["function increment()"];
    const signer = await provider!.getSigner();
    const user = await signer.getAddress();

    const chainId = (await provider!.getNetwork()).chainId;

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

    const response = await relay.callWithSyncFeeERC2771(request, provider!);

    console.log(`https://relay.gelato.digital/tasks/status/${response.taskId}`);
    fetchStatusPoll(response.taskId, setMessage, setLoading);
  };

  const refresh = async (provider: ethers.BrowserProvider) => {
    setProvider(provider);

    const chain = await provider.getNetwork();
    setChainId({ name: chain.name, id: +chain.chainId.toString() });

    const addresses = await provider.listAccounts();

    if (addresses.length > 0) {
      const signer = await provider?.getSigner();
      const signerAddress = (await signer?.getAddress()) as string;
      setSignerAddress(signerAddress);
      setSigner(signer);
      setConnectStatus({
        state: State.success,
        message: "Connection Succed",
      });

      setLoading(false);
    } else {
      setLoading(false);
      setConnectStatus({ state: State.failed, message: "Connection Failed" });
    }

    //
    // console.log(signer);
  };

  const onUpdate = async (value: number, action: number) => {};

  useEffect(() => {
    (async () => {
      if (provider != null) {
        return;
      }
      if (window.ethereum == undefined) {
        setLoading(false);
      } else {
        const web3Provider = new ethers.BrowserProvider(window.ethereum);
        refresh(web3Provider);
      }
    })();
  }, []);

  return (
    <div className="App">
      <div className="container">
        <Header
          status={connectStatus}
          ready={ready}
          onConnect={onConnect}
          onDisconnect={onDisconnect}
          signerAddress={signerAddress}
        />
        {connectStatus?.state! == State.success && (
          <div>
            {loading && <Loading message={message} />}
            <main>
              <div className="flex">
                <p className="title">
                  Chain: {chainId.id}{" "}
                </p>

                <div>
                  <div className="isDeployed">
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        justifyContent: "center",
                      }}
                    >
                      <Action
                        ready={ready}
                        onClick={onAction}
                        onUpdate={onUpdate}
                        text="sponsoredCallERC2771"
                        action={0}
                        max={max}
                      />
                      <Action
                        ready={ready}
                        onClick={onAction}
                        onUpdate={onUpdate}
                        text="spondoredCall"
                        action={1}
                        max={max}
                      />
                      <Action
                        ready={ready}
                        onClick={onAction}
                        onUpdate={onUpdate}
                        text="callWithSyncFeeERC2771"
                        action={2}
                        max={max}
                      />
                      <Action
                        ready={ready}
                        onClick={onAction}
                        onUpdate={onUpdate}
                        text="callWithSyncFee"
                        action={3}
                        max={max}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </main>
          </div>
        )}{" "}
        {connectStatus?.state! == State.missing && (
          <p style={{ textAlign: "center" }}>Metamask not Found</p>
        )}
        {(connectStatus?.state == State.pending ||
          connectStatus?.state == State.failed) && (
          <div style={{ textAlign: "center", marginTop: "20px" }}>
            <h3> Please connect your metamask</h3>
            <Button status={connectStatus} ready={ready} onClick={onConnect}>
              <img src={metamask} width={25} height={25} />{" "}
              <span style={{ position: "relative", top: "-6px" }}>
                Connect{" "}
              </span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
