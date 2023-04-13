import React, { useState } from "react";

const StepTwo = ({
   setGoSteps,
   defaultAccount,
   ownerValue,
   onSubmit
}) => {

   const [owner, setOwner] = useState(ownerValue)

   const datas = [
      {
         title: "Owner",
         placeHolder: "The owner of the staking contract",
         type: 'text',
         function: (e) => setOwner(e.target.value),
         value: owner,
      },
   ]

   return (
      <section>
         <div className="row">
            {
               datas.map((data, index) => {
                  return (
                     <div
                        key={index}
                        className="col-lg-6 mb-2"
                     >
                        <div className="form-group mb-3">
                           <label className="text-label">{data.title}</label>
                           <input
                              type={data.type}
                              className="form-control"
                              placeholder={data.placeHolder}
                              required
                              autoComplete="off"
                              onChange={data.function}
                              defaultValue={data.value}
                              id={index}
                           />
                           {
                              index == 0 &&
                              <button
                                 className="btn btn-primary"
                                 id="Wallet"
                                 onClick={
                                    () => {
                                       setOwner(defaultAccount)
                                    }
                                 }
                              >
                                 Use Linking Wallet
                              </button>
                           }
                        </div>
                     </div>
                  )
               })
            }
         </div>
         <div className="text-end toolbar toolbar-bottom p-2">
            <button className="btn btn-secondary sw-btn-prev me-1" onClick={() => {
               setGoSteps(0)
               onSubmit(owner)
            }}>Prev</button>
            <button className="btn btn-primary sw-btn-next ms-1" onClick={() => {
               setGoSteps(2)
               onSubmit(owner)
            }}>Next</button>
         </div>
      </section>
   );
};

export default StepTwo;
