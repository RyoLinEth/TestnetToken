import React from "react";
import { ethers } from 'ethers'
import TokenABI from '../ABI/TokenABI.json'

const StepThree = (props) => {
   const {
      defaultAccount, provider, signer, contract,
      stakingTokenValue,
      rewardTokenValue,
      startTimeValue,
      endTimeValue,
      rewardPerBlockValue,
      ownerValue,
      setErrorText,
      setGoSteps,
      setIsLoading,
      setIsRejected
   } = (props)

   const BlockTime = 3;

   const checkAllowance = async () => {
      try {
         let rewardContract = new ethers.Contract(rewardTokenValue, TokenABI, signer)

         // 已授權的數量
         let approvedAmount = await rewardContract.allowance(defaultAccount, contract.address);

         // 該授權的數量
         let decimal = await rewardContract.decimals();
         const approvingAmount = ethers.utils.parseUnits(`${requiredAmount()}`, decimal)
         
         console.log(approvedAmount, approvingAmount)

         if (approvedAmount >= approvingAmount)
            createPool()
         else
            approve()

      } catch (err) {
         setErrorText(err.toString())
      }
   }

   const checkAllowanceAgain = async () => {
      console.log("Checking Allowance Again")
      let rewardContract = new ethers.Contract(rewardTokenValue, TokenABI, signer)

      // 已授權的數量
      let approvedAmount = await rewardContract.allowance(defaultAccount, contract.address);

      // 該授權的數量
      let decimal = await rewardContract.decimals();
      const approvingAmount = ethers.utils.parseUnits(`${requiredAmount()}`, decimal)

      if (approvedAmount >= approvingAmount) 
         createPool()
      else
         setTimeout(() => checkAllowanceAgain(), 3000)
   }

   const approve = async () => {
      try {
         let rewardContract = new ethers.Contract(rewardTokenValue, TokenABI, signer)

         // 代幣精度
         let decimal = await rewardContract.decimals();

         // 即將授權數量
         const approvingAmount = ethers.utils.parseUnits(`${requiredAmount()}`, decimal)

         // 授權
         let result = await rewardContract.approve(contract.address, approvingAmount)
         console.log(result)

         checkAllowanceAgain()
      } catch (err) {
         setErrorText(err.reason)
      }
   }

   const requiredAmount = () => {
      return rewardPerBlockValue * (endTimeValue - startTimeValue) / 1000
   }

   const checkAllowanceApproveAndCreatePool = async () => {
      try {
         checkAllowance()
      } catch (err) {
         setErrorText(err.reason)
      }
   }

   const createPool = async () => {
      let rewardContract = new ethers.Contract(rewardTokenValue, TokenABI, signer)

      // 代幣精度
      let decimal = await rewardContract.decimals();
      const sendingAmount = ethers.utils.parseUnits(`${requiredAmount()}`, decimal)
      try {
         let result = await contract.deployPool(
            stakingTokenValue,
            rewardTokenValue,
            rewardPerBlockValue * BlockTime,       //每秒的獎勵 x 一區塊幾秒
            getBlockNumber(startTimeValue),        //轉換成區塊時間
            getBlockNumber(endTimeValue),
            0,
            0,
            ownerValue,
            sendingAmount
         )
         console.log(result)
         setIsLoading(false)
      } catch (err) {
         if (err.reason != null || err.reason != undefined)
            setErrorText(err.reason)
         else
            setErrorText(err.toString())
         setIsLoading(false)
         setIsRejected(true)
      }
   }

   const getBlockNumber = async (timestamp) => {
      const block = await provider.getBlock("latest", false, true);
      const blockNumber = await provider.getBlockNumber();

      const convertedBlockNumber = blockNumber - Math.floor((block.timestamp - timestamp / 1000) / BlockTime)
      console.log(convertedBlockNumber)
      return convertedBlockNumber;
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
   const datas = [
      {
         title: "Staking Token",
         placeHolder: "The token going to be staked",
         type: 'text',
         value: stakingTokenValue,
      },
      {
         title: "Reward Token",
         placeHolder: "The token benefits from staking",
         type: 'text',
         value: rewardTokenValue,
      },
      {
         title: "Start Time",
         placeHolder: "The start time of your staking pool",
         type: 'datetime-local',
         value: convertBackTime(startTimeValue),
      },
      {
         title: "End Time",
         placeHolder: "The end time of your staking pool",
         type: 'datetime-local',
         value: convertBackTime(endTimeValue),
      },
      {
         title: "Reward Per Second",
         placeHolder: "Tokens the rewards in a second",
         type: 'number',
         value: rewardPerBlockValue,
      },
      {
         title: "Reward Token Needed",
         placeHolder: "Tokens the rewards in a second",
         type: 'number',
         value: requiredAmount(),
      },
      {
         title: "Owner",
         placeHolder: "The owner of the staking contract",
         type: 'text',
         value: ownerValue,
      },
   ]

   const style = {
      paddingLeft: '10vw',
      maxWidth: '60vw'
   }
   return (
      <section>
         <div className="table-responsive">
            <table className="table table-striped border-dark border">
               <tbody>
                  <tr>
                     <td colspan="2" style={{ textAlign: 'center', fontWeight: 'bold' }}>Pool Information</td>
                  </tr>

                  <tr>
                     <th className="col-3">Parameter</th>
                     <th className="col-9" style={style}>Value</th>
                  </tr>
                  {datas.map((data, index) => (
                     <tr key={index}>
                        <td className="col-3">{data.title}</td>
                        <td className="col-9" style={style}>{data.value}</td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>

         <div className="text-end toolbar toolbar-bottom p-2">
            <button className="btn btn-secondary sw-btn-prev me-1" onClick={() => setGoSteps(1)}>Prev</button>
            <button className="btn btn-primary sw-btn-next ms-1" onClick={() => {
               checkAllowanceApproveAndCreatePool();
               setGoSteps(3)
               setIsLoading(true)
            }}>Next</button>
         </div>
      </section>
   );
};

export default StepThree;
