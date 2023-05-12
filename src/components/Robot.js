import React, { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import CopyToClipboard from 'react-copy-to-clipboard'
import swal from 'sweetalert'
import TokenABI from './ABI/TokenABI.json'
import RouterABI from './ABI/RouterABI.json'

const provider = 'https://data-seed-prebsc-1-s1.binance.org:8545'
const provider2 = 'https://data-seed-prebsc-1-s2.binance.org:8545'
const provider3 = 'https://data-seed-prebsc-1-s3.binance.org:8545'

const routerAddress = '0xD99D1c33F9fC3444f8101754aBC46c52416550D1'

const Robot = () => {

    const [rpcProvider, setRpcProvider] = useState(
        new ethers.providers.JsonRpcProvider(provider)
    )

    const [addressList, setAddressList] = useState([]);

    //設定錢包
    const [walletBalance, setWalletBalance] = useState(null);
    const [signer, setSigner] = useState(null);

    //  連結合約
    const [tokenContract, setTokenContract] = useState(null);
    const [routerContract, setRouterContract] = useState(null);

    //  回傳值
    const [tokenName, setTokenName] = useState(null);
    const [tokenSymbol, setTokenSymbol] = useState(null);
    const [tokenDecimal, setTokenDecimal] = useState(null);
    const [tokenBalance, setTokenBalance] = useState(null);

    const [buyHash, setBuyHash] = useState(null);
    const [sellHash, setSellHash] = useState(null);

    //複製
    const [copied, setCopied] = useState(false);


    useEffect(() => {
        if (signer !== null)
            handleSignerChange()
    }, [signer])

    useEffect(() => {
        if (tokenContract !== null)
            getTokenStatus();
    }, [tokenContract])

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

    const buttons = [
        {
            text: "Set Token",
            description: "輸入欲買入之代幣合約地址",
            inputAmount: 1,
            inputNames: [
                "Address",
            ],
            function: async (value) => setToken(value),
            returnValue:
                <span>
                    代幣名稱 : {tokenName} <br />
                    代幣簡稱 : {tokenSymbol} <br />
                    代幣精度 : {tokenDecimal} <br />
                    代幣餘額 : {tokenBalance}
                </span>,
        },
        {
            text: "Buy With BNB",
            description: "輸入欲買入之bnb數量 滑點",
            inputAmount: 2,
            inputNames: [
                "BNB",
                "Slippage"
            ],
            function: async (value1, value2) =>
                buySwap(value1, value2),
            returnValue:
                <span>交易哈希 :
                    {
                        buyHash !== null &&
                        `${buyHash.slice(0, 4)}...${buyHash.slice(-4)}`
                    }</span>,
        },
        {
            text: "Sell Token",
            description: "輸入欲賣出之代幣數量",
            inputAmount: 2,
            inputNames: [
                "Token",
                "Slippage"
            ],
            function: async (value1, value2) =>
                approveAndSell(value1, value2),
            returnValue:
                <span>交易哈希 :
                    {
                        sellHash !== null &&
                        `${sellHash.slice(0, 4)}...${sellHash.slice(-4)}`
                    }</span>,
        },
    ]

    const [inputValues, setInputValues] = useState(buttons.map(button => new Array(button.inputAmount).fill("")));

    const handleFunction = async (func, index) => {
        const result = await func(...inputValues[index]);
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

    const setToken = async (value) => {
        console.log(rpcProvider.connection.url);
        console.log(signer)
        try {
            if (value.length !== 42) return console.log("Not Contract");

            const tempTokenContract = new ethers.Contract(
                value, TokenABI, signer
            )
            console.log(tempTokenContract);
            setTokenContract(tempTokenContract)
        } catch (err) {
            console.log(err)
        }
    }

    const getTokenStatus = async () => {
        const name = await tokenContract.name();
        const symbol = await tokenContract.symbol();
        const tempDecimal = await tokenContract.decimals();
        const tempTokenBalance = await tokenContract.balanceOf(signer.address);
        const realTokenBalance = ethers.utils.formatUnits(tempTokenBalance, tempDecimal);
        setTokenName(name);
        setTokenSymbol(symbol);
        setTokenDecimal(tempDecimal);
        setTokenBalance(realTokenBalance);
    }

    const getBalanceAndTokenBalance = async () => {
        // 重新獲取餘額操作
        const balance = await rpcProvider.getBalance(signer.address)
        const realBalance = ethers.utils.formatEther(balance);
        setWalletBalance(realBalance);

        const tokenBalance = await tokenContract.balanceOf(signer.address);
        const realTokenBalance = ethers.utils.formatUnits(tokenBalance, tokenDecimal)
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

    const approveAndSell = async (value1, value2) => {
        const approveAmount = ethers.utils.parseUnits("1000000000000000000000000", tokenDecimal)
        const approveResult = await tokenContract.approve(
            routerAddress, `${approveAmount}`
        )
        listenToTransaction(
            approveResult.hash,
            async () => await sellSwap(value1, value2)
        )
    }

    const sellSwap = async (value1, value2) => {
        const amountIn = ethers.utils.parseUnits(`${value1}`, `${tokenDecimal}`);
        const amountOutMin = 0;
        const WBNB = await routerContract.WETH();
        const path = [
            tokenContract.address, WBNB
        ]
        const to = signer.address
        const deadline = (Date.now() / 1000).toFixed(0) + 1200
        const result = await routerContract.swapExactTokensForETHSupportingFeeOnTransferTokens(
            amountIn, amountOutMin, path, to, deadline
        )
        setSellHash(result.hash);
        listenToTransaction(
            result.hash,
            async () => await getBalanceAndTokenBalance()
        )
    }

    const buySwap = async (value1, value2) => {
        const payBNB = ethers.utils.parseEther(value1);
        const amountOutMin = 0;
        const WBNB = await routerContract.WETH();
        const path = [
            WBNB, tokenContract.address
        ]
        const to = signer.address;
        const deadline = (Date.now() / 1000).toFixed(0) + 1200
        const result = await routerContract.swapExactETHForTokens(
            amountOutMin, path, to, deadline, {
            value: payBNB
        })
        setBuyHash(result.hash)

        listenToTransaction(
            result.hash,
            async () => await getBalanceAndTokenBalance()
        )
    }


    const handleSignerChange = async (value) => {
        //  查詢錢包餘額
        //  此時為bigNum
        const balance = await rpcProvider.getBalance(signer.address)
        const realBalance = ethers.utils.formatEther(balance);
        setWalletBalance(realBalance);

        //  設定路由 
        const tempRouterCA = new ethers.Contract(
            routerAddress, RouterABI, signer
        )
        setRouterContract(tempRouterCA);

        if (tokenContract !== null) {

            const tempTokenContract = new ethers.Contract(
                tokenContract.address, TokenABI, signer
            )
            setTokenContract(tempTokenContract);
        }

    }

    const handlePrivateKey = async (value) => {
        //  設定錢包
        const wallet = new ethers.Wallet(value)
        const tempSigner = wallet.connect(rpcProvider);

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
            const myObjectArrayJson = JSON.stringify(tempList);

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
        console.log(address, index)
        setSigner(addressList[index - 1])
    }
    const onSelectRpc = (rpc, index) => {
        console.log(rpc, index)
        setRpcProvider(new ethers.providers.JsonRpcProvider(rpcList[index - 1]))

    }

    return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: 'center', flexDirection: "column", marginTop: '5vh  ' }}>
            <h1>
                Trading Bot Center
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

                    {/* 
                    <h3>當前錢包 : {
                        signer == null
                            ? "未導入"
                            : `${signer.address.slice(0, 4)}...${signer.address.slice(-4)}`
                    }</h3> */}
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
                                < CopyToClipboard
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
                    {/* {
                        signer === null &&
                        <> */}
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
                                button.returnValue !== undefined &&
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

export default Robot

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
        <select value={selectedValue} onChange={handleChange}>
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