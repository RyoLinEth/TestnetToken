import React, { useState, useEffect } from 'react'
import { ethers } from 'ethers';
import swal from 'sweetalert'
import ErrorMessage from './ErrorMessage';

const WalletConnect = ({ defaultAccountChange, language }) => {
    const [defaultAccount, setDefaultAccount] = useState(null)
    const [correctNetwork, setCorrectNetwork] = useState(null);
    const [connectButtonText, setConnectButtonText] = useState("連接錢包")

    const ChineseConnect = "連接錢包"
    const EnglishConnect = "Connect Wallet"
    
    const [errorText, setErrorText] = useState(null);

    const setLanguage = () => {
        if (language !== "中") {
            if (connectButtonText === ChineseConnect) {
                setConnectButtonText(EnglishConnect)
                return;
            }
        }
        else
            if (connectButtonText === EnglishConnect) {
                setConnectButtonText(ChineseConnect)
                return;
            }
    }

    useEffect(() => {
        setLanguage()
    }, [language])

    useEffect(() => {
        changingAccount();
        defaultAccountChange(defaultAccount);
    }, [defaultAccount])

    async function changingAccount() {
        if (window.ethereum) {
            window.ethereum.on('accountsChanged', () => {
                connectWalletHandler()
            })
        }
    }

    const connectWalletHandler = async () => {
        if (window.ethereum) {
            window.ethereum.request({ method: 'eth_requestAccounts' })
                .then(async (result) => {
                    await accountChangeHandler(result[0]);
                    setConnectButtonText(`${result[0].slice(0, 4)}...${result[0].slice(-4)}`);
                })
        } else {
            swal('Error','Need to install MetaMask!','error')
        }
    }

    const accountChangeHandler = async (newAccount) => {
        checkCorrectNetwork();
        setDefaultAccount(newAccount);
    }

    const checkCorrectNetwork = async () => {
        const { ethereum } = window
        let chainId = await ethereum.request({ method: 'eth_chainId' })
        // console.log('Connected to chain:' + chainId)

        const netWorkID = '0x61'
        // const netWorkID = '0x38'

        if (chainId !== netWorkID) {
            setErrorText("Wrong Network")
            // setCorrectNetwork(false)
            // swal("Error", "Please Connect to the Correct Network", "error")
        } else {
            // setCorrectNetwork(true)
        }
    }

    return (
        <div className="btnConnect">
            
            {
                errorText !== null &&
                <ErrorMessage
                    errorMessage={errorText}
                    setErrorText={setErrorText}
                />
            }
            <button
                onClick={connectWalletHandler}
                className="btn btn-primary rounded-pill"
                style={{
                    maxWidth: '120px',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '40px'
                }}
            >{connectButtonText}</button>
        </div>
    )
}

export default WalletConnect
