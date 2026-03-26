import VantaBackground from '../Clouds';
import Loader from '../Loader/Loader';
import './LoadingOverlay.css';

const LoadingOverlay = () => {
    return (
        <div className="loading-overlay">
            <div className="loading-background">
                <VantaBackground />
            </div>
            <div className="loader-container">
                <Loader />
            </div>
        </div>
    );
};

export default LoadingOverlay;
