import { createContext, useContext, useState} from 'react'

const AppContext = createContext()

export function AppProvider({children}){
    const [sidebarOpen, setSidebarOpen] = useState(true)

    const value = {
        sidebarOpen,
        setSidebarOpen
    }

    return(
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    )
}

export function useApp(){
    return useContext(AppContext)
}