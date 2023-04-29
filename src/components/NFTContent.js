import React, { useState } from 'react'
import { useEffect } from 'react';

const NFTContent = () => {
    const [nftImage, setNFTImage] = useState(null);
    const [nftName, setNFTName] = useState(null);
    const [nftAttribute, setNFTAttribute] = useState([]);

    useEffect(() => {
        fetchContent()
    }, [])
    const fetchContent = () => {
        fetch("http://13.230.57.144:3000/json/791.json")
            .then((responsed) => responsed.json())
            .then((data) => {
                console.log(data);
                setNFTName(data.name)
                setNFTAttribute(data.attributes)
                const image = data.image.split("ipfs://")[1];
                setNFTImage(`https://gateway.pinata.cloud/ipfs/${image}`);
            })
            .catch((error) => {
                console.error(error);
                // 处理错误
            });
    }


    return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: 'center', flexDirection: "column", marginTop: '5vh  ' }}>
            <h1>
                #
            </h1>
            {/* <span onClick={fetchContent}>
                Fetch
            </span> */}

            {/* //  資料板塊 */}
            <div>
                <div style={{ display: 'flex', flexDirection: 'row' }}>

                    {/* 左邊資料 */}
                    <div style={{ height: '80vh', minWidth: '30vw', flex: 1 }}>
                        {/* 圖片區域 */}
                        <div style={{
                            width: '360px',
                            height: '360px',
                            border: '1px solid black',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}>
                            {/* 圖片 */}
                            <img src={nftImage} alt="圖片" height={350} width={350} />
                        </div>
                        {/* 屬性區域 */}
                        <div>
                            <div style={{
                                marginTop: '10px',
                                width: '360px',
                                border: '1px solid black',
                            }}>
                                <p style={{ display: "flex", justifyContent: "center", alignItems: 'center', flexDirection: "column" }}
                                >屬性
                                </p>
                                <hr />
                                <div style={{
                                    display: 'flex',
                                    flexWrap: 'wrap'
                                }}>
                                    {
                                        nftAttribute.length > 0 &&
                                        nftAttribute.map((attribute, index) => {
                                            return (
                                                //  小方格
                                                //  每行三個資料
                                                <div style={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    border: '1px solid black',
                                                    borderRadius: '5px',
                                                    width: '100px',
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                    margin: '5px',
                                                }}
                                                    key={attribute.name}
                                                >
                                                    <span>{attribute.trait_type}</span>
                                                    <span>{attribute.value}</span>
                                                    <span>{attribute.probability * 100} %</span>
                                                </div>
                                            )
                                        })
                                    }
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 右邊資料 */}
                    <div style={{ height: '80vh', minWidth: '70vw', flex: 2 }}>
                        <span
                            style={{ fontSize: '40px', fontWeight: 'bold' }}
                        >{nftName}</span>

                        {/* 價格及銷售 */}
                        <div>

                            <div style={{
                                width: '60vw',
                                height: '60vh',
                                border: '1px solid black',
                                borderRadius: '5px',
                                display: 'flex',
                                flexDirection: 'column',
                            }}>
                                {/* 如果已上架 顯示價格 */}
                                <div>
                                    Price:
                                </div>

                                {/* 如果未上架 顯示販售按鈕 */}
                                <div>
                                    <button onClick={() => alert("Selling")}>
                                        Sell
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default NFTContent
