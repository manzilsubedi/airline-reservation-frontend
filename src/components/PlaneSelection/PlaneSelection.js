import React from 'react';
import { useNavigate } from 'react-router-dom';
import './PlaneSelection.css';

const PlaneSelection = ({ onSelectPlane }) => {
    const navigate = useNavigate();

    const handlePlaneSelect = (planeId) => {
        onSelectPlane(planeId);
        navigate('/seat-selection');
    };

    return (
        <div className="plane-selection">
            <h2>Select a Plane</h2>
            <button onClick={() => handlePlaneSelect('66587ad30cef16eb96e7fedc')}>Plane 1</button>
            <button onClick={() => handlePlaneSelect('66587ae20cef16eb96e81a6b')}>Plane 2</button>
        </div>
    );
};

export default PlaneSelection;
