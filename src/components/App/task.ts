import {
  GelatoRelay,
  TransactionStatusResponse,
} from "@gelatonetwork/relay-sdk";
import { firstValueFrom, interval, pipe, Subject, take, takeUntil } from "rxjs";
import { Message, TaskState } from "../../types/Status";

const relay = new GelatoRelay();

export const fetchStatusPoll = async (
  taskIdToQuery: string,
  setMessage: any,
  setLoading: any
) => {
  setMessage({
    header: "Loading",
    body: undefined,
    taskId: undefined,
  })
  let destroyFetchTask: Subject<void> = new Subject();
  const numbers = interval(1000);

  const takeFourNumbers = numbers.pipe(takeUntil(destroyFetchTask));

  takeFourNumbers.subscribe(async (x) => {
    try {
      let status = await relay.getTaskStatus(taskIdToQuery);

      let details = {
        txHash: status?.transactionHash || undefined,
        chainId: status?.chainId?.toString() || undefined,
        blockNumber: status?.blockNumber?.toString() || undefined,
        executionDate: status?.executionDate || undefined,
        creationnDate: status?.creationDate || undefined,
        taskState: (status?.taskState as TaskState) || undefined,
      };
      let body = ``;
      let header = ``;

      let txHash = details.txHash;

      switch (details.taskState!) {
        case TaskState.WaitingForConfirmation:
          header = `Transaction Relayed`;
          body = `Waiting for Confirmation`;
          break;
        case TaskState.Pending:
          header = `Transaction Relayed`;
          body = `Pending Status`;

          break;
        case TaskState.CheckPending:
          header = `Transaction Relayed`;
          body = `Simulating Transaction`;

          break;
        case TaskState.ExecPending:
          header = `Transaction Relayed`;
          body = `Pending Execution`;
          break;
        case TaskState.ExecSuccess:
          header = `Transaction Executed`;
          body = `Waiting to refresh...`;

          destroyFetchTask.next();
          setTimeout(() => {
            console.log("finish");
            setLoading(false);
          }, 2000);

          break;
        case TaskState.Cancelled:
          header = `Canceled`;
          body = `TxHash: ${details.txHash}`;
          destroyFetchTask.next();
          break;
        case TaskState.ExecReverted:
          header = `Reverted`;
          body = `TxHash: ${details.txHash}`;
          destroyFetchTask.next();
          break;
        case TaskState.NotFound:
          header = `Not Found`;
          body = `TxHash: ${details.txHash}`;
          destroyFetchTask.next();
          break;
        case TaskState.Blacklisted:
          header = `BlackListed`;
          body = `TxHash: ${details.txHash}`;
          destroyFetchTask.next();
          break;
        default:
          // ExecSuccess = "ExecSuccess",
          // ExecReverted = "ExecReverted",
          // Blacklisted = "Blacklisted",
          // Cancelled = "Cancelled",
          // NotFound = "NotFound",
          // destroyFetchTask.next();
          break;
      }

      setMessage({
        header,
        body,
        taskId: txHash,
      });

      // this.store.dispatch(
      //   Web3Actions.chainBusyWithMessage({
      //     message: {
      //       body: body,
      //       header: header,
      //     },
      //   })
      // );
    } catch (error) {}
  });
};

export const fetchStatusSocket = async (
  status: TransactionStatusResponse,
  setMessage: any,
  setLoading: any
) => {
  setMessage({
    header: "Loading",
    body: undefined,
    taskId: undefined,
  })

  try {
    let details = {
      txHash: status?.transactionHash || undefined,
      chainId: status?.chainId?.toString() || undefined,
      blockNumber: status?.blockNumber?.toString() || undefined,
      executionDate: status?.executionDate || undefined,
      creationnDate: status?.creationDate || undefined,
      taskState: (status?.taskState as TaskState) || undefined,
    };
    let body = ``;
    let header = ``;

    let txHash = details.txHash;
    console.log(204, details.taskState);

    switch (details.taskState!) {
      case TaskState.WaitingForConfirmation:
        header = `Transaction Relayed`;
        body = `Waiting for Confirmation`;
        break;
      case TaskState.Pending:
        header = `Transaction Relayed`;
        body = `Pending Status`;

        break;
      case TaskState.CheckPending:
        header = `Transaction Relayed`;
        body = `Simulating Transaction`;

        break;
      case TaskState.ExecPending:
        header = `Transaction Relayed`;
        body = `Pending Execution`;
        break;
      case TaskState.ExecSuccess:
        header = `Transaction Executed`;
        body = `Waiting to refresh...`;

   
        setTimeout(() => {
          console.log("finish");
          setLoading(false);
        }, 2000);

        break;
      case TaskState.Cancelled:
        header = `Canceled`;
        body = `TxHash: ${details.txHash}`;
       
        break;
      case TaskState.ExecReverted:
        header = `Reverted`;
        body = `TxHash: ${details.txHash}`;
   
        break;
      case TaskState.NotFound:
        header = `Not Found`;
        body = `TxHash: ${details.txHash}`;
      
        break;
      case TaskState.Blacklisted:
        header = `BlackListed`;
        body = `TxHash: ${details.txHash}`;
     
        break;
      default:
        // ExecSuccess = "ExecSuccess",
        // ExecReverted = "ExecReverted",
        // Blacklisted = "Blacklisted",
        // Cancelled = "Cancelled",
        // NotFound = "NotFound",
        // destroyFetchTask.next();
        break;
    }

    setMessage({
      header,
      body,
      taskId: txHash,
    });

    // this.store.dispatch(
    //   Web3Actions.chainBusyWithMessage({
    //     message: {
    //       body: body,
    //       header: header,
    //     },
    //   })
    // );
  } catch (error) {}
};
