import React from "react";
import { Link } from "react-router-dom";

const StepFour = (props) => {
   const { isLoading, isRejected, setGoSteps, setIsRejected } = props
   return (
      <section>
         {
            isLoading && <>Loading</>
         }
         {
            isRejected && <>User Denied Transaction</>
         }

         <div className="text-end toolbar toolbar-bottom p-2">
            <button
               className="btn btn-secondary sw-btn-prev me-1"
               onClick={() => {
                  setGoSteps(2)
                  setIsRejected(false)
               }}
            >Prev</button>
            <button
               className="btn btn-primary sw-btn-next ms-1"
               onClick={() => setGoSteps(4)}
            >Submit</button>
         </div>
      </section>
   );
};

export default StepFour;
