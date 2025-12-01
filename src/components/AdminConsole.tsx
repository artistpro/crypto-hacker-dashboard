import React, { useState } from 'react';

const AdminConsole: React.FC = () => {
    const [input, setInput] = useState('');
    const [status, setStatus] = useState('READY');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        // Save to localStorage
        localStorage.setItem('marquee_message', input);

        // Dispatch event for same-tab updates
        window.dispatchEvent(new Event('marquee-update'));

        setStatus('BROADCAST_SENT');
        setInput('');
        setTimeout(() => setStatus('READY'), 2000);
    };

    return (
        <div style={{
            height: '100vh',
            background: '#000',
            color: '#0f0',
            fontFamily: 'monospace',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '2rem'
        }}>
            <div style={{ width: '100%', maxWidth: '600px', border: '1px solid #0f0', padding: '2rem' }}>
                <h1 className="flicker" style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    COMMAND_OVERRIDE_CONSOLE
                </h1>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <label style={{ fontSize: '0.8rem', opacity: 0.8 }}>ENTER_NEW_BROADCAST_MESSAGE:</label>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        style={{
                            background: '#001100',
                            border: '1px solid #0f0',
                            color: '#0f0',
                            padding: '1rem',
                            fontFamily: 'monospace',
                            fontSize: '1.2rem',
                            outline: 'none'
                        }}
                        autoFocus
                    />
                    <button
                        type="submit"
                        style={{
                            background: '#0f0',
                            color: '#000',
                            border: 'none',
                            padding: '1rem',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            fontFamily: 'monospace'
                        }}
                    >
                        EXECUTE_OVERRIDE
                    </button>
                </form>

                <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.8rem', color: status === 'BROADCAST_SENT' ? '#0f0' : '#444' }}>
                    STATUS: [{status}]
                </div>
            </div>

            <div className="scanlines"></div>
        </div>
    );
};

export default AdminConsole;
