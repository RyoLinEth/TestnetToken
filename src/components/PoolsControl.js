import React from 'react'
import { useState } from 'react'
import { useEffect } from 'react'
import poolABI from './ABI/PoolABI.json'
import tokenABI from './ABI/TokenABI.json'
import { ethers } from 'ethers'
import swal from 'sweetalert'

const PoolsControl = ({ defaultAccount }) => {
    //  這個位置是 Pool合約 的地址 (不是Pool工廠)
    //  所以正常是要傳一個值進來 然後把那個值當作是 poolContractAddress
    //  此處僅為範例
    const poolContractAddress = "0xEDdB0aa79bab1ea88035c760A8D16e5A8a95b709"
    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null)
    const [poolContract, setPoolContract] = useState(null)
    const [rewardToken, setRewardToken] = useState(null);
    const [rewardTokenContract, setRewardTokenContract] = useState(null);
    const [rewardDecimals, setRewardDecimals] = useState(null);

    const [rewardPerBlock, setRewardPerBlock] = useState(null);

    const restartTransaction = async (startBlock, endBlock) => {
        if (endBlock <= startBlock) return swal('Error', "Start Block Should Be Less Than End Block", 'error')

        //  需要的數量
        const neededAmount = (endBlock - startBlock) * rewardPerBlock

        //  需要的數量 (考慮精度)
        const neededWithDecimal = ethers.utils.parseUnits(`${neededAmount}`, rewardDecimals);

        try {
            //  模擬一次交易
            const restartResult = await poolContract.restart(startBlock, endBlock,
                {
                    value: ethers.utils.parseUnits("0.1", "ether")
                })
            console.log(restartResult)
        } catch (err) {
            if (err.reason !== undefined) {
                //  如果模擬交易的結果 Pool 還沒結束, Return
                const warnMessage = "execution reverted: The Pool Is Not Ended, Cannot Restart!!"
                if (err.reason === warnMessage) {
                    swal('Error', `${err.reason}`, 'error')
                    return
                }
                else {
                    //  如果池子結束了
                    //  1.  如果之前授權過，則前面應該可正常執行 不會到這
                    //  2.  如果之前沒授權過 或是授權量不足，此時開始授權
                    const result = await rewardTokenContract.approve(poolContractAddress, neededWithDecimal);

                    //  監聽授權結果
                    provider
                        .getTransaction(result.hash)
                        .then((tx) => {
                            // 監聽交易上鍊事件
                            tx.wait().then(async (receipt) => {
                                //  授權成功
                                console.log(`交易已上鍊，區塊高度為 ${receipt.blockNumber}`)
                                try {
                                    //  進行Restart 操作
                                    const restartResult = await poolContract.restart(startBlock, endBlock,
                                        {
                                            value: ethers.utils.parseUnits("0.1", "ether")
                                        })
                                    console.log(restartResult)
                                } catch (err) {
                                    if (err.reason !== undefined) swal('Error', `${err.reason}`, 'error')
                                    else swal('Error', `${err.message}`, 'error')
                                }
                            })
                        })
                }
            }
            else {
                //  如果是其他的錯誤 看看是啥錯誤
                console.log("ERROR 2")
                swal('Error', `${err.message}`, 'error')
            }
        }
    }

    const buttons = [
        {
            text: "Restart",
            description: "Restart After The Pool End. With 0.1 BNB, When Restart, The Reward Token Replenish Is Also Needed",
            inputAmount: 2,
            inputNames: [
                "New Start Block",
                "New End Block",
            ],
            function: async (value1, value2) =>
                await restartTransaction(value1, value2)
        },
        {
            text: "Set Fees",
            description: "Set Fees If Needed",
            inputAmount: 4,
            inputNames: [
                "Deposit Fee To Wallet (%)",
                "Deposit Fee To Burn (%)",
                "Withdraw Fee To Wallet (%)",
                "Withdraw Fee To Burn (%)",
            ],
            function: async (v1, v2, v3, v4) => {
                await poolContract.setFees(
                    (v1 * 100).toFixed(0),
                    (v2 * 100).toFixed(0),
                    (v3 * 100).toFixed(0),
                    (v4 * 100).toFixed(0)
                )
            }
        },
        {
            text: "Update Reward Per Block",
            description: "Before The Start Of The Pool. You Can Change The Reward Per Block If Needed",
            inputAmount: 1,
            inputNames: [
                "New Reward Per Block",
            ],
            function: async (value) => await poolContract.updateRewardPerBlock(value)
        },
    ]

    const [inputValues, setInputValues] = useState(buttons.map(button => new Array(button.inputAmount).fill("")));



    const initContract = async () => {
        try {
            const tempProvider = new ethers.providers.Web3Provider(window.ethereum)
            setProvider(tempProvider)

            const tempSigner = tempProvider.getSigner()
            setSigner(tempSigner)

            const tempPoolContract = new ethers.Contract(poolContractAddress, poolABI, tempSigner)
            setPoolContract(tempPoolContract)

            const tempRewardToken = await tempPoolContract.rewardToken();
            setRewardToken(tempRewardToken);

            const tempRewardTokenContract = new ethers.Contract(tempRewardToken, tokenABI, tempSigner);
            setRewardTokenContract(tempRewardTokenContract);

            const tempRewardDecimals = await tempRewardTokenContract.decimals();
            setRewardDecimals(tempRewardDecimals);

            const tempRewardPerBlock = await tempPoolContract.rewardPerBlock();
            const realRewardPerBlock = ethers.utils.formatUnits(tempRewardPerBlock, tempRewardDecimals);
            setRewardPerBlock(realRewardPerBlock);

        } catch (error) {
            console.log(error)
        }
    }


    const handleFunction = async (func, index) => {
        const result = await func(...inputValues[index]);
        // do something with the result
    }

    const handleInputChange = (e, i, index) => {
        const newValues = [...inputValues];
        newValues[index][i] = e.target.value;
        setInputValues(newValues);
    }


    useEffect(() => {
        if (defaultAccount) {
            initContract()
        }
    }, [defaultAccount])
    return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: 'center', flexDirection: "column", marginTop: '5vh  ' }}>
            <h1>
                Pool Control Panel
            </h1>

            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                {buttons.map((button, index) => {
                    return (
                        <div key={button.text}
                            style={{
                                border: '1px solid black',
                                margin: '10px',
                                padding: '10px',
                                margin: '10px',
                                width: '90vw',
                                maxWidth: '400px',
                            }}>
                            <h3>
                                {index + 1}. {button.text}
                            </h3>
                            <hr />
                            <p
                                style={{
                                    paddingLeft: '20px',
                                    wordBreak: 'break-word',
                                }}
                            >{button.description}</p>
                            <hr />

                            {button.inputAmount &&
                                Array.from({ length: button.inputAmount }).map((_, i) => (

                                    <div style={{
                                        display: 'flex',
                                        flexDirection: 'row',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        marginTop: '10px',
                                        marginBottom: '10px',
                                    }}>
                                        {button.inputNames[i]}
                                        <input
                                            key={i}
                                            defaultValue={0}
                                            onChange={(e) => handleInputChange(e, i, index)}
                                            style={{
                                                // marginLeft: '10px',
                                                borderRadius: '5px',
                                                margin: '10px',
                                                width: '150px'
                                            }}
                                        />
                                    </div>
                                ))}
                            <button onClick={() => handleFunction(button.function, index)}>
                                {button.text}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div >
    )
}

export default PoolsControl
