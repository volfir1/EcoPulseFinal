import { useEffect, useState } from "react";

const useDrawer = () => {
    const [open, setOpen] = useState(true)
    const [openSubMenu, setOpenSubMenu] = useState({})

    useEffect(() =>{
        if(!open){
            setOpenSubMenu({})
        }
    },[open])
    
    const handleDrawer = () =>{
        setOpen(prev =>!prev)
    }

    const handleSubMenu = (segment) => {
        setOpenSubMenu(prev =>({
            ...prev,
            [segment] : !prev[segment]
        }))
       
    }

    return{
        open,
        openSubMenu,
        handleDrawer,
        handleSubMenu
    }
}

export default useDrawer