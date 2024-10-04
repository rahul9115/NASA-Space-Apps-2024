import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHome, FaSignOutAlt } from "react-icons/fa";
import { PiSignOutBold } from "react-icons/pi";
import { MdOutlineAnalytics } from "react-icons/md";
import { IoAnalytics } from "react-icons/io5";
import { TbFileDatabase } from "react-icons/tb";
import useClickOutside from '../../../hooks/useClickOutside';
import {useMsal} from "@azure/msal-react";
import { useSource } from '../../../SourceContext';

import './NavBox.css'

const NavBox = ({user, showNav, setShowNav}) => {
    const navigate = useNavigate();
    const {instance} = useMsal();
    const {source, setSource} = useSource();

    const onSignOut = () => {
        instance.logoutRedirect();
    }

    const handleClickOutside = () => {
        setShowNav(false);
    };

    const ref = useClickOutside(handleClickOutside);

    return (
        <div className='navbox' ref={ref}>
            {source.user.type > 2 ? 
            <>
                <div className="navbox-option" onClick={() => navigate('/')}>
                    <div className='nav-option-text'><FaHome size={"1.1rem"} style={{marginRight:".7rem"}}/> Home</div>
                </div>
                <div className="navbox-option" onClick={() => navigate('/admin')}>
                    <div className='nav-option-text'><TbFileDatabase size={"1.1rem"} style={{marginRight:".7rem"}}/> Data Admin</div>
                </div>
                {source.user.type > 3 ? 
                <>
                    <div className="navbox-option" onClick={() => navigate('/analytics')}>
                        <div className='nav-option-text'><MdOutlineAnalytics size={"1.1rem"} style={{marginRight:".7rem"}}/> User Analytics</div>
                    </div>
                </> : <></>}
                <div className="divider"/>
            </>
            :<></>}
            <div className="navbox-option" onClick={onSignOut}>
                <div className='nav-option-text'><PiSignOutBold size={"1.1rem"} style={{marginRight:".7rem"}}/> Log out</div>
            </div>
        </div>
    );
};

export default NavBox;