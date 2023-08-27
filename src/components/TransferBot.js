import React, { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import CopyToClipboard from 'react-copy-to-clipboard'
import swal from 'sweetalert'

const provider = 'https://data-seed-prebsc-1-s1.binance.org:8545'
const provider2 = 'https://data-seed-prebsc-1-s2.binance.org:8545'
const provider3 = 'https://data-seed-prebsc-1-s3.binance.org:8545'

const GetHex = () => {

    const transferABI = [
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "account",
                    "type": "address"
                }
            ],
            "name": "balanceOf",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "recipient",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "amount",
                    "type": "uint256"
                }
            ],
            "name": "transfer",
            "outputs": [
                {
                    "internalType": "bool",
                    "name": "",
                    "type": "bool"
                }
            ],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "decimals",
            "outputs": [
                {
                    "internalType": "uint8",
                    "name": "",
                    "type": "uint8"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        }
    ]

    const [rpcProvider, setRpcProvider] = useState(
        new ethers.providers.JsonRpcProvider(provider)
    )

    const [addressList, setAddressList] = useState([]);

    //設定錢包
    const [walletBalance, setWalletBalance] = useState(null);
    const [signer, setSigner] = useState(null);
    const [functionName, setFunctionName] = useState(null);

    //  連結合約
    const [contractAddress, setContractAddress] = useState(null);
    const [contract, setContract] = useState(null);
    const [returnedValue, setReturnedValue] = useState(null);

    const [tokenBalance, setTokenBalance] = useState(null);
    const [tokenDecimal, setTokenDecimal] = useState(null);

    //複製
    const [copied, setCopied] = useState(false);

    const [record, setRecord] = useState([])

    useEffect(() => {
        if (signer !== null)
            handleSignerChange()
    }, [signer])

    useEffect(() => {
        const tempSignerList = localStorage.getItem('signerList');
        if (tempSignerList !== null) {
            const myObjectArray = JSON.parse(tempSignerList);
            setAddressList(myObjectArray);
        }
    }, [])

    const buttonStyle = {
        maxWidth: '120px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    }

    const rpcList = [
        provider,
        provider2,
        provider3,
    ]

    const getCurrentTime = () => {
        return new Date().toLocaleString();
    }
    const buttons = [
        {
            text: "Set Contract Address",
            description: "輸入代幣合約之地址",
            inputAmount: 1,
            inputNames: [
                "Contract Address"
            ],
            function: async (value1) => setData(value1),
            returnValue:
                <span>
                    代幣餘額 : {tokenBalance}
                </span>,
            judgement:
                tokenBalance !== null ? true : false
        },
        {
            text: "Transfer token",
            description: "輸入接收地址及數量",
            inputAmount: 2,
            inputNames: [
                "Receive Address",
                "Transfer Amount"
            ],
            function: async (recipient, amount) => await sendTransaction(
                recipient, amount
            ),
            returnValue:
                <span>
                    Returned Hash:
                    {
                        returnedValue !== null &&
                        <a href={`https://testnet.bscscan.com/tx/${returnedValue}`}>
                            {returnedValue.slice(0, 4)}...{returnedValue.slice(-4)}
                        </a>
                    }
                </span>,
            judgement:
                returnedValue !== null ? true : false
        },
    ]

    const sendTransaction = async (recipient, amount) => {
        console.log("Sending Transaction...")
        const gasPrice = ethers.utils.parseUnits("10", "9") //10 Gwei;
        console.log(...inputValues[1])
        console.log(tokenDecimal);
        try {
            const result = await contract.transfer(
                inputValues[1][0],
                ethers.utils.parseUnits(inputValues[1][1], tokenDecimal),
                {
                    gasPrice: gasPrice
                }
            )
            console.log(result)
            console.log(typeof result);
            setReturnedValue(result.hash);
            await listenToTransaction(result.hash, getBalanceAndTokenBalance);
        } catch (err) {
            if (err.error !== undefined) {
                const errorReply =
                    `${getCurrentTime()} 出現錯誤 : ${err.error.reason}`
                setTimeout(() =>
                    setRecord([...record, errorReply]), 100)
            } else {
                const errorReply =
                    `${getCurrentTime()} 出現錯誤 : ${err.reason}`
                setTimeout(() =>
                    setRecord([...record, errorReply]), 100)
            }
            console.log("Error" + err)
        }
    }


    const [inputValues, setInputValues] = useState(
        buttons.map(button => new Array(button.inputAmount).fill(""))
    );

    useEffect(() => {
        console.log("Contract Changed Successfully");
        if (contractAddress !== null)
            getBalanceAndTokenBalance();
    }, [contract])

    const setData = async (value1) => {
        try {
            setContractAddress(value1);
            const tempContract = new ethers.Contract(
                value1, transferABI, signer
            );
            console.log(tempContract)

            setContract(tempContract);
        } catch (err) {
            console.log(err)
        }
        //  這是合約的 全部 Function(包含Constructor)
    }

    const handleFunction = async (func, index) => {
        console.log("Handling Function");
        console.log(func, index)
        console.log(...inputValues[index])
        try {
            const result = await func(...inputValues[index]);
            console.log(result)
        } catch (err) {
            console.log(err)
        }
        // do something with the result
    }

    const handleInputChange = (e, i, index) => {
        const newValues = [...inputValues];
        newValues[index][i] = e.target.value;
        setInputValues(newValues);
    }

    const removeWallet = () => {
        setSigner(null)
        localStorage.removeItem('signerList')
    }

    const getBalanceAndTokenBalance = async () => {
        // 重新獲取餘額操作
        const balance = await rpcProvider.getBalance(signer.address)
        const realBalance = ethers.utils.formatEther(balance);
        setWalletBalance(realBalance);


        const tempTokenBalance = await contract.balanceOf(signer.address);
        const tempTokenDecimal = await contract.decimals();

        const realTokenBalance = ethers.utils.formatUnits(tempTokenBalance, tempTokenDecimal);
        console.log(realTokenBalance)
        setTokenDecimal(tempTokenDecimal);
        setTokenBalance(realTokenBalance);
    }

    const listenToTransaction = async (hash, afterHash) => {
        rpcProvider
            .getTransaction(hash)
            .then((tx) => {
                // 監聽交易上鍊事件
                tx.wait().then(async (receipt) => {
                    //  授權成功
                    console.log(`交易已上鍊，區塊高度為 ${receipt.blockNumber}`)
                    try {
                        await afterHash()
                    } catch (err) {
                        if (err.reason !== undefined) swal('Error', `${err.reason}`, 'error')
                        else swal('Error', `${err.message}`, 'error')
                    }
                })
            })
    }

    const handleSignerChange = async (value) => {
        //  查詢錢包餘額
        //  此時為bigNum
        const balance = await rpcProvider.getBalance(signer.address)
        const realBalance = ethers.utils.formatEther(balance);
        setWalletBalance(realBalance);
        //  設定新合約對象 
        try {
            const tempContract = new ethers.Contract(
                contractAddress, transferABI, signer
            )

            setContract(tempContract);
        } catch (err) {
            console.log(err)
        }
    }

    const handlePrivateKey = async (value) => {
        //  設定錢包
        const wallet = new ethers.Wallet(value)
        const tempSigner = wallet.connect(rpcProvider);
        console.log(tempSigner)
        console.log(tempSigner.signer)
        const replacer = (key, value) => {
            if (typeof value === 'function') {
                // 將函數轉換為特定的標記
                return value.toString();
            }
            return value; // 其他值保持不變
        };


        const myTempSignerJson = JSON.stringify(tempSigner, replacer)
        console.log(myTempSignerJson)
        setSigner(tempSigner)

        //  查看 當前signer的地址 是否已經在array中
        const isObjectInArray = addressList.some(
            item => item.address === tempSigner.address
        );

        //  如果不在array中 加入array
        if (!isObjectInArray) {
            const tempList =
                [
                    ...addressList,
                    tempSigner
                ]

            setAddressList(tempList)

            //  儲存object 資料
            const myObjectArrayJson = JSON.stringify(tempList, replacer);

            localStorage.setItem('signerList', myObjectArrayJson)
        }
        else
            console.log("Already In Array")
    }

    const importPrivateKey = async () => {
        const privateKeyAddress = document.getElementById('privateKey')
        const value = privateKeyAddress.value;
        handlePrivateKey(value)
    }
    const onSelectWallet = (address, index) => {
        setSigner(addressList[index - 1])
    }
    const onSelectRpc = (rpc, index) => {
        setRpcProvider(new ethers.providers.JsonRpcProvider(rpcList[index - 1]))
    }

    return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: 'center', flexDirection: "column", marginTop: '5vh  ' }}>
            <h1>
                Transfer Center
            </h1>
            <span>
                <span style={{ marginRight: '10px' }}>當前 rpc : </span>
                {/* {rpcProvider.connection.url} */}
                <Dropdown options={
                    rpcList.map((rpc, index) => {
                        return {
                            value: rpc,
                            label: `${index + 1}. ${rpc}`,
                        }
                    })
                }
                    onSelect={onSelectRpc}
                />
            </span>
            <div style={{
                display: 'flex',
                flexDirection: 'row',
                maxHeight: '300px'
            }}>
                <div
                    style={{
                        border: '1px solid black',
                        margin: '10px',
                        padding: '10px',
                        margin: '10px',
                        width: '90vw',
                        maxWidth: '400px',
                    }}>
                    <h3>
                        <span style={{ marginRight: '10px' }}>選擇錢包 :</span>
                        <Dropdown options={
                            addressList.map((address, index) => {
                                return {
                                    value: address.address,
                                    label: `${index + 1}. ${address.address.slice(0, 4)}...${address.address.slice(-4)}`,
                                }
                            })
                        }
                            onSelect={onSelectWallet}
                        />
                    </h3>
                    {
                        signer !== null &&
                        <>
                            <h3 style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                            }}>
                                錢包餘額
                                <span
                                    style={{
                                        fontWeight: 'bold',
                                        fontSize: '16px',
                                        textAlign: 'right',
                                    }}
                                >{walletBalance} BNB</span>
                            </h3>
                            <hr />
                            <div style={{
                                display: 'flex',
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                            }}>
                                <CopyToClipboard
                                    text={signer.address}
                                    onCopy={() => {
                                        swal('Success', '成功複製', 'success')
                                        setCopied(true)
                                    }}
                                >
                                    <button
                                        className="btn btn-primary rounded-pill"
                                        style={buttonStyle}
                                    >
                                        複製地址
                                    </button>
                                </CopyToClipboard>

                                <button
                                    className="btn btn-primary rounded-pill"
                                    style={buttonStyle}
                                    onClick={removeWallet}
                                >
                                    移除錢包
                                </button>
                            </div>
                        </>
                    }
                    <div style={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginTop: '10px',
                        marginBottom: '10px',
                    }}>
                        <span>私鑰</span>
                        <input placeholder='私鑰地址' id='privateKey' />
                    </div>
                    <button
                        className="btn btn-primary rounded-pill"
                        style={buttonStyle}
                        onClick={importPrivateKey}
                    >導入私鑰</button>
                    {/* </>
                    } */}

                </div>

                <div style={{
                    border: '1px solid black',
                    margin: '10px',
                    padding: '10px',
                    margin: '10px',
                    width: '90vw',
                    maxWidth: '400px',
                    overflowY: 'scroll',
                }}>
                    {
                        //總表
                        addressList.length > 0 &&
                        <table style={{ borderCollapse: 'collapse' }}>
                            <thead style={{ backgroundColor: '#eee' }}>
                                <tr>
                                    <th style={{ padding: '10px', textAlign: 'left' }}>Index</th>
                                    <th style={{ padding: '10px', textAlign: 'left' }}>Address</th>
                                    <th style={{ padding: '10px', textAlign: 'left' }}>Balance</th>
                                </tr>
                            </thead>
                            <tbody>
                                {addressList.map((obj, index) => {
                                    return (
                                        <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#fff' : '#f2f2f2' }}>
                                            <td style={{ padding: '10px', border: '1px solid #ddd' }}>{index}</td>
                                            <td style={{ padding: '10px', border: '1px solid #ddd' }}>{obj.address.slice(0, 4)}...{obj.address.slice(-4)}</td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    }
                </div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
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

                            {
                                button.inputAmount > 0
                                    ? <hr />
                                    : null
                            }

                            {
                                button.inputAmount &&
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
                                            // defaultValue={0}
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
                            <button
                                className="btn btn-primary rounded-pill"
                                onClick={() => handleFunction(button.function, index)}
                            >
                                {button.text}
                            </button>
                            {
                                button.judgement === true &&
                                <>
                                    <hr />
                                    <span>
                                        {button.returnValue}
                                    </span>
                                </>
                            }
                        </div>
                    );
                })}
            </div>
        </div >
    )
}

export default GetHex

const Dropdown = ({ options, onSelect }) => {
    const [selectedValue, setSelectedValue] = useState('');

    function handleChange(event) {
        // console.log(event.target)
        const value = event.target.value;
        const selectedIndex = event.target.selectedIndex;
        if (selectedIndex == 0) return;
        setSelectedValue(value);
        onSelect(value, selectedIndex);
    }

    return (
        <select value={selectedValue} onChange={handleChange} style={{
            maxWidth: '300px'
        }}>
            <option value="" style={{
                paddingLeft: '10px'
            }}>-- 請選擇 --</option>
            {options.map((option, index) => (
                <option key={index} value={option.value}>
                    {option.label}
                </option>
            ))}
        </select>
    );
} 