import { useNavigate } from 'react-router-dom';
import Clouds from '../../components/Clouds';
import './AboutPage.css';

const AboutPage = () => {
    const navigate = useNavigate();

    return (
        <div className="about-page-container">
            <Clouds />
            <div className="about-content">
                <h1 className="about-title"><u>About PreClear</u></h1>
                <br />

                <div className="about-section">
                    <h2>Overview</h2>
                    <p>
                        PreClear is an AI-powered traffic intelligence system that predicts
                        congestion and optimizes traffic flow in real time, making urban
                        mobility faster and more efficient.
                    </p>
                </div>

                <div className="about-section">
                    <h2>Problem</h2>
                    <p>
                        Cities face heavy congestion, poor signal coordination, and
                        delays—especially for emergency vehicles. Current systems react
                        too late instead of preventing traffic buildup.
                    </p>
                </div>

                <div className="about-section">
                    <h2>Solution</h2>
                    <p>
                        PreClear uses predictive analysis to anticipate traffic conditions
                        and dynamically adjust signals, ensuring smoother flow and faster
                        response times.
                    </p>
                </div>

                <div className="about-section">
                    <h2>Key Features</h2>
                    <ul className="about-features">
                        <li>Predicts congestion before it happens</li>
                        <li>Smart signal timing optimization</li>
                        <li>Emergency route prioritization</li>
                        <li>Route planning based on conditions</li>
                    </ul>
                </div>

                <div className="about-section">
                    <h2>Impact</h2>
                    <p>
                        Reduces travel time, improves emergency response, and supports
                        smarter, more efficient cities.
                    </p>
                </div>

                <button className="about-back-btn" onClick={() => navigate('/home')}>
                    ← Back to Home
                </button>
            </div>
        </div>
    );
};

export default AboutPage;
