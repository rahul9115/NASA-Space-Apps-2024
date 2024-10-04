import './SliderButton.css';
import { useState } from 'react';
import { useSource } from '../../../SourceContext';

function SliderButton() {
    const [work, setWork] = useState(false);
    const {source, setSource} = useSource();

    function handleClick() {
        var type = "work"
        if (work) {
            type = "web"
        }
        setWork(!work);
        setSource(prev => ({
            ...prev,
            'work':!work,
            'type':type,
            'recs':true
        }));
    }

    return (
        <div className="pill" onClick={handleClick}>
            <div className="bg-pill right">Work</div>
            <div className="bg-pill left">Web</div>
            <div className={`inner-pill ${source.type == 'work' ? 'right' : 'left'}`}>{source.type == 'work' ? 'Work' : 'Web'}</div>
        </div>
    );
}

export default SliderButton;