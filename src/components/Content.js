import React, { useEffect, useState } from 'react'
import { ethers } from 'ethers';
import kitchenABI from './ABI/KitchABI.json'
import StepOne from './Steps/StepOne';
import Wizard from './Steps/Wizard';
const kitchenAddress = '0xbCD053a38bC2d6d004C4De44CC0b3614a1AbDADC'

const Content = ({ defaultAccount }) => {

    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);
    const [kitchenContract, setKitchenContract] = useState(null);

    const [contract, setContract] = useState(null);
    const [contractAddress, setContractAddress] = useState(null);

    const [stakingToken, setStakingToken] = useState(null)
    const [rewardToken, setRewardToken] = useState(null)
    const [startTime, setStartTime] = useState(null);
    const [endTime, setEndTime] = useState(null);

    const updateEthers = async () => {
        try {
            let tempProvider = new ethers.providers.Web3Provider(window.ethereum);
            setProvider(tempProvider);

            let tempSigner = tempProvider.getSigner();
            setSigner(tempSigner);

            let tempKitchenContract = new ethers.Contract(kitchenAddress, kitchenABI, tempSigner)
            setKitchenContract(tempKitchenContract);
        } catch {

        }
    }

    useEffect(() => {
        if (contractAddress == null) {
            updateEthers()
            return
        }

    }, [defaultAccount])

    const generateSalt = () => {
        let randomNumber = Math.floor(Math.random() * Math.pow(10, 15)) + 1;
        return randomNumber;
    }

    const deployMyKitchen = async () => {
        let salt = generateSalt();
        console.log(salt)
        const deployFee = ethers.utils.parseEther("0.03")

        let result = await kitchenContract.deploy(salt)
        //     , {
        //     value: deployFee
        // });

        console.log(result);
    }

    const titleStyle = {
        color: 'lightgray',
    }

    const cardStyle = {
        backgroundColor: 'white',
        padding: '10px 20px',
        borderRadius: '20px',
        margin: '5px',
        maxWidth: '85vw',
    }

    const card2Style = {
        ...cardStyle,
        flex: '2',
    }
    const card1Style = {
        ...cardStyle,
        flex: '1'
    }

    const sameLineStyle = {
        display: 'flex', justifyContent: 'space-between'
    }

    const inputStyle = {
        width: '80vw',
        height: '20px',
        borderRadius: '10px',
        paddingLeft: '20px'
    }

    const kitchenParam = [
        {
            title: "Staking Token",
            placeHolder: "The token going to be staked",
            type: 'text',
            function: (e) => setStakingToken(e.target.value),
        },
        {
            title: "Reward Token",
            placeHolder: "The token benefits from staking",
            type: 'text',
            function: (e) => setRewardToken(e.target.value),
        },
        {
            title: "Start Time",
            placeHolder: "The start time of your staking pool",
            type: 'datetime-local',
            function: (e) => setStartTime(convertTime(e.target.value))
            
        },
        {
            title: "End Time",
            placeHolder: "The end time of your staking pool",
            type: 'datetime-local',
            function: (e) => setEndTime(convertTime(e.target.value))
        },
    ]

    const convertTime = (value) => {
        const datetime = new Date(value);
        const timestamp = datetime.getTime();
        return timestamp;
    }

    const checkParams = () => {
        console.log(
            `
            Staking : ${stakingToken}
            Reward : ${rewardToken}
            Start : ${startTime}
            End : ${endTime}
            `
        )
    }

    return (
        <div className="content" style={{
            padding: '2vh 2vw',
        }}>
            <Wizard />
        </div>
    )
}

export default Content
