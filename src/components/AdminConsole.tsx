import React, { useState, useEffect } from 'react';
import { ref, set, onValue } from 'firebase/database';
import { db } from '../firebase';

const AdminConsole: React.FC = () => {
    const [input, setInput] = useState('');
    const [status, setStatus] = useState('READY');
    const [soundEnabled, setSoundEnabled] = useState(true);

    useEffect(() => {
        const soundRef = ref(db, 'settings/soundEnabled');
        const unsubscribe = onValue(soundRef, (snapshot) => {
            const val = snapshot.val();
            if (val !== null) {
                setSoundEnabled(val);
            }
        });
        return () => unsubscribe();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        try {
            // Save to Firebase Realtime Database
            await set(ref(db, 'marquee/message'), input);

            setStatus('BROADCAST_SENT_GLOBAL');
            setInput('');
            setTimeout(() => setStatus('READY'), 2000);
        } catch (error) {
            console.error("Error sending broadcast:", error);
            setStatus('ERROR_SENDING');
        }
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

                <div style={{ marginTop: '3rem', borderTop: '1px solid #0f0', paddingTop: '2rem' }}>
                    <h2 style={{ fontSize: '1rem', marginBottom: '1rem', textAlign: 'center' }}>SYSTEM_CONTROLS</h2>
                    <button
                        onClick={async () => {
                            try {
                                const newStatus = !soundEnabled;
                                await set(ref(db, 'settings/soundEnabled'), newStatus);
                                setSoundEnabled(newStatus);
                            } catch (e) {
                                console.error(e);
                            }
                        }}
                        style={{
                            width: '100%',
                            background: soundEnabled ? '#0f0' : '#330000',
                            color: soundEnabled ? '#000' : '#f00',
                            border: '1px solid #0f0',
                            padding: '1rem',
                            cursor: 'pointer',
                            fontFamily: 'monospace',
                            fontWeight: 'bold',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: '1rem'
                        }}
                    >
                        BLOCK_ALERT_SOUND: [{soundEnabled ? 'ENABLED' : 'DISABLED'}]
                    </button>
                </div>

                <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.8rem', color: status === 'BROADCAST_SENT_GLOBAL' ? '#0f0' : '#444' }}>
                    STATUS: [{status}]
                </div>
            </div>

            <div className="scanlines"></div>
        </div>
    );
};

export default AdminConsole;
