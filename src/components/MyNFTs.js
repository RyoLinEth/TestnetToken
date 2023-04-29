import React, { useEffect, useState } from 'react'
import { ethers } from 'ethers'
import nftABI from './ABI/nftABI.json'

const MyNFTs = ({ defaultAccount }) => {
    console.log(defaultAccount)

    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null)
    const [nftContract, setNFTContract] = useState(null)

    const [nftBalance, setNFTBalance] = useState(null);
    const [imgDatas, setImgDatas] = useState([]);

    const initContract = async () => {
        try {
            const tempProvider = new ethers.providers.Web3Provider(window.ethereum)
            setProvider(tempProvider)

            const tempSigner = tempProvider.getSigner()
            setSigner(tempSigner)

            const tempNFTContract = new ethers.Contract(nftMintAddress, nftABI, tempSigner)
            setNFTContract(tempNFTContract)

            const nftBalance = await tempNFTContract.balanceOf(defaultAccount);
            const realNftBalance = ethers.utils.formatUnits(nftBalance, "0");
            setNFTBalance(realNftBalance);

            //  全部都是bigNumber
            const bigNumOwnedToken = await tempNFTContract.tokensOfOwner(defaultAccount);

            //  轉換成 num
            const OwnedToken = bigNumOwnedToken.map(num => ethers.utils.formatUnits(num, 0));
            console.log("Getting NFT Data... 1")
            //  獲取各自的 tokenURI
            const tokenUris = OwnedToken.map((tokenID) => tempNFTContract.tokenURI(tokenID));
            console.log("Getting NFT Data... 2")
            //  得到所有 mint 到的 tokenURI
            Promise.all(tokenUris)
                .then((responses) => {
                    const fetchPromises = responses.map(async (response) => {
                        console.log(response)
                        // 抓取各自的 tokenURI
                        return fetch(response)
                            .then((responsed) => responsed.json())
                            .then((data) => {
                                const image = data.image.split("ipfs://")[1];
                                return {
                                    No: data.name.split("#")[1],
                                    url: `https://gateway.pinata.cloud/ipfs/${image}`,
                                }
                            })
                            .catch((error) => {
                                console.error(error);
                                // 处理错误
                            });
                    });
                    // 并发地处理所有图像 URL
                    return Promise.all(fetchPromises);
                })
                .then((imageDatas) => {
                    setImgDatas(imageDatas);
                })
                .catch((error) => {
                    console.error(error);
                    // 处理错误
                });
            console.log(tokenUris);
        } catch (err) {
            console.log(err);
        }
    }
    useEffect(() => {
        if (defaultAccount) {
            initContract()
        }
    }, [defaultAccount])
    const nftMintAddress = '0x9c657E4A638df5E5e5d2b08cDCD7B3A2cE25052D'
    return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: 'center', flexDirection: "column", marginTop: '5vh  ' }}>
            {/* 標題區域 */}
            <div>
                My NFTs - {nftBalance}
            </div>
            NFT 圖片展示
            <div style={{
                width: '90vw',
                display: 'flex',
                flexDirection: 'row',
                flexWrap: 'wrap',
            }}>
                {
                    imgDatas.length > 0 &&
                    imgDatas.map((imgData, index) => {
                        console.log(imgData)
                        return (
                            <div style={{
                                margin: '10px',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}>
                                <img
                                    key={imgData.name}
                                    src={imgData.url}
                                    alt={`NFT ${index}`}
                                    style={{
                                        maxWidth: '130px'
                                    }} />
                                #{imgData.No}
                            </div>
                        )
                    })
                }
            </div>
        </div>
    )
}

export default MyNFTs
