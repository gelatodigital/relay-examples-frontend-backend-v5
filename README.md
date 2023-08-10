
# Relay Examples

This project showcases the implementation of the relay sdk v5 with front end (React) and back end (node) examples.
The relay sdk implements ethers v6 that introduces some minor breaking changes when instantiating the providers and creating the payload data. Please refer to the [ethers migration guide](https://docs.ethers.org/v6/migrating/) for further information


## Frontend examples

We are using React to showcase the relay-sdk integration  

Please add the Gelat Relay sponsorsKey [here](src/components/App/index.tsx#L22) 

```
yarn start
```

<img src="docs/ui.png" width="600" />

The implementation code can be found here:
- [sponsoredCallERC2771](src/components/App/index.tsx#L102)
- [sponsoredCall](src/components/App/index.tsx#L136)
- [callWithSyncFee](src/components/App/index.tsx#L164)
- [callWithSyncFeeERC2771](src/components/App/index.tsx#L194)


### Backend/Node examples

Please copy `.env.example` to `.env ` and add the GELATO_RELAY_API_KEY, PRIVATE_KEY and ALCHEMY_ID. Then you can run:

#### sponsoredCallERC2771
```
yarn testSponsoredCallERC2771
```
code can be found [here](scripts/testSponsoredCallERC2771.ts)

#### sponsoredCall
```
yarn testSponsoredCall
```
code can be found [here](scripts/testSponsoredCall.ts)


#### callWithSyncFee
```
yarn testCallWithSyncFee
```
code can be found [here](scripts/testCallWithSyncFee.ts)


#### callWithSyncFeeERC2771
```
yarn testCallWithSyncFeeERC2771
```
code can be found [here](scripts/testCallWithSyncFeeERC2771.ts)
