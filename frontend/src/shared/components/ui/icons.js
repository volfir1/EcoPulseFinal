import React from "react";
import {
    Sun,
    Wind,
    Earth,
    Dam,
    Recycle,
    LayoutDashboard,
    Component,
    PlugZap,
    HeartHandshake,
    BadgeCheck,
    MapPinned,
    UserPen,
    SearchIcon,
    Bell,
    Settings,
    UserPlus,
    // Profile Related Icons
    User,
    Mail,
    Lock,
    Shield,
    Camera,
    Save,
    Smartphone,
    AlertTriangle,
    Key,
    Clock,
    FileText,
    Ticket,
    Network,
    Check,
    Upload,
    LogOut,
    MonitorCheck,
    Pencil,
    Trash,
    Send,
    Mails,
    Gauge,
    Zap,
    HandCoins,
    Download

  
} from 'lucide-react';
import { useTheme } from "@emotion/react";
import { Savings } from "@mui/icons-material";

export const IconLibrary = {
    // Sidebar Icons
    solar: Sun,
    wind: Wind,
    geothermal: Earth,
    hydropower: Dam,
    biomass: Recycle,
    modules: Component,
    energyshare: PlugZap,
    help: HeartHandshake,
    recommendation: BadgeCheck,
    myaccount: UserPen,
    ticket: Ticket,
    upload: Upload,
    // Profile Related Icons
    profile: User,
    email: Mail,
    security: Shield,
    notifications: Bell,
    camera: Camera,
    save: Save,
    phone: Smartphone,
    alert: AlertTriangle,
    password: Key,
    activity: Clock,
    document: FileText,
    shield: Shield,
    mail: Mail,
    net: Network,
    check: Check,
    logout: LogOut,
    monitor:  MonitorCheck,
    edit: Pencil,
    trash: Trash,
    send: Send,
    mails: Mails,
    dashboard: Gauge,
    energy: Zap,
    savings: HandCoins,
    download: Download
};

export const IconTools = {
    search: SearchIcon,
    notification: Bell,
    settings: Settings,
    addaccount: UserPlus,
    location: MapPinned,
};

export const AppIcon = ({
    name,
    color,
    type = 'icon',
    size = 20,
    strokeWidth = 1.75,
    ...props
}) => {
    const IconComponent = type === 'tool'
        ? IconTools[name] || Sun
        : IconLibrary[name] || Sun;
    
    const theme = useTheme();
    
    return (
        <IconComponent 
            color={theme?.palette?.elements?.[name] || 'currentColor'}
            size={size}
            strokeWidth={strokeWidth}
            {...props}
        />
    );
};

export default AppIcon;