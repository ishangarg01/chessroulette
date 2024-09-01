import React from "react";

export const Button = ({onclick, children} : {onclick : ()=>void , children : React.ReactNode}) => {
  return (
    <button onClick={onclick} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">
        {children}
    </button>
  );
}