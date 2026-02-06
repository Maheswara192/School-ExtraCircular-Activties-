
import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
    // Initialize socket once
    const [socket] = useState(() => io('http://localhost:5000', {
        withCredentials: true,
        transports: ['websocket', 'polling'],
        autoConnect: true,
    }));

    useEffect(() => {
        socket.on('connect', () => {
            console.log('Socket Connected:', socket.id);
        });

        socket.on('disconnect', () => {
            console.log('Socket Disconnected');
        });

        return () => {
            socket.close();
        };
    }, [socket]);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useSocket = () => useContext(SocketContext);
