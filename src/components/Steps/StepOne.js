import React, { useEffect, useState } from "react";
import { ethers } from 'ethers';
import TokenABI from '../ABI/TokenABI.json'
import ErrorMessage from '../ErrorMessage'

const StepOne = ({
    defaultAccount, provider,
    stakingTokenValue, rewardTokenValue, startTimeValue, endTimeValue, rewardPerBlockValue,
    setErrorText, onSubmit
}) => {

    const [stakingToken, setStakingToken] = useState(stakingTokenValue)
    const [rewardToken, setRewardToken] = useState(rewardTokenValue)
    const [startTime, setStartTime] = useState(startTimeValue);
    const [endTime, setEndTime] = useState(endTimeValue);
    const [rewardPerBlock, setRewardPerBlock] = useState(rewardPerBlockValue)

    const [stakingName, setStakingName] = useState(null)
    const [rewardName, setRewardName] = useState(null)
    const [rewardTokenBalance, setRewardTokenBalance] = useState(0);

    useEffect(() => {
        const loadToken = async () => {
            if (stakingTokenValue !== null) {
                let { success, nameSymbol } = await getName(stakingToken);
                if (!success) return;
                setStakingName(nameSymbol)
            }

            if (rewardTokenValue !== null) {
                let { success, nameSymbol } = await getName(rewardToken);
                if (!success) return;
                setRewardName(nameSymbol)
                getBalance(rewardToken)
            }
        }
        loadToken()
    }, [stakingTokenValue, rewardTokenValue])

    const getName = async (value) => {
        if (value.length == 42) {
            let tempTokenContract = new ethers.Contract(value, TokenABI, provider)
            let name = await tempTokenContract.name();
            let symbol = await tempTokenContract.symbol();
            return { success: true, nameSymbol: `${name}/${symbol}` };
        }
        return { success: false };
    }

    const getBalance = async (value) => {
        if (value.length == 42) {
            let tempTokenContract = new ethers.Contract(value, TokenABI, provider)
            let balance = await tempTokenContract.balanceOf(defaultAccount);
            let decimals = await tempTokenContract.decimals();
            let realBalance = convertBalance(balance, decimals)
            setRewardTokenBalance(realBalance)
        }
    }

    const convertTime = (value) => {
        const datetime = new Date(value);
        const timestamp = datetime.getTime();
        return timestamp;
    }

    const convertBackTime = (value) => {
        const date = new Date(value);
        const year = date.getFullYear().toString().padStart(4, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const hour = date.getHours().toString().padStart(2, '0');
        const minute = date.getMinutes().toString().padStart(2, '0');
        const datetimeLocalString = `${year}-${month}-${day}T${hour}:${minute}`;
        return datetimeLocalString;
    }

    const isAddress = async (string, address) => {
        if (ethers.utils.isAddress(address)) {
            console.log(`${string} : ${address} is an address`);
            return true
        } else {
            alert(`${string} : ${address} is not an address`);
            return false
        }
    }

    function convertBalance(balance, decimals) {
        return ethers.utils.formatUnits(balance.toString(), decimals);
    }


    const datas = [
        {
            title: "Staking Token",
            placeHolder: "The token going to be staked",
            type: 'text',
            function: async (e) => {
                setStakingToken(e.target.value)
                let { success, nameSymbol } = await getName(e.target.value);
                if (!success) return;
                setStakingName(nameSymbol)
            },
            value: stakingToken,
            name: stakingName,
        },
        {
            title: "Reward Token",
            placeHolder: "The token benefits from staking",
            type: 'text',
            function: async (e) => {
                setRewardToken(e.target.value)
                let { success, nameSymbol } = await getName(e.target.value);
                if (!success) return;
                setRewardName(nameSymbol)
                getBalance(e.target.value)
            },
            value: rewardToken,
            name: rewardName,
        },
        {
            title: "Start Time",
            placeHolder: "The start time of your staking pool",
            type: 'datetime-local',
            function: (e) => setStartTime(convertTime(e.target.value)),
            value: convertBackTime(startTime),
        },
        {
            title: "End Time",
            placeHolder: "The end time of your staking pool",
            type: 'datetime-local',
            function: (e) => setEndTime(convertTime(e.target.value)),
            value: convertBackTime(endTime),
        },
        {
            title: "Reward Per Second",
            placeHolder: "Tokens the rewards in a second",
            type: 'number',
            function: (e) => setRewardPerBlock(e.target.value),
            value: rewardPerBlock,
            balance: rewardTokenBalance,
        },
    ]

    const handleStepOneSubmit = async (stakingToken, rewardToken, startTime, endTime, rewardPerBlock) => {

        //  檢查是否都有值
        const fields = [
            { value: stakingToken, name: "staking token" },
            { value: rewardToken, name: "reward token" },
            { value: startTime, name: "start time" },
            { value: endTime, name: "end time" },
            { value: rewardPerBlock, name: "reward per second" },
        ];

        for (const field of fields) {
            if (!field.value) {
                setErrorText(`The ${field.name} is missing, please fill it in.`);
                return;
            }
        }

        //  檢查合約是否都為地址
        const stakingString = "Staking Token "
        const rewardString = "Reward Token "

        let result1 = await isAddress(stakingString, stakingToken);
        if (result1 == false) return;

        let result2 = await isAddress(rewardString, rewardToken)
        if (result2 == false) return;

        //  不可質押自己 獎勵自己
        if (rewardToken == stakingToken) {
            setErrorText("Reward Token Cannot Be The Same As Staking Token")
            return;
        }

        //  時間規則：
        //  1.  結束時間需在開始時間後
        //  2.  結束時間需在現在時間後
        if (endTime <= startTime) {
            setErrorText("Time Error, The End Time should be set after the Start Time")
            return;
        }
        const now = new Date().getTime();
        console.log(now)
        if (endTime <= now) {
            setErrorText("Time Error, The End Time should be set after now")
            return;
        }

        onSubmit(stakingToken, rewardToken, startTime, endTime, rewardPerBlock)
    }

    return (
        <section>
            <div className="row">
                {
                    datas.map((data, index) => {
                        return (
                            <div
                                key={index}
                                className="col-lg-6 mb-2"
                            >
                                <div className="form-group mb-3">
                                    <label className="text-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        {data.title}
                                        {
                                            data.name !== null && data.name !== undefined &&
                                            <span style={{ paddingRight: '10px' }}>{" " + data.name}</span>
                                        }
                                    </label>
                                    <input
                                        type={data.type}
                                        name="firstName"
                                        className="form-control"
                                        placeholder={data.placeHolder}
                                        required
                                        // autoComplete="off"
                                        onChange={data.function}
                                        defaultValue={data.value}
                                    />
                                    {
                                        data.balance !== 0 && data.balance !== undefined &&
                                        <div><label> Reward Token Balance : {data.balance}</label><br /></div>
                                    }
                                    {
                                        data.balance !== 0 && data.balance !== undefined &&
                                        startTime !== null && endTime !== null && endTime > startTime &&
                                        <label>
                                            {rewardPerBlock * (endTime - startTime) / 1000 > data.balance
                                                ? "Not Enough Token"
                                                : "Required Amount : " + rewardPerBlock * (endTime - startTime) / 1000}
                                        </label>
                                    }
                                </div>
                            </div>
                        )
                    })
                }
            </div>

            <div className="text-end toolbar toolbar-bottom p-2">
                <button className="btn btn-primary sw-btn-next" onClick={() => handleStepOneSubmit(stakingToken, rewardToken, startTime, endTime, rewardPerBlock)}>Next</button>
            </div>
        </section>
    );
};

export default StepOne;
