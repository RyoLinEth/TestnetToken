import React, { useState, useEffect } from 'react';
import axios from 'axios';

function GetNFTData() {
    const [nftJson, setNftJson] = useState(null);
    const [tokenID, setTokenId] = useState(null);

    const currentURL = window.location.href;
    if (currentURL.includes("?")) {
        const tokenId = new URL(currentURL).searchParams.get('tokenId');
        if (tokenID == null || tokenID != tokenId)
            setTokenId(tokenId)
    } else {
        console.log("THE URL DO NOT INCLUDES ?")
    }

    useEffect(() => {
        if (tokenID != null)
            axios.get(`http://13.230.57.144:3000/json/${tokenID}.json`)
                .then(response => {
                    const jsonString = JSON.stringify(response.data);
                    console.log(`{${jsonString}}`);
                    setNftJson(`{${jsonString}}`);
                });
    }, [tokenID]);

    return (
        <div>
            {
                nftJson !== null && <p>{nftJson}</p>
            }
        </div>
    );
}

export default GetNFTData;