import { useContext, useEffect, useState, useRef } from "react";
import { FaVideo, FaBell, FaUserMd } from "react-icons/fa";
import io from "socket.io-client";
import Peer from "simple-peer";
import { AppContext } from '../context/AppContext.jsx';
import { toast } from 'react-toastify';

const Consultation = () => {
  const [incomingCall, setIncomingCall] = useState(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [callAccepted, setCallAccepted] = useState(false);
  const [isRemoteStreamActive, setIsRemoteStreamActive] = useState(false);
  const { userData, backendUrl, token } = useContext(AppContext);
  const userId = userData?._id;
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerRef = useRef(null);
  const streamRef = useRef(null);
  const signalBuffer = useRef([]);

  const socketRef = useRef(null);
  const callAcceptedRef = useRef(false);
  const isCallActiveRef = useRef(false);

  useEffect(() => {
    callAcceptedRef.current = callAccepted;
  }, [callAccepted]);

  useEffect(() => {
    isCallActiveRef.current = isCallActive;
  }, [isCallActive]);

  const startCamera = async () => {
    if (streamRef.current) {
      console.log('Stream already exists, skipping startCamera');
      return streamRef.current;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      console.log('User camera stream tracks:', stream.getTracks());
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        await localVideoRef.current.play().catch(err => console.error('Local video play error:', err));
      }
      setIsCameraOn(true);
      toast.success('Camera started');
      return stream;
    } catch (err) {
      console.error('Media error details:', err.name, err.message);
      let errorMessage = `Media error: ${err.name} - ${err.message}`;
      if (err.name === 'NotAllowedError') {
        errorMessage = 'Camera/mic access denied. Please allow permissions.';
      } else if (err.name === 'NotFoundError') {
        errorMessage = 'No camera/mic found. Check your device.';
      } else if (err.name === 'OverconstrainedError' || err.name === 'NotReadableError') {
        errorMessage = 'Camera/mic in use. Close other apps or the doctor panel.';
      }
      toast.error(errorMessage);
      return null;
    }
  };

  const initCall = async () => {
    const stream = await startCamera();
    if (stream && localVideoRef.current && incomingCall && !peerRef.current) {
      peerRef.current = new Peer({
        initiator: false,
        trickle: true,
        stream,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
          ],
        },
      });
      console.log('Peer created in user panel:', peerRef.current);

      peerRef.current.on('signal', data => {
        console.log('Signal sent to doctor with stream tracks:', streamRef.current?.getTracks());
        socketRef.current?.emit('signal', {
          signal: data,
          to: incomingCall.doctorId,
          roomId: incomingCall.roomId,
        });
      });

      peerRef.current.on('stream', remoteStream => {
        console.log('Received remote stream with tracks:', remoteStream.getTracks());
        if (remoteVideoRef.current && !remoteVideoRef.current.srcObject) {
          console.log('Assigning remote stream to remoteVideoRef');
          remoteVideoRef.current.srcObject = remoteStream;
          remoteVideoRef.current.play().catch(err => {
            console.error('Remote video play error:', err.name, err.message);
            toast.error(`Failed to play doctor video: ${err.name}`);
          });
          setIsRemoteStreamActive(true);
        }
      });

      peerRef.current.on('connect', () => console.log('WebRTC peer connection established'));

      peerRef.current.on('error', err => {
        console.error('Peer error:', err);
        toast.error('Failed to establish video connection');
        setIsCallActive(false);
        setIsCameraOn(false);
        setIsRemoteStreamActive(false);
      });

      peerRef.current.on('close', () => {
        console.log('Peer connection closed');
        setIsRemoteStreamActive(false);
      });

      console.log('Processing buffered signals:', signalBuffer.current.length);
      signalBuffer.current.forEach(({ signal }) => peerRef.current.signal(signal));
      signalBuffer.current = [];
    } else {
      console.error('Failed to initialize call:', {
        hasStream: !!stream,
        hasLocalVideoRef: !!localVideoRef.current,
        hasIncomingCall: !!incomingCall,
        hasPeer: !!peerRef.current,
      });
      setIsCallActive(false);
      toast.error('Failed to initialize call: Missing stream, refs, or incoming call');
    }
  };

  const handleJoin = () => {
    if (!incomingCall?.roomId || callAccepted) return;
    setIsCallActive(true);
    if (peerRef.current) {
      peerRef.current.destroy();
      peerRef.current = null;
    }
    console.log('Emitting call-accepted with doctorId:', incomingCall.doctorId);
    socketRef.current?.emit('call-accepted', {
      userId,
      doctorId: incomingCall.doctorId,
      roomId: incomingCall.roomId,
    });
    setCallAccepted(true);
    toast.success('Joining consultation...');
    initCall();
  };

  const handleEndCall = () => {
    if (peerRef.current) {
      peerRef.current.destroy();
      peerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCallActive(false);
    setIsCameraOn(false);
    setCallAccepted(false);
    setIncomingCall(null);
    setIsRemoteStreamActive(false);
    signalBuffer.current = [];
    // toast.info('Consultation ended');
  };

  useEffect(() => {
    if (!backendUrl || !token) return;
    if (socketRef.current) return;

    const socket = io(backendUrl, {
      auth: { token },
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      transports: ['polling', 'websocket'],
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('User panel Socket.IO connected:', socket.id);
      if (userId) {
        socket.emit('join-user-room', userId);
      }
    });

    socket.on('connect_error', err => {
      console.error('User panel Socket.IO connection error:', err.message);
      toast.error(`Connection error: ${err.message}`);
    });

    socket.on('consultation-request', ({ doctorName, roomId, doctorId }) => {
      console.log('Received consultation-request:', { doctorName, roomId, doctorId });
      if (doctorId && !callAcceptedRef.current) {
        setIncomingCall({ doctorName, roomId, doctorId });
        toast.info(`New consultation request from Dr. ${doctorName}`);
      }
    });

    socket.on('connection-confirmed', ({ userId, doctorId, roomId }) => {
      console.log(`Connected: User ${userId} with Doctor ${doctorId} in room ${roomId}`);
      toast.success('Connected to doctor successfully!');
    });

    socket.on('signal', ({ signal, from }) => {
      console.log('Signal received from:', from);
      if (peerRef.current && isCallActiveRef.current) {
        peerRef.current.signal(signal);
      } else {
        console.log('Buffering signal from:', from);
        signalBuffer.current.push({ signal, from });
      }
    });

    return () => {
      socket.off('connect');
      socket.off('connect_error');
      socket.off('consultation-request');
      socket.off('connection-confirmed');
      socket.off('signal');
      socket.disconnect();
      socketRef.current = null;
    };
  }, [backendUrl, token, userId]);

  useEffect(() => {
    if (!userId || !socketRef.current) return;
    if (socketRef.current.connected) {
      socketRef.current.emit('join-user-room', userId);
    }
  }, [userId]);

  return (
    <div className="flex min-h-screen w-full min-w-0 items-center justify-center bg-gradient-to-br from-teal-50 to-teal-200 p-3 sm:p-6 md:p-8">
      <div className="w-full max-w-5xl rounded-2xl bg-white p-4 shadow-2xl sm:p-8">
        {/* Header */}
        <div className="mb-6 flex flex-wrap items-center justify-center gap-3 text-center text-teal-600">
          <FaUserMd className="text-3xl sm:text-4xl" />
          <h1 className="text-2xl font-bold sm:text-3xl">Consultation Portal</h1>
        </div>

        {/* No Call Active and Incoming Call */}
        {!isCallActive && incomingCall ? (
          <div className="text-center">
            <div className="mb-6 flex items-center justify-center gap-3 text-amber-500">
              <FaBell className="text-2xl animate-pulse sm:text-3xl" />
              <p className="text-lg font-semibold sm:text-xl">
                Dr. {incomingCall.doctorName} is requesting a consultation
              </p>
            </div>
            <button
              onClick={handleJoin}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-teal-600 px-6 py-3 text-lg font-semibold text-white shadow-lg hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 sm:w-auto sm:text-xl"
            >
              <FaVideo className="text-xl sm:text-2xl" />
              Join Consultation
            </button>
          </div>
        ) : !isCallActive ? (
          <p className="text-center text-lg text-gray-600 sm:text-xl">
            Awaiting consultation request...
          </p>
        ) : (
          <div>
            {/* Video Feeds */}
            <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Local Video */}
              <div className="flex flex-col">
                <label className="mb-2 text-sm font-medium text-gray-700 sm:text-base">
                  Your Camera
                </label>
                <div className="relative h-64 w-full overflow-hidden rounded-xl border border-gray-300 bg-gray-900 sm:h-80">
                  {!isCameraOn && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-800/80 text-white text-center text-sm sm:text-base">
                      Starting camera... <br /> (Ensure no other apps are using the camera)
                    </div>
                  )}
                  <video
                    ref={localVideoRef}
                    autoPlay
                    muted
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
              {/* Remote Video */}
              <div className="flex flex-col">
                <label className="mb-2 text-sm font-medium text-gray-700 sm:text-base">
                  Doctors Camera
                </label>
                <div className="relative h-64 w-full overflow-hidden rounded-xl border border-gray-300 bg-gray-900 sm:h-80">
                  {!isRemoteStreamActive && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-800/80 text-white text-center text-sm sm:text-base">
                      Waiting for doctor to join...
                    </div>
                  )}
                  <video
                    ref={remoteVideoRef}
                    autoPlay
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Status and Controls */}
            <div className="text-center">
              <p
                className={`text-lg sm:text-xl ${
                  isCameraOn ? 'text-teal-600' : 'text-gray-600'
                }`}
              >
                {isCameraOn ? 'Connected and camera active' : 'Connecting...'}
              </p>
              <p className="mt-2 text-sm text-gray-500 sm:text-base">
                * Use headphones to avoid audio feedback.
              </p>
              <button
                onClick={handleEndCall}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-6 py-3 text-lg font-semibold text-white shadow-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:w-auto sm:text-xl"
              >
                End Consultation
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Consultation; 
