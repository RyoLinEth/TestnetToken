import React, { Fragment, useState, useEffect } from "react";
//import Multistep from "react-multistep";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.min.js';
import { ethers } from 'ethers'
import tokenABI from './ABI/TokenABI2.json'

const StakingTokenAddress = "0x2BDF6DDbfEc9781aAbee00D7e028D3efcCaD473d"
const RewardTokenAddress = "0x9fb6CbC7e1651237Bc1BD22c2F96BDa6D762673a"
const TokenFaucet = (props) => {
    const { defaultAccount } = props

    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);
    const [stakingTokenContract, setStakingTokenContract] = useState(null);
    const [rewardTokenContract, setRewardTokenContract] = useState(null);

    const updateEthers = async () => {
        try {
            let tempProvider = new ethers.providers.Web3Provider(window.ethereum);
            setProvider(tempProvider);

            let tempSigner = tempProvider.getSigner();
            setSigner(tempSigner);

            let tempContract = new ethers.Contract(StakingTokenAddress, tokenABI, tempSigner)
            setStakingTokenContract(tempContract);

            let tempRewardContract = new ethers.Contract(RewardTokenAddress, tokenABI, tempSigner)
            setRewardTokenContract(tempRewardContract);
        } catch {

        }
    }

    const actions = ["staking", "reward"];

    const mint = async (value) => {
        if (value == actions[0])
            await stakingTokenContract.mint();
        if (value == actions[1])
            await rewardTokenContract.mint();
    }

    useEffect(() => {
        updateEthers()
    }, [defaultAccount])

    return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: 'center', flexDirection: "column", marginTop:'5vh  '}}>
            
            <h3>點擊一次 獲得代幣 10000000個</h3>
            <h4 style={{fontWeight:'bold'}}>本代幣僅用於 Bsc 測試網路</h4>

            <button
                className="btn btn-primary"
                style={{ marginTop: '50px' }}
                onClick={() => mint(actions[0])}
            >
                Claim Staking Token
            </button>
            <span style={{ wordBreak: 'break-word', padding: '20px' }}>
                CA : {StakingTokenAddress}
            </span>


            <button
                className="btn btn-primary"
                style={{ marginTop: '50px' }}
                onClick={() => mint(actions[1])}
            >
                Claim Reward Token
            </button>
            <span style={{ wordBreak: 'break-word', padding: '20px' }}>
                CA : {RewardTokenAddress}
            </span>
        </div>
    )
}

export default TokenFaucet
