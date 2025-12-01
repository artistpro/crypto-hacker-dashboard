import CryptoChart from './components/CryptoChart';
import InfoPanel from './components/InfoPanel';
import Ticker from './components/Ticker';
import Terminal from './components/Terminal';
import HackerGif from './components/HackerGif';
import { Shield, Activity, Database, Lock } from 'lucide-react';
import hackerAnimation from './assets/hacker-animation.gif';

import DigitalMarquee from './components/DigitalMarquee';

import AdminConsole from './components/AdminConsole';

function App() {
  // Simple routing based on pathname
  const path = window.location.pathname;

  if (path === '/admin') {
    return <AdminConsole />;
  }

  return (
    <>
      <div className="scanlines"></div>
      <div className="grid-container">

        {/* Header */}
        <header style={{ gridColumn: '1 / -1', gridRow: '1', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '2px solid #0f0', padding: '0 1rem' }}>
          <h1 className="text-glow" style={{ fontSize: '1.5rem' }}>BCH_MONITOR_SYSTEM_V1.1.01</h1>
          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem' }}>
            <span className="flicker">STATUS: ONLINE</span>
            <span>SECURE_CONNECTION</span>
            <span>IP: 127.0.0.1</span>
          </div>
        </header>

        {/* Main Chart */}
        <div className="panel" style={{ gridColumn: '1 / 7', gridRow: '2 / 9' }}>
          <div className="panel-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Activity size={16} />
              <span>LIVE_MARKET_DATA [BCH/USDT]</span>
            </div>
            <div className="panel-controls">
              <span></span><span></span><span></span>
            </div>
          </div>
          <CryptoChart />
        </div>

        {/* Visual Feed (GIF) */}
        <div className="panel" style={{ gridColumn: '7 / 10', gridRow: '2 / 9' }}>
          <div className="panel-header">
            <span>VISUAL_FEED</span>
          </div>
          <HackerGif
            src={hackerAnimation}
            caption="TARGET_ACQUIRED"
          />
        </div>

        {/* Info Panel */}
        <div className="panel" style={{ gridColumn: '10 / -1', gridRow: '2 / 6' }}>
          <div className="panel-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Database size={16} />
              <span>ASSET_INTELLIGENCE</span>
            </div>
            <div className="panel-controls">
              <span></span><span></span>
            </div>
          </div>
          <InfoPanel />
        </div>

        {/* Terminal */}
        <div className="panel" style={{ gridColumn: '10 / -1', gridRow: '6 / 9' }}>
          <div className="panel-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Shield size={16} />
              <span>SYSTEM_LOGS</span>
            </div>
            <div className="panel-controls">
              <span></span>
            </div>
          </div>
          <Terminal />
        </div>

        {/* Bottom Section - Encryption */}
        <div className="panel" style={{ gridColumn: '1 / 5', gridRow: '9 / 12' }}>
          <div className="panel-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Lock size={16} />
              <span>ENCRYPTION</span>
            </div>
          </div>
          <div style={{ fontSize: '0.7rem', wordBreak: 'break-all', opacity: 0.7 }}>
            {Array(20).fill(0).map((_, i) => (
              <span key={i} style={{ opacity: Math.random() }}>
                {Math.random().toString(36).substring(2)}
              </span>
            ))}
          </div>
        </div>

        <div className="panel" style={{ gridColumn: '5 / -1', gridRow: '9 / 12' }}>
          <div className="panel-header">
            <span>NETWORK_TRAFFIC</span>
          </div>
          {/* Placeholder for network traffic viz */}
          <div style={{ height: '100%', display: 'flex', alignItems: 'flex-end', gap: '2px' }}>
            {Array(50).fill(0).map((_, i) => (
              <div key={i} style={{
                width: '100%',
                height: `${Math.random() * 100}%`,
                background: '#0f0',
                opacity: 0.5
              }}></div>
            ))}
          </div>
        </div>

      </div>

      <DigitalMarquee message="*** ALERT: WHALE MOVEMENT DETECTED *** BCH ACCUMULATION ZONE *** CRYPTOMINDERS SIGNAL: BUY ***" />

      <Ticker />
    </>
  );
}

export default App;
