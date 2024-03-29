import { useEffect, useState } from 'react';
import { useWeb3React } from '@web3-react/core';
import { ethers } from 'ethers';
import { IconContext } from 'react-icons';
import { FaMinusCircle, FaPlusCircle } from 'react-icons/fa';
import { useContractContext } from '../context/Contract';
import { MerkleTree } from 'merkletreejs';
import ABI from '../contract/abi.json';

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
    if (active && account) {
      setErrMsg(''); //reset error message
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
            '0x8008A26d56cc221199A4E708cFc33e2a700d4fD7',
            '0xe379FA811FF6b6Bc5aE767264BCfFC1758b3d94A',
            '0x7f92B7EEe6004BA83d0bAADB953659c35656Ec98',
            '0x7dE5f242a6191cE1ecf3bD912F40dd7E67e0A7cF',
            '0x621A6777d1d5BF1600164DDc0B53c62354e091B4',
            '0x23998365E554756a870a548a7c20aA9E3650C0B9',
            '0x6b8341856cfE21d8c3db54e4C669D7000153dBeD',
            '0xcAfB2dEC4e2f64ce9dC1AcbE17505AdBA5A21994',
            '0xcEd34e43469829C8daa3F8aeB156dEB9DC112ff8',
            '0x66b9Bb1924E725bBe88ff16432680C627c18dA0C',
            '0x4De76a2D2A4deCFd68566889E63D571173F930e4',
            '0x98f4B5BFD059B1ea8c42A6f966380788dbfc6e9A',
            '0xda720B3e0685a2854B7cC121A11d4A166aF19644',
            '0xB8c2Dd0344C620A1c8606fA5D002A1bC7d564E88',
            '0xf17B61c219F768DfE7EcA6ddD9FC5dA219E4276E',
            '0xa30C623812063005B5f4a2EC3909E96d7111770b',
            '0xbFB3C74D97e5408cEA480060898fBBEE0109D767',
            '0xbf81ef2942c5d6f3d75313803db49b638766b0ac',
            '0x4320a989E33C3D59bAA073D563cF31B033d76aaf',
            '0x1C43F74979167520D83220868ffFb904842224eA',
            '0x4B2C002C1c269354b4163905F2a378d711b1b2a7',
            '0x08dE120Dc0159f3B85eb686E3fcA7541b589eCd0',
            '0xb165D874b5e0aBB35d0f347fD4bC6B94C6c0A58b',
            '0x08a82083B2b399e942b298d2f896E36cBc8649B1',
            '0x0AB55a698E4e5C941FF47b56eab3A8eaF8ec834a',
            '0xAD8b107C2D1581772ac83776e6A1D220ad21d7CE',
            '0x1CA566c7dFCE00Cde01d18E37D6a8eF4e5cBFA2d',
            '0x6c4f112124b77750e7894f9ea26f43dfe868a6f6',
            '0xDd77f9f5fDF4ccAfc273f154DD049832628BEe14',
            '0x99B2ea10314FD13C2985B5E1FDe3fDd7b0FD0bE4',
            '0x86743C350861891C06b11A90062F39E8F581F947',
            '0x5B50AD735b4B70a764861478545AF6e2CE1Aaafe',
            '0xbF4508bC7808F37fb8B7Aa89Fc52f1d581aB09B2',
            '0x8c7f94BE176B598d34194360F5da10475cB84619',
            '0xd10f1011C79e6BBe710E950e430739c65d328315',
            '0x8D75BFDBA1D95036fc1f06f1E777e98864C53B8C',
            '0x91eeAe2307C7544B81bAdfdA53340c4C2c9F82B6',
            '0x5EC93F6A3526A30BFBAffCbD226C0063Fea3A8BD',
            '0x36d7ace36704b3EbAa537839aA9db350DE4051Fb',
            '0x4Cb1C701CE50Cc117d0877F456B6688543FFe7e9',
            '0x2E8C550fE3ef0A5FDccF7421fD341083351e329f',
            '0x50b9E7576E2ee7DbBECb7Afd17458f95456a0967',
            '0xC1eAE831c306667Ea3a65B05f993A6A7048475A2',
            '0x3Db62df95022ee88ce1491E6B438B858d421a422',
            '0xDf4f13cA69072752827fFd528cD736d0537B9191',
            '0x6f9cfacca63145c906fae462433aa1d1f147eec9',
            '0xb1F14F622AcAFB71675ddC0A0055B2b67f0F5Ca7',
            '0xd7963c15A9C987b4885569EE7dE027E9A366604D',
            '0x548456bc5e58809CdF2670e18Ca85436DeE51CFE',
            '0x93d0D3457516f697c3657dEE907AC8e2D0a821AC',
            '0x1DeF992141B8Dba5afB0C63EcA9164C71a9312f9',
            '0x59515B537ce8f32CE271aA3562cEd2D855f2FBD9',
            '0xd4d6D9269b6DF811DA2BAEB92dA15Ca5D7E97C78',
            '0x9b124ccC69809382B1DA566039d8aaAEfb231329',
            '0xCc260F3760736e7B264f3C46dA750AaB9f0d6b39',
            '0x1dFe98B6BA046e0FaCcab8d5367AD64B2A534389',
            '0x4c3CA732DcA1eb35CE3e68005B94103628d687f8',
            '0xae6e9c0615add702e666e8a02eb3d6d4fa40fee4',
            '0x83d0Fae54eD31C298D6bb689187C7005200F454F',
            '0xC6F203ff63eC2b2EA128E684c4ae1453CfABD652',
            '0xc35375BCAaB9525d5633d6c3B6b2aae682E3Cff5',
            '0xa565beF32b788edA669B6e9D6Aa271CB4713147A',
            '0xc3c7374320CF29BF820556fB7c4d576F74B4dd06',
            '0xc73b7F1205c1FA26E443961254F343998DD52CB4',
            '0x3c6fb5a4b94a82Cd1AB272BE7c525863a48fb45D',
            '0x8Deb2811026a7aa707dcAcb93771135aadd20f13',
            '0x529478eD1a121082F4f46B2c7AB2899668f53267',
            '0x4AfAd3b8C7947b6a583331e73d4ceC027c09d89D',
            '0x3A086A1DEFdD5E9a62297abbFa9E91ab3e1CC16d',
            '0xD8fe8a6277838403eFdF88DBbd83ED72A5b77475',
            '0x9e43AdF20819C3043c7c98390cEaF615aDE98dbe',
            '0x43e750CD89d9FC79Ec664468BDA0BedaF852f527',
            '0xE72D7831328e81fb1e30b4aa0Bdf3d3af7Db13AE',
            '0x5bfb6d063491889f02e562652df12e32239553c5',
            '0x23FFE37038b9719A1328e7145d6Ea67c50a9A335',
            '0x51cEC2eEB74bAAda5deB3963a43e3e066bfB3793',
            '0x94648A71ddF556B446Fe3C7f7EC67384B7e6933e',
            '0x8cb3d7BE88f28D12d089F38e0dd5AB725a9f60a4',
            '0x6CBC27e369CAC3dC8e4fF1899F93BBbfd6C01275',
            '0xB811E032d56002dbeDD997101ea8dCaADac21c79',
            '0x86Ae35FE29a43B7d2640a6cE6a98dFC5546B6A77',
            '0xEde46d06a39e7a3B70B1A6492a95E6648c2fd6f5',
            '0x15C51C89d1DF58d6da5ad8b822F47D400BdE5bCc',
            '0xab0f9e8Bbcdf1dB7dA18c18662D7674Aad13eb89',
            '0x2C774B0c9Be2DDD3a4F1e453b84592357dF3c6df',
            '0x30ce34a29364ade4881243a9ba344696825711d3',
            '0xb159171064D61dDa1B9F2D27Ccd15C9FEf7c4780',
            '0x7AC6eE9EB486185a1E4080536C1E884CCb64Eacc',
            '0x1688ABa3A4Eeb825023cdDbA3A54eEEf71cC56B0',
            '0x317f9Ad23c9cA26aa4C9c867E65833d89945599B',
            '0x7c0e56E46889216671b33bE1bb711411E69AD57a',
            '0x8Ab3056507380D39607eA9A0122148d60d708f6c',
            '0x58bcAe299794F50Aa7e607189a8f8cC7330021cC',
            '0x930A0F9F787951c4c2FCfc7C72fBA1Ea0fa0a26A',
            '0x8cf303cf8d16E6289CEB1304417C8A083bD1623b',
            '0x0b19146b4C9Be98A20A9A29BFDf897333Ac7D2ac',
            '0xc847CDA175C70F5166104E572e015fe876aBB77D',
            '0x99A53d5ea2CD4Cacb3fC5dAA8471C551477DA889',
            '0x7F56797d11178f77c8B9c9833D041137a59Aa281',
            '0x23a724F7Dacc80B82CE9f0FDC156bdd6E3B96177',
            '0x0C1130ECaA71aC14B90BA13F2709a3ECEBCd4A25',
            '0x872B3631221C5E3DDAD0A0C8E19D2E6c9a9B3e61',
            '0x67181efFa71A7bD5a3807637dA3cAd2eC8e3DDE6',
            '0xcAD9fac63366596c0301cb1fbc3cA2aB85Cdd11D',
            '0xE1698607C930dC6330C5706827c033e1A810C8cd',
            '0x32ddb5D82104c8E6cba8FA7cAc8e3427bd06f600',
            '0xd137703b328086D260755fa1867A6eF0fe16B956',
            '0x23046D9aa616A390Aab7fAbAFC944A593141a66a',
            '0x4875aa90E25A73081340fA4533E87A547B8D211D',
            '0xA00530915d5b0685b307237Bc7a4feC5ECc88ff8',
            '0xaEbA8cB063bb9e08bDf3a8860BE7BcF9d9D2Ec06',
            '0xe919f7e48372cE22D63dA57e0375D2e00e421D8f',
            '0x6BD0dB0cb440d84A6E3c6C12673ad89dB7f25340',
            '0x997BeBac4194a386247beF93a547e92E53CB708C',
            '0xCF7a7C57eC0c2F904eA9D403A4f2b3f11eA3fcA3',
            '0x6792D9775E01012b1ED88F0c7f04242B671F1B15',
            '0x9BfA48f5cE14D3e1b7609fA486A84a8a7FA56EBd',
            '0xae7894E85D7b15f3f162d6D5efFd785fEE9a2570',
            '0xB6B901AD40d7Ef1cf075AEEa77C9B770193268eE',
            '0x30E2D1De4f837DD45711739025A607afA06F95Cc',
            '0x221fCe6B6dAc61520C1C283825e29Bb556979111',
            '0xd4faB4f5F5DDb5f459b85C48aDA8FBaC238f0Ab6',
            '0xA2347F144fD662dD2F958BAa2daA93f5DB7a03DB',
            '0xE1b938C5ca8F0D4003B03195d60c7C65c3603cB4',
            '0x4E8b4B5d073D50Ee96267971383201014c20F69B',
            '0xfB4D71d6228297803dCd2768E4B4D128735b545A',
            '0x1d4e3de9A44E001F0138Fd024FC5d2619d63c59B',
            '0x373cD5AC87e472DdBC2A044Fb9e20D9fA36a5fDD',
            '0x5CA4E77E6e75E110677B5b44a59c7479bb6ac60c',
            '0x95202f379Ec0282C280B1B82e48BfB05cace2e7c',
            '0x967604E4B0CA0A9F5F26728e0cECcca52fb173F7',
            '0xFFb7e7708A7Cd4aD95FE1596A87Cb323cEDC2bCe',
            '0xD96A41aF259755AebBD7D13afEF763DFE8197E04',
            '0x47D75dA4b155cc266127F5801c15f37C29D1e40a',
            '0xd4bA3a70Cf7854480729D84dCD9B993E3Cd29eF4',
            '0xffa3FF2574B3E3D819f55EC171f10B4F12F84a4b',
            '0xd34dd51aa26e5c7aa398e56d93d19ed9673a1595',
            '0xBb599f8A4914dC9976bADfc70A9dc8863ca9B462',
            '0xCfefd46F038DCBBFa23C4FF7cfc93125C99bF56C',
            '0xAEEE33f012058D3185296998898Dfb2cF8F54355',
            '0x0Ff75354B403bEaee5122a9bCa41E82d1aFB5171',
            '0x0A7Dd6591271b5dd1E73Ccf5aF6895B6A370D297',
            '0x724db95dd314601704cb4d9817961677ea12274a',
            '0x1b4b84873E4f2c7e40935B2DB2AEFFe7016Ffd73',
            '0x4cFDe2B56c0247A88427C0eb534160f21E1206E1',
            '0x24e717381B90a0eACD9f2CFE9cEe20dA6FCA94a7',
            '0x849Ec139Ff4A91ADF59d2e8c1b620dF35775f3EB',
            '0xefe21d7730E9183Fb1AdBb8CF226B30e6FCc8407',
            '0x7656A2139D2181Aa185c0a22432ca6Abf028081c',
            '0x4526EFA71074e28E90a5eafe9d9D3951137dcF80',
            '0xf5052758A1b77D7F1F701BF5d4173188C4dbf011',
            '0xBA1583bB2254517a328AD25ae7B2Aa38dBDe805C',
            '0xBddB33881fD5Aa1219d4d0a7d8112233b9F3146e',
            '0x1A888Fc4A0201Bc13216D027f6BdF6BEABb820F5',
            '0xB964357ff792CD956Ed3BAe3C265420243b33692',
            '0x2B41DC248fce624B4420cFBf1eefF65D4E991aFB',
            '0x3d437f5A332C2Cd2f5a0525cABF55E5617064AE4',
            '0x6223a7C6ba9036e7f574371aE50A2a7620aA1c0b',
            '0x79D8b24b80D09B79F8f4ab2b095DEEA4971630CA',
            '0xAc32E11C191769f495a1c44f64A6F499F3926861',
            '0xE3862E7b95474aE5Cb5D9E3Da164D1feA6378D75',
            '0xc29d7FE198328A424B2113c91bcAA843D10e2c3c',
            '0xf5694B304f33BC5b30841446F897F07aC0612AAD',
            '0xa412Ce3c616E600D389eCB0a3cfB042137b47703',
            '0x57b8cdBcc80f5aEc46Df3dD2a195F23978F1D0c6',
            '0x04acC635306B967e2dCD82c8a517a6B652973047',
            '0x8a5ad51A8F515597fd7818bA19A8414e14e07FFD',
            '0x26303a4Cad202a7f9712f7d4c2a7FcC400968670',
            '0x54D7Da42a50F22d4f95033C2043b124a2532cC37',
            '0x0B8571caA92fF219dbD60480d5a736dE3280e034',
            '0x45117082A37FD92C5ee590861a06b33DE51F7F9B',
            '0xB56FAb346eb7ecfD2D6543f963E4Bd0b9C349e39',
            '0x5012067c1847563d544fbdF3f1cCA6b5aF6080C1',
            '0x893AB4A578848d53E7D6Df44B10e4eb201994729',
            '0x61Ec257a795Db2D40DbE7AD6dFcEe168c3D7a064',
            '0xf606507aE2E57C1c9CD67a0Afd2674160b5f3547',
            '0x580583250a283B1cC4BE6a310dD5355f7cB50758',
            '0x08cf93A702cfF204C027497c0a40c67BfAcbE496',
            '0x3162517327248EbcD4b751c0b6e8a55717071939',
            '0x8f0D48A3e0b5E5F441c6f00edeF7DC10a8E62dBF',
            '0x9934a872EAAc95605167EDC824A0ce906E42f5D5',
            '0x36b7259a40eb2efe6b6e77f74351f51bf587260e',
            '0xD358b2131c5da0071612eFb171bbA94bf22c559b',
            '0x2b28C654b8b36935aF0668Cfbf074ed9af919a99',
            '0xCd605A63542017821b30874768F5aAaB7132D97D',
            '0xb4f2CE3BD9afb8E4D08901840F025d679240F86b',
            '0x1Ac268D3041892dfEFA6D7A5baf67F955607C5Ad',
            '0x5069898DCcC04F380Ff7143e37705435Bd4bFf39',
            '0x69F34C600f58e833688c595929ddA89A859e9863',
            '0xB90778D56Ad6A6912CbECf95cA4C88917B8C01A8',
            '0x20393Dec3a87591B51f5bffDfea68E50690D1a2A',
            '0xaD77D5241450088BF6760B068C9a43424087fd40',
            '0xFFa53Bd01969948dddD43d65C97B8a9952296c66',
            '0x571b8db726C2A29d237F88C9EFeB896290bF395b',
            '0x472f9046A4B0a04a999D04947329B8b7d5c9093d',
            '0x7733A8945AFD4Ac21262d60E23f8cAb30dbC20B4',
            '0x79D8b24b80D09B79F8f4ab2b095DEEA4971630CA',
            '0x8A3922d36aF4E68c21Ef532C19277dCfAE2bde3f',
            '0xd30b14dacd75447118a19ff8421fc677995c73f3',
            '0x3b6A110f04016E2E9F0836dBC046aca9aA91d05A',
            '0xE4001DA7579eD2b6F774093Ea6649BCc1b1610E1',
            '0x937f113CEd2031B8054a57Db4240508b451611eB',
            '0x33Cf3A4Fe0AeDfE3A85C2845395A438baba7702e',
            '0x5D81E74DA08923819ceD2efF6490A9D892CBddD6',
            '0x0D7ed3ff76dd70805b1624E1AA6470c52F3E7DcE',
            '0xD9a16AEa04679aA10159eB7e15394E404Cd46665',
            '0xcAF896b3E2e3e835aba5E05c66720EfEb019AFeE',
            '0x888e62670Fbfb5898a3C21c82493504f0F26b0CC',
            '0x7Cd868D186b4bde70AE2694238fB4217b3077e5A',
            '0xd14b91331d1Ec4c43bcDEB1EdCDa6975A8c3b3B6',
            '0xF73c39E4234011af9c5BB5B91B97A6660C66aE26',
            '0x1aAA801Ce12e021e84b3a703AB392188Ea9a5b71',
            '0x28d1cA2c03BD555fa16C2Fc8E4EF33fbCC39B488',
            '0x31d396fD9C139E4D9aa1328527A547c985fB98d8',
            '0x45e199379F7f72f99093D7159783F6825B98019a',
            '0xC0a8f8Cb4A352De64d4215dDBD5827CFa1563c05',
            '0xCe4ffe9b46326b559E6452116d983BC7b6441A8f',
            '0x052D14F651D956885Aba75B38fa7597D0FBe64eF',
            '0x61E8bb9a3d03E12CeaFF58B2bdF934Def2Be5cF3',
            '0xaF3bf14B17900f02E0188F50f675CfDde4ed8776',
            '0x4A69b57a5d680618Da77fE2C0453dcE40e1590F1',
            '0x91dF5104e197FF0A9AB256EDA6a68436361f51Fc',
            '0x5e4349Ee822843E36ADBEbedC3A8ea8b438Fa1cd',
            '0x453395F6F90323D74c55cD74375aD8dBD9fCa51D',
            '0x87C2508A75995eFB156C35673F33A8FCc1975fa5',
            '0x5465c2280E703cEfcc16F8E07eb521Aac9A19A22'
          ]
          let merkleTree = new MerkleTree(list, keccak256, { hashLeaves: true, sortPairs: true });
          const hashedAddress = keccak256(account);
          proof = merkleTree.getHexProof(hashedAddress);
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
        fetchTotalSupply();
      } catch (error) {
        setIsPending(false);
        let e = error as ErrorEthers;
        if (e.error === undefined) {
          setErrMsg(getErrorMessage(error));
        } else {
          setErrMsg(e.error.message.replace('execution reverted: ', ''));
        }
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

  useEffect(() => {
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
      <div className="space-y-4 mt-4 bg-white opacity-20 backdrop-blur-sm"></div>
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
          {!active ? (
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
          <div className="text-slate-600 text-center">{message}</div>
        )}
      </div>
    </>
  );
}
