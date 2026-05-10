import { useEffect, useRef } from 'react';
import executiveService from '../services/executiveService';

export default function useAttendanceTracking() {
    const lastHeartbeat = useRef(0);
    const intervalRef = useRef(null);

    useEffect(() => {
        const sendHeartbeat = async () => {
            const now = Date.now();
            // Minimum 45 seconds between heartbeats to prevent spam
            if (now - lastHeartbeat.current < 45000) return;

            try {
                const isAppVisible = document.visibilityState === 'visible';
                
                // Get Geolocation
                if ("geolocation" in navigator) {
                    navigator.geolocation.getCurrentPosition(async (position) => {
                        const { latitude, longitude } = position.coords;
                        
                        await executiveService.sendHeartbeat({
                            lat: latitude,
                            lng: longitude,
                            isAppVisible
                        });
                        
                        lastHeartbeat.current = now;
                    }, async (err) => {
                        console.warn('Geolocation failed, sending heartbeat without location', err);
                        await executiveService.sendHeartbeat({
                            isAppVisible
                        });
                        lastHeartbeat.current = now;
                    }, {
                        enableHighAccuracy: true,
                        timeout: 5000,
                        maximumAge: 0
                    });
                } else {
                    await executiveService.sendHeartbeat({ isAppVisible });
                    lastHeartbeat.current = now;
                }
            } catch (error) {
                console.error('Heartbeat failed', error);
            }
        };

        // Initial heartbeat
        sendHeartbeat();

        // Setup interval (every 60 seconds)
        intervalRef.current = setInterval(sendHeartbeat, 60000);

        // Visibility change listener
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                sendHeartbeat();
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);
}
