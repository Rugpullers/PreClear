import { useState } from 'react';
import Clouds from '../../components/Clouds';
import './RoutePlanner.css';

const RoutePlanner = () => {
    const [source, setSource] = useState('');
    const [destination, setDestination] = useState('');
    const [departureTime, setDepartureTime] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Route submitted:', { source, destination, departureTime });
    };

    const handleAmbulance = () => {
        console.log('Ambulance mode activated');
    };

    return (
        <div className="route-planner-container">
            <Clouds />
            <div className="route-planner-card">
                {/* Top bar with title and ambulance button */}
                <div className="route-planner-header">
                    <h2 className="route-planner-title">Route Planner</h2>
                    <button
                        type="button"
                        className="ambulance-btn"
                        onClick={handleAmbulance}
                    >
                        🚑 I'm an Ambulance Driver
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="route-planner-form">
                    {/* Source */}
                    <div className="rp-input-group">
                        <label htmlFor="rp-source">Source</label>
                        <input
                            id="rp-source"
                            type="text"
                            placeholder="Enter starting point"
                            value={source}
                            onChange={(e) => setSource(e.target.value)}
                        />
                    </div>

                    {/* Destination */}
                    <div className="rp-input-group">
                        <label htmlFor="rp-destination">Destination</label>
                        <input
                            id="rp-destination"
                            type="text"
                            placeholder="Enter destination"
                            value={destination}
                            onChange={(e) => setDestination(e.target.value)}
                        />
                    </div>

                    {/* Time of Departure */}
                    <div className="rp-input-group">
                        <label htmlFor="rp-departure">Time of Departure</label>
                        <input
                            id="rp-departure"
                            type="datetime-local"
                            value={departureTime}
                            onChange={(e) => setDepartureTime(e.target.value)}
                        />
                    </div>

                    {/* Submit */}
                    <button type="submit" className="rp-submit-btn">
                        Submit
                    </button>
                </form>
            </div>
        </div>
    );
};

export default RoutePlanner;
