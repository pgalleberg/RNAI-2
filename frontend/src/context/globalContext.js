import { createContext, useEffect, useState } from "react";

export const GlobalContext = createContext()

export function Context({ children }){
    const [verticalId, setVerticalId] = useState('');

    useEffect(()=>{
        let id = localStorage.getItem('vertical_id')
        if(id && !verticalId){
            setVerticalId(id)
        }
    },[verticalId])

    const values = {
        verticalId,
        setVerticalId
    }

    return (
        <GlobalContext.Provider value={values}>
            {children}
        </GlobalContext.Provider>
    )
}