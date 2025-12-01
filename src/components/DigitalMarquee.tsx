import React from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '../firebase';

interface DigitalMarqueeProps {
  message?: string;
}

const DigitalMarquee: React.FC<DigitalMarqueeProps> = ({
  message: initialMessage = "SYSTEM ALERT: MONITORING ACTIVE // WELCOME ARTIST PRO // BCH NETWORK SECURE"
}) => {
  const [text, setText] = React.useState(initialMessage);

  React.useEffect(() => {
    const messageRef = ref(db, 'marquee/message');

    const unsubscribe = onValue(messageRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setText(data);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="digital-marquee-container">
      {/* LED Grid Background Texture */}
      <div className="led-grid"></div>

      <div className="marquee-content">
        {text}
      </div>

      <style>{`
        .digital-marquee-container {
          width: 100%;
          height: 40px;
          background: #000;
          border-top: 2px solid #0f0;
          border-bottom: 2px solid #0f0;
          position: fixed;
          bottom: 2.5rem; /* Height of the ticker */
          left: 0;
          overflow: hidden;
          display: flex;
          align-items: center;
          z-index: 99;
        }

        .led-grid {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-image: radial-gradient(rgba(0, 50, 0, 0.3) 1px, transparent 1px);
          background-size: 4px 4px;
          z-index: 1;
          pointer-events: none;
        }

        .marquee-content {
          white-space: nowrap;
          color: #0f0;
          font-family: 'Courier New', monospace;
          font-size: 1.2rem;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 2px;
          animation: scrollRightToLeft 25s linear infinite;
          position: absolute;
          text-shadow: 0 0 5px #0f0;
        }

        @keyframes scrollRightToLeft {
          0% {
            transform: translateX(100vw);
          }
          100% {
            transform: translateX(-100%);
          }
        }
      `}</style>
    </div>
  );
};

export default DigitalMarquee;
