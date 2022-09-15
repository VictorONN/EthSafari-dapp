import Head from "next/head";
import Web3Modal from "web3modal";
import CoinbaseWalletSDK from "@coinbase/wallet-sdk";
import WalletConnect from "@walletconnect/web3-provider";
import React, { useEffect, useRef, useState } from "react";
import { abi, FINALPROJECT_CONTRACT_ADDRESS } from "../constants";
import styles from "../styles/Home.module.css";

export const providerOptions = {
  coinbasewallet: {
    package: CoinbaseWalletSDK,
    options: {
      appName: "Web 3 Modal Demo",
      infuraId: process.env.INFURA_KEY,
    },
  },
};

export default function Home() {
  // walletConnected keep track of whether the user's wallet is connected or not
  const [walletConnected, setWalletConnected] = useState(false);
  // loading is set to true when we are waiting for a transaction to get mined
  const [loading, setLoading] = useState(false);
  // Create a reference to the Web3 Modal (used for connecting to Metamask) which persists as long as the page is open
  const [provider, setProvider] = useState();
  const [library, setLibrary] = useState();

  /** Variables to keep track of swap functionality */
  // Amount of DAI that the user wants to invest
  const [swapAmount, setSwapAmount] = useState("");
  // // Amount of ETH that the admin purchases
  const [purchaseAmount, setPurchaseAmount] = useState("");

  const web3ModalRef = useRef();

  // const web3Modal = new Web3Modal({
  //   providerOptions, // required
  // });

  useEffect(() => {
    web3ModalRef.current = new Web3Modal({
      // network: "mumbai",
      network: "goerli",
      providerOptions,
    });
  }, [walletConnected]);

  /**
   * connectWallet: Connects the Coinbase wallet
   */
  const connectWallet = async () => {
    try {
      // const provider = await web3Modal.connect();
      // const library = new ethers.providers.Web3Provider(provider);
      await getProviderOrSigner();
      setWalletConnected(true);
      setLibrary(library);
    } catch (error) {
      console.error(error);
    }
  };

  /**
   * @param {*} needSigner - True if you need the signer, default false
   * otherwise
   */
  const getProviderOrSigner = async (needSigner = false) => {
    // Connect to Metamask
    // Since we store `web3Modal` as a reference, we need to access the `current` value to get access to the underlying object
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);
    setProvider(provider);

    // If user is not connected to the Goerli network, let them know and throw an error
    const { chainId } = await web3Provider.getNetwork();
    if (chainId !== 5) {
      window.alert("Change the network to Goerli");
      throw new Error("Change network to Goerli");
    }

    if (needSigner) {
      const signer = web3Provider.getSigner();
      return signer;
    }
    return web3Provider;
  };

  /**
   * invest: Contribute DAI into the contract
   */
  const invest = async () => {
    try {
      // We need a Signer here since this is a 'write' transaction.
      const signer = await getProviderOrSigner(true);
      // Create a new instance of the Contract with a Signer, which allows
      // update methods
      const finalProjectContract = new Contract(
        FINALPROJECT_CONTRACT_ADDRESS,
        abi,
        signer
      );
      // User has to approve `swapAmountWei` for the contract because `DAI` token
      // is an ERC20
      tx = await finalProjectContract.approve(
        FINALPROJECT_CONTRACT_ADDRESS,
        swapAmountWei.toString()
      );
      await tx.wait();
      // Convert the amount entered by the user to a BigNumber using the `parseEther` library from `ethers.js`
      const tx = await finalProjectContract.invest(swapAmountWei);
      setLoading(true);
      // wait for the transaction to get mined
      await tx.wait();
      setLoading(false);
      window.alert("You successfully contributed!");
    } catch (err) {
      console.error(err);
    }
  };

  /**
   * purchase: Owner can purchase ETH
   */
  const purchase = async () => {
    try {
      // // We need a Signer here since this is a 'write' transaction.
      // const signer = await getProviderOrSigner(true);
      // // Create a new instance of the Contract with a Signer, which allows
      // // update methods
      const finalProjectContract = new Contract(
        FINALPROJECT_CONTRACT_ADDRESS,
        abi,
        signer
      );
      // Convert the amount entered by the user to a BigNumber using the `parseEther` library from `ethers.js`
      const swapAmountWei = utils.parseEther(purchaseAmount);
      // Check if the user entered zero
      // We are here using the `eq` method from BigNumber class in `ethers.js`
      if (!swapAmountWei.eq(zero)) {
        const signer = await getProviderOrSigner(true);
        setLoading(true);
        // Call the purchase function
        await finalProjectContract.purchase(swapAmountWei);
        // wait for the transaction to get mined
        await tx.wait();
        setLoading(false);
      }
      window.alert("You successfully swapped!");
    } catch (err) {
      console.error(err);
    }
  };

  /*
      renderButton: Returns a button based on the state of the dapp
  */
  const renderButton = () => {
    // If wallet is not connected, return a button which allows them to connect their wllet
    if (!walletConnected) {
      return (
        <button onClick={connectWallet} className={styles.button}>
          Connect your wallet
        </button>
      );
    }

    // If we are currently waiting for something, return a loading button
    if (loading) {
      return <button className={styles.button}>Loading...</button>;
    }

    return (
      <div>
        <Head>
          <title>ETH-DCA Strategy</title>
          <meta name="description" content="ETH Strategy" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <input
          type="number"
          placeholder="Amount"
          onChange={async (e) => {
            setSwapAmount(e.target.value || "");
            // Calculate the amount of DAI user wants to contribute
            await invest(e.target.value || "0");
          }}
          className={styles.input}
          value={swapAmount}
        />
        {/* <select
            className={styles.select}
            name="dropdown"
            id="dropdown"
            onChange={async () => {
              setEthSelected(!ethSelected);
              // Initialize the values back to zero
              await _getAmountOfTokensReceivedFromSwap(0);
              setSwapAmount("");
            }}
          >
            <option value="eth">Ethereum</option>
            <option value="cryptoDevToken">Crypto Dev Token</option>
          </select> */}
        <input
          type="number"
          placeholder="Amount"
          onChange={async (e) => {
            setPurchaseAmount(e.target.value || "");
            // Calculate the amount of tokens user would receive after the swap
            await purchase(e.target.value || "0");
          }}
          className={styles.input}
          value={swapAmount}
        />
        <br />
        <div className={styles.inputDiv}>
          {/* Convert the BigNumber to string using the formatEther function from ethers.js */}
          {ethSelected
            ? `You will get ${utils.formatEther(
                tokenToBeReceivedAfterSwap
              )} Crypto Dev Tokens`
            : `You will get ${utils.formatEther(
                tokenToBeReceivedAfterSwap
              )} Eth`}
        </div>
        <button className={styles.button1} onClick={_swapTokens}>
          Swap
        </button>
      </div>
    );
  };
}
