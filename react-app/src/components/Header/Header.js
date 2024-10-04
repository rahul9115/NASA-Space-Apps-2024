import {useState, useEffect} from "react";
import '../../utilities/colors.css';
import "./Header.css"
import CircleInitials from "./CircleInitials";
import SliderButton from "./SliderButton/SliderButton";
import { useSource } from "../../SourceContext";
import { getRandomString } from "../../utilities/general";
import axios from "axios";
import { FaMapPin } from "react-icons/fa";
import { PiPlantBold } from "react-icons/pi";
import { BarLoader } from "react-spinners";


function Header({slider=true, style}) {

    const {source, setSource} = useSource();
    const [coordinates, setCoordinates] = useState({});
    const [isLoading, setIsLoading] = useState(true);

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(success, error);
      } else {
        console.log("Geolocation not supported");
      }
      
      function success(position) {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        setCoordinates({ latitude, longitude });
        setTimeout(() => {
            setIsLoading(false);
        }, 0)
      }
      
      function error() {
        console.log("Unable to retrieve your location");
      }

    const handleClick = () => {
        setSource(prev => ({
            ...prev,
            session: {
                session_id: getRandomString(16),
                user_id: source.user.user_id,
                summary: "",
                messages: [],
                create_datetime: new Date().toUTCString(),
                update_datetime: new Date().toUTCString()
            }
        }));
    }

    return (
        <div className="header-cont" style={style}>
            <div className="header">
                <div className="title">
                    <PiPlantBold size='2.5rem' color='var(--header-title)'/>
                    {
                        source.type === "web" ? 
                        <div onClick={handleClick} className="header-title">AgriDash</div> 
                        : 
                        <a href='/' className="header-title">AgriDash</a> 
                    }
                </div>
                <div className="header-loc"> {isLoading ? <BarLoader color="var(--circle-bg)"/> : `${Math.round(coordinates.latitude * 100) / 100}, ${Math.round(coordinates.longitude * 100) / 100}`} <FaMapPin size='1.4rem' color='var(--header-title)'/> </div> 
            </div>
            {/* {showNav ? <NavBox user={currentAccount.username} showNav={showNav} setShowNav={setShowNav}/> : <></>} */}
        </div>
    )
}

export default Header