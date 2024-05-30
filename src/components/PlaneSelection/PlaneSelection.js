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
            <button onClick={() => handlePlaneSelect(1)}>Plane 1</button>
            <button onClick={() => handlePlaneSelect(2)}>Plane 2</button>
        </div>
    );
};

export default PlaneSelection;
