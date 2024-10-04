import React from 'react';

const CircleInitials = ({ email, name, showNav, setShowNav }) => {
    function getInitials(name) {
        const cleanedName = name.replace(/\s*\(.*?\)\s*/g, '');
        const words = cleanedName.split(' ');
        
        const firstName = words[0];
        const lastName = words[words.length - 1];
        
        const initials = firstName.charAt(0) + lastName.charAt(0);
        
        return initials.toUpperCase();
    }

    const handleClick = () => {
        setShowNav(!showNav);
    }

    function simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash = hash & hash;
        }
        return hash.toString(16);
    }

    return (
        <div className="circle-icon" onClick={handleClick}>
            {getInitials(name)}
        </div>
    );
}

export default CircleInitials;