import { useEffect, useState } from 'react';
import { useWeb3React } from '@web3-react/core';
import { ethers } from 'ethers';
import { IconContext } from 'react-icons';
import { FaMinusCircle, FaPlusCircle } from 'react-icons/fa';
import { useContractContext } from '../context/Contract';
import { MerkleTree } from 'merkletreejs';
import ABI from '../contract/abi.json';
import styles from './Styles.module.css'

const keccak256 = require('keccak256');

export default function Minting() {
  const { chainId, account, active } = useWeb3React();
  const { message, errMsg, setMessage, setErrMsg } = useContractContext();
  const [totalSupply, setTotalSupply] = useState('?');
  const [mintMax, setMintMax] = useState(1);
  const [isPending, setIsPending] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [mintAmount, setMintAmount] = useState(1);
  const [isSaleEnabled, setIsSaleEnabled] = useState(false);
  const [isPresaleEnabled, setIsPresaleEnabled] = useState(false);

  type ErrorWithMessage = {
    message: string
  }

  type ErrorEthers = {
    error: {
      message: string
    }
  }

  function isErrorWithMessage(error: unknown): error is ErrorWithMessage {
    return (
      typeof error === 'object' &&
      error !== null &&
      'message' in error &&
      typeof (error as Record<string, unknown>).message === 'string'
    )
  }

  function toErrorWithMessage(maybeError: unknown): ErrorWithMessage {
    if (isErrorWithMessage(maybeError)) return maybeError

    try {
      return new Error(JSON.stringify(maybeError))
    } catch {
      // fallback in case there's an error stringifying the maybeError
      // like with circular references for example.
      return new Error(String(maybeError))
    }
  }

  function getErrorMessage(error: unknown) {
    return toErrorWithMessage(error).message
  }

  async function claimNFTs() {
    if (active && account && !errMsg) {
      const cost = process.env.NEXT_PUBLIC_DISPLAY_COST;
      const totalCost = (Number(cost) * mintAmount).toString();
      setMessage('');
      setIsPending(true);
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(
          process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!,
          ABI.abi,
          signer
        );

        let proof: string[] = [];
        if (isPresaleEnabled) {
          let list = [
            '0xBD55d43702087b1A8C16Bf052Be549d7c4172f07',
            '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
            '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
            '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
            '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65',
            '0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc',
            '0x976EA74026E726554dB657fA54763abd0C3a0aa9',
            '0x14dC79964da2C08b23698B3D3cc7Ca32193d9955',
            '0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f',
            '0xa0Ee7A142d267C1f36714E4a8F75612F20a79720',
            '0xBcd4042DE499D14e55001CcbB24a551F3b954096',
            '0x71bE63f3384f5fb98995898A86B02Fb2426c5788',
            '0xFABB0ac9d68B0B445fB7357272Ff202C5651694a',
            '0x1CBd3b2770909D4e10f157cABC84C7264073C9Ec',
            '0xdF3e18d64BC6A983f673Ab319CCaE4f1a57C7097',
            '0xcd3B766CCDd6AE721141F452C550Ca635964ce71',
            '0x2546BcD3c84621e976D8185a91A922aE77ECEc30',
            '0xbDA5747bFD65F08deb54cb465eB87D40e51B197E',
            '0xdD2FD4581271e230360230F9337D5c0430Bf44C0',
            '0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199'
          ]
          let merkleTree = new MerkleTree(list, keccak256, { hashLeaves: true, sortPairs: true });
          let root = merkleTree.getHexRoot();
          console.log("root is %s", root);
          const hashedAddress = keccak256(account);
          console.log("Hashed Address: ", hashedAddress);
          proof = merkleTree.getHexProof(hashedAddress);
          console.log("owner proof is %s", proof);
        }

        const transaction = await contract.paidMint(mintAmount, proof, { value: ethers.utils.parseEther(totalCost) });

        setIsPending(false);
        setIsMinting(true);
        await transaction.wait();
        setIsMinting(false);
        setMessage(
          `Yay! ${mintAmount} ${process.env.NEXT_PUBLIC_NFT_SYMBOL
          } successfully sent to ${account.substring(
            0,
            6
          )}...${account.substring(account.length - 4)}`
        );
      } catch (error) {
        setIsPending(false);
        let e = error as ErrorEthers;
        setMessage(e.error.message);
      }
    }
  }

  function decrementMintAmount() {
    if (mintAmount > 1) {
      setMintAmount(mintAmount - 1);
    }
  }

  function incrementMintAmount() {
    if (mintAmount < mintMax) {
      setMintAmount(mintAmount + 1);
    }
  }

  useEffect(() => {
    async function fetchTotalSupply() {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(
        process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!,
        ABI.abi,
        provider
      );
      const totalSupply = await contract.totalSupply();
      setTotalSupply(totalSupply.toString());

      const saleEnabled = await contract.saleEnabled();
      setIsSaleEnabled(saleEnabled);
      const presaleEnabled = await contract.presaleEnabled();
      setIsPresaleEnabled(presaleEnabled);

      if (saleEnabled && presaleEnabled) {
        const maxMintPerAddress = await contract.maxMintPerAddress();
        setMintMax(maxMintPerAddress);
      } else if (saleEnabled && !presaleEnabled) {
        const maxMintPerTx = await contract.maxMintPerTx();
        setMintMax(maxMintPerTx);
      }
    }
    if (
      active &&
      chainId &&
      chainId.toString() === process.env.NEXT_PUBLIC_NETWORK_ID
    ) {
      fetchTotalSupply();
    } else {
      setTotalSupply('?');
    }
  }, [active, chainId]);

  return (
    <>
      <div className="space-y-4 mt-4">
        <h2 className="text-4xl text-gray-500 mb-4">{isSaleEnabled && !isPresaleEnabled ? ('Minting is Open!') : ('')}</h2>
        <div className={styles.container}>
          <div className="rounded p-8 space-y-4">
            <div className="text-3xl font-bold text-center">
              {totalSupply} / {process.env.NEXT_PUBLIC_MAX_SUPPLY}
            </div>
            <div className="text-center">
              <p className="text-xl">{`${process.env.NEXT_PUBLIC_DISPLAY_COST} ${process.env.NEXT_PUBLIC_CHAIN} per 1 NFT`}</p>
              <p>(excluding gas fees)</p>
            </div>
            <div className="flex justify-center items-center space-x-4">
              <IconContext.Provider value={{ size: '1.5em' }}>
                <button
                  type="button"
                  className={
                    mintAmount === 1 ? 'text-gray-500 cursor-default' : ''
                  }
                  onClick={decrementMintAmount}
                  disabled={false}
                >
                  <FaMinusCircle />
                </button>
                <span className="text-xl">{mintAmount}</span>
                <button
                  type="button"
                  className={
                    mintAmount == mintMax ? 'text-gray-500 cursor-default' : ''
                  }
                  onClick={incrementMintAmount}
                  disabled={false}
                >
                  <FaPlusCircle />
                </button>
              </IconContext.Provider>
            </div>

            <div className="flex justify-center">
              {!active || errMsg ? (
                <button
                  type="button"
                  className={`rounded px-4 py-2 bg-gray-700 font-bold w-40 cursor-not-allowed`}
                  disabled={true}
                  onClick={claimNFTs}
                >
                  Buy
                </button>
              ) : (
                <>
                  {isPending || isMinting ? (
                    <button
                      type="button"
                      className="flex justify-center items-center rounded px-4 py-2 bg-red-700 font-bold w-40 cursor-not-allowed"
                      disabled
                    >
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      {isPending && 'Pending'}
                      {isMinting && 'Minting'}
                      {!isPending && !isMinting && 'Processing'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      className={`rounded px-4 py-2 bg-blue-700 hover:bg-blue-600 font-bold w-40`}
                      onClick={claimNFTs}
                    >
                      Buy
                    </button>
                  )}
                </>
              )}
            </div>

            {message && (
              <div className="text-green-500 text-center">{message}</div>
            )}
            {errMsg && <div className="text-red-500 text-center">{errMsg}</div>}
          </div>
        </div>
      </div>
    </>
  );
}
