const TransactionCallBack = (props) => {
    const { provider, result } = props
    provider
        .getTransaction(result.hash)
        .then((tx) => {
            // 監聽交易上鍊事件
            tx.wait().then(async (receipt) => {
                //  授權成功
                console.log(`交易已上鍊，區塊高度為 ${receipt.blockNumber}`)
                try {
                    return { success: true };
                } catch (err) {
                    console.log(err)
                    return { success: false };
                }
            })
        })
}

export default TransactionCallBack
