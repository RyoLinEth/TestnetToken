import React, { Fragment, useState, useEffect } from "react";
//import Multistep from "react-multistep";
import { Stepper, Step } from 'react-form-stepper';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.min.js';
import { ethers } from 'ethers'


import StepOne from "./StepOne";
import StepTwo from "./StepTwo";
import StepThree from "./StepThree";
import StepFour from "./StepFour";
// import PageTitle from "./PageTitle";
import ErrorMessage from '../ErrorMessage'
import './Wizard.css'

import CreatePoolABI from '../ABI/CreatePool.json'

const CreatePoolContract = "0xE6D9694850128FeCe8ac7528E63fE2513C6CF5b5"

const Wizard = (props) => {

    const { defaultAccount } = props

    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);
    const [contract, setContract] = useState(null);

    const updateEthers = async () => {
        try {
            let tempProvider = new ethers.providers.Web3Provider(window.ethereum);
            setProvider(tempProvider);

            let tempSigner = tempProvider.getSigner();
            setSigner(tempSigner);

            let tempContract = new ethers.Contract(CreatePoolContract, CreatePoolABI, tempSigner)
            setContract(tempContract);
        } catch {

        }
    }

    useEffect(() => {
        updateEthers()
    }, [defaultAccount])

    const [goSteps, setGoSteps] = useState(0);

    //  Step One
    const [stakingToken, setStakingToken] = useState(null)
    const [rewardToken, setRewardToken] = useState(null)
    const [startTime, setStartTime] = useState(null);
    const [endTime, setEndTime] = useState(null);
    const [rewardPerBlock, setRewardPerBlock] = useState(null)

    //  Step Two
    const [owner, setOwner] = useState(null)

    const [isLoading, setIsLoading] = useState(false);
    const [isRejected, setIsRejected] = useState(false);

    //  Error Text
    const [errorText, setErrorText] = useState(null);

    const handleStepOneSubmit = (stakingToken, rewardToken, startTime, endTime, rewardPerBlock) => {
        setStakingToken(stakingToken)
        setRewardToken(rewardToken)
        setStartTime(startTime)
        setEndTime(endTime)
        setRewardPerBlock(rewardPerBlock)
        setGoSteps(1)
        console.log("SUBMITTING")
        console.log(stakingToken, rewardToken, startTime, endTime, rewardPerBlock)
    };

    const handleStepTwoSubmit = (owner) => {
        setOwner(owner);
    }

    const viewValues = () => {
        console.log(
            stakingToken, rewardToken, startTime, endTime,
            rewardPerBlock, owner
        )
    }

    return (
        <Fragment>
            <div className="row" style={{ marginTop: '5vh' }}>
                <div className="col-xl-12 col-xxl-12">
                    <div className="card">
                        <div className="card-header">
                            <h4 className="card-title" style={{ textAlign: 'center' }}>Farm Creation</h4>
                        </div>
                        <div className="card-body">
                            {
                                errorText !== null &&
                                <ErrorMessage
                                    errorMessage={errorText}
                                    setErrorText={setErrorText}
                                />
                            }

                            <div className="form-wizard ">
                                <Stepper className="nav-wizard" activeStep={goSteps} label={false}>
                                    <Step className="nav-link" onClick={() => setGoSteps(0)} />
                                    <Step className="nav-link" onClick={() => setGoSteps(1)} />
                                    <Step className="nav-link" onClick={() => setGoSteps(2)} />
                                    <Step className="nav-link" onClick={() => setGoSteps(3)} />
                                </Stepper>
                                {goSteps === 0 && (
                                    <>
                                        <StepOne
                                            defaultAccount={defaultAccount}
                                            provider={provider}
                                            stakingTokenValue={stakingToken}
                                            rewardTokenValue={rewardToken}
                                            startTimeValue={startTime}
                                            endTimeValue={endTime}
                                            rewardPerBlockValue={rewardPerBlock}
                                            setErrorText={setErrorText}
                                            onSubmit={handleStepOneSubmit}
                                        />
                                    </>
                                )}
                                {goSteps === 1 && (
                                    <>
                                        <StepTwo
                                            setGoSteps={setGoSteps}
                                            defaultAccount={defaultAccount}
                                            ownerValue={owner}
                                            onSubmit={handleStepTwoSubmit}
                                        />
                                    </>
                                )}
                                {goSteps === 2 && (
                                    <>
                                        <StepThree
                                            defaultAccount={defaultAccount}
                                            provider={provider}
                                            signer={signer}
                                            contract={contract}
                                            stakingTokenValue={stakingToken}
                                            rewardTokenValue={rewardToken}
                                            startTimeValue={startTime}
                                            endTimeValue={endTime}
                                            rewardPerBlockValue={rewardPerBlock}
                                            ownerValue={owner}
                                            setErrorText={setErrorText}
                                            setGoSteps={setGoSteps}
                                            setIsLoading={setIsLoading}
                                            setIsRejected={setIsRejected}
                                        />
                                        {/* <div className="text-end toolbar toolbar-bottom p-2">
                                            <button className="btn btn-secondary sw-btn-prev me-1" onClick={() => setGoSteps(1)}>Prev</button>
                                            <button className="btn btn-primary sw-btn-next ms-1" onClick={() => setGoSteps(3)}>Next</button>
                                        </div> */}
                                    </>
                                )}
                                {goSteps === 3 && (
                                    <>
                                        <StepFour
                                            isLoading={isLoading}
                                            isRejected={isRejected}
                                            setGoSteps={setGoSteps}
                                            setIsRejected={setIsRejected}
                                        />
                                        {/* <div className="text-end toolbar toolbar-bottom p-2">
                                            <button className="btn btn-secondary sw-btn-prev me-1" onClick={() => setGoSteps(2)}>Prev</button>
                                            <button className="btn btn-primary sw-btn-next ms-1" onClick={() => setGoSteps(4)}>Submit</button>
                                        </div> */}
                                    </>
                                )}

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Fragment>
    );
};

export default Wizard;
