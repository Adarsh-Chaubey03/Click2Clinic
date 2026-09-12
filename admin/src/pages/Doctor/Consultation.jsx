import { useContext, useState, useEffect, useRef } from "react";
import { FaVideo, FaUserMd, FaSearch } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";
import axios from "axios";
import Peer from "simple-peer";
import { DoctorContext } from '../../context/DoctorContext.jsx';
import { toast } from 'react-toastify';

const Consultation = () => {
  const [userEmail, setUserEmail] = useState("");
  const [userId, setUserId] = useState(null);
  const [consultationId, setConsultationId] = useState(null);
  const [isRequesting, setIsRequesting] = useState(false);
  const [error, setError] = useState("");
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [callAccepted, setCallAccepted] = useState(false);
  const [isRemoteStreamActive, setIsRemoteStreamActive] = useState(false);
  const { backendUrl, dToken, profileData, getProfileData } = useContext(DoctorContext);
  const navigate = useNavigate();
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerRef = useRef(null);
  const streamRef = useRef(null);
  const signalBuffer = useRef([]);

  const socketRef = useRef(null);
  const callAcceptedRef = useRef(false);
  const doctorIdRef = useRef(null);

  useEffect(() => {
    callAcceptedRef.current = callAccepted;
  }, [callAccepted]);

  useEffect(() => {
    doctorIdRef.current = profileData?._id || null;
  }, [profileData?._id]);

  const startCamera = async () => {
    if (streamRef.current) {
      console.log('Stream already exists, skipping startCamera');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      console.log('Doctor camera stream tracks:', stream.getTracks());
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        await localVideoRef.current.play().catch(err => console.error('Local video play error:', err));
      }
      setIsCameraOn(true);
      toast.success('Doctor camera started');
    } catch (err) {
      console.error('Media error details:', err.name, err.message);
      let errorMessage = `Media error: ${err.name} - ${err.message}`;
      if (err.name === 'NotAllowedError') errorMessage = 'Camera/mic access denied.';
      else if (err.name === 'NotFoundError') errorMessage = 'No camera found.';
      else if (err.name === 'OverconstrainedError' || err.name === 'NotReadableError') {
        errorMessage = 'Camera/mic in use. Close other apps or the user panel.';
      }
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const startPeerConnection = (userId, roomId) => {
    if (!streamRef.current) {
      console.error('No stream available for peer connection');
      toast.error('Camera not ready. Please try again.');
      return;
    }
    if (peerRef.current) {
      console.log('Peer already exists, skipping creation');
      return;
    }

    try {
      peerRef.current = new Peer({
        initiator: true,
        trickle: true,
        stream: streamRef.current,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
          ],
        },
      });
      console.log('Peer created in doctor panel:', peerRef.current);

      peerRef.current.on('signal', data => {
        console.log('Signal sent to user:', userId);
        socketRef.current?.emit('signal', { signal: data, to: userId, roomId });
      });

      peerRef.current.on('stream', remoteStream => {
        console.log('Remote stream received:', remoteStream.getTracks());
        if (remoteVideoRef.current && !remoteVideoRef.current.srcObject) {
          console.log('Assigning remote stream to remoteVideoRef');
          remoteVideoRef.current.srcObject = remoteStream;
          remoteVideoRef.current.play().catch(err => {
            console.error('Remote video play error:', err.name, err.message);
            toast.error(`Failed to play user video: ${err.name}`);
          });
          setIsRemoteStreamActive(true);
        }
      });

      peerRef.current.on('connect', () => console.log('WebRTC peer connection established'));
      peerRef.current.on('error', err => {
        console.error('Peer error:', err);
        toast.error('Failed to establish video connection');
        setIsRemoteStreamActive(false);
      });
      peerRef.current.on('close', () => {
        console.log('Peer connection closed');
        setIsRemoteStreamActive(false);
      });

      console.log('Processing buffered signals:', signalBuffer.current.length);
      signalBuffer.current.forEach(({ signal }) => peerRef.current.signal(signal));
      signalBuffer.current = [];
    } catch (err) {
      console.error('Failed to create Peer instance:', err);
      toast.error('Error initializing video call');
    }
  };

  const handleAcceptCall = () => {
    if (!userId || !streamRef.current || !profileData?._id || !consultationId || callAccepted) {
      console.log('Cannot accept call:', { userId, stream: !!streamRef.current, doctorId: profileData?._id, consultationId, callAccepted });
      return;
    }
    console.log('Starting peer connection for user:', userId);
    startPeerConnection(userId, consultationId);
    setCallAccepted(true);
    toast.success('Call accepted!');
  };

  useEffect(() => {
    if (!backendUrl || !dToken) return;
    if (socketRef.current) return;

    const socket = io(backendUrl, {
      auth: { token: dToken },
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      transports: ['polling', 'websocket'],
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Socket.IO connected:', socket.id);
      if (doctorIdRef.current) {
        socket.emit('join-doctor-room', doctorIdRef.current);
        console.log('Emitted join-doctor-room with doctorId:', doctorIdRef.current);
      }
    });

    socket.on('connect_error', err => {
      console.error('Socket.IO error:', err.message);
      toast.error('Failed to connect to server');
    });

    socket.on('call-accepted', ({ userId, doctorId, roomId }) => {
      if (callAcceptedRef.current) {
        console.log('Ignoring redundant call-accepted:', { userId, doctorId, roomId });
        return;
      }
      console.log('Call accepted:', { userId, doctorId: doctorId || doctorIdRef.current, roomId });
      toast.success('User accepted the consultation!');
      setUserId(userId);
      setConsultationId(roomId);
      startPeerConnection(userId, roomId);
      setCallAccepted(true);
    });

    socket.on('signal', ({ signal, from }) => {
      console.log('Signal received from:', from);
      if (peerRef.current) {
        peerRef.current.signal(signal);
      } else {
        console.log('Buffering signal from:', from);
        signalBuffer.current.push({ signal, from });
      }
    });

    socket.on('connection-confirmed', ({ userId, doctorId, roomId }) => {
      console.log(`Connected: Doctor ${doctorId} with User ${userId} in ${roomId}`);
      toast.success('Connected to user successfully!');
    });

    return () => {
      socket.off('connect');
      socket.off('connect_error');
      socket.off('call-accepted');
      socket.off('signal');
      socket.off('connection-confirmed');
      socket.disconnect();
      socketRef.current = null;
      if (peerRef.current) {
        peerRef.current.destroy();
        peerRef.current = null;
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      signalBuffer.current = [];
    };
  }, [backendUrl, dToken]);

  useEffect(() => {
    if (!profileData?._id || !socketRef.current) return;
    if (socketRef.current.connected) {
      socketRef.current.emit('join-doctor-room', profileData._id);
      console.log('Emitted join-doctor-room with doctorId:', profileData._id);
    }
  }, [profileData?._id]);

  useEffect(() => {
    if (dToken && !profileData) {
      getProfileData();
    }
  }, [dToken, profileData, getProfileData]);

  useEffect(() => {
    if (userId && profileData?._id) {
      startCamera();
    } else if (!userId && streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      setIsCameraOn(false);
    }
  }, [userId, profileData]);

  const getUserId = async email => {
    try {
      const { data } = await axios.post(`${backendUrl}/api/user/userId`, { email });
      if (data.success) {
        setUserId(data.userId);
        toast.success("User found successfully!");
        return data.userId;
      } else {
        setUserId(null);
        toast.error("User not found");
        setError("User not found");
        return null;
      }
    } catch (error) {
      const errorMessage = "Error fetching user ID";
      console.error("Error fetching user ID:", error);
      toast.error(errorMessage);
      setUserId(null);
      setError(errorMessage);
      return null;
    }
  };

  const handleFindUser = async () => {
    if (!userEmail) {
      setError("Please enter a user email");
      toast.error("Please enter a user email");
      return;
    }
    setIsRequesting(true);
    await getUserId(userEmail);
    setIsRequesting(false);
  };

  const handleConsult = async () => {
    if (!profileData?._id) {
      setError("Doctor ID is missing. Please log in again.");
      toast.error("Doctor ID is missing. Please log in again.");
      navigate('/login');
      return;
    }

    if (!userId) {
      setError("Please find a user first");
      toast.error("Please find a user first");
      return;
    }

    setIsRequesting(true);
    setError("");

    try {
      const response = await axios.post(
        `${backendUrl}/api/consultation/initiate`,
        { userId },
        { headers: { dToken } }
      );
      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to initiate consultation");
      }
      const { consultationId } = response.data;
      setConsultationId(consultationId);
      toast.success("Consultation request sent!");
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to initiate consultation";
      console.error("Consultation error:", error);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsRequesting(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full min-w-0 items-center justify-center bg-gradient-to-br from-indigo-50 to-indigo-200 p-3 sm:p-6 md:p-8">
      <div className="w-full max-w-5xl rounded-2xl bg-white p-4 shadow-2xl sm:p-8">
        {/* Header */}
        <div className="mb-6 flex flex-wrap items-center justify-center gap-3 text-center text-indigo-600">
          <FaUserMd className="text-3xl sm:text-4xl" />
          <h1 className="text-2xl font-bold sm:text-3xl">Doctor Consultation Portal</h1>
        </div>

        {/* Email Input */}
        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-gray-700 sm:text-base">
            Enter User Email
          </label>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <input
              type="email"
              value={userEmail}
              onChange={e => {
                setUserEmail(e.target.value);
                setError("");
                setUserId(null);
                if (streamRef.current) {
                  streamRef.current.getTracks().forEach(track => track.stop());
                  setIsCameraOn(false);
                }
              }}
              placeholder="Enter user email from appointment"
              className={`w-full rounded-lg border px-4 py-3 text-sm focus:outline-none focus:ring-2 sm:text-base ${
                error ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-indigo-500"
              }`}
              disabled={isRequesting}
            />
            <button
              onClick={handleFindUser}
              disabled={isRequesting}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 sm:text-base"
            >
              <FaSearch />
              Find User
            </button>
          </div>
          {error && <p className="mt-2 text-sm text-red-500 sm:text-base">{error}</p>}
        </div>

        {/* Video Feeds */}
        {userId && (
          <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Local Video */}
            <div className="flex flex-col">
              <label className="mb-2 text-sm font-medium text-gray-700 sm:text-base">
                Your Camera
              </label>
              <div className="relative h-64 w-full overflow-hidden rounded-xl border border-gray-300 bg-gray-900 sm:h-80">
                {!isCameraOn && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-800/80 text-white text-center text-sm sm:text-base">
                    {error ? error : 'Starting camera... (Ensure no other apps are using the camera)'}
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
                Users Camera
              </label>
              <div className="relative h-64 w-full overflow-hidden rounded-xl border border-gray-300 bg-gray-900 sm:h-80">
                {!isRemoteStreamActive && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-800/80 text-white text-center text-sm sm:text-base">
                    Waiting for user to join...
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
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <button
            onClick={handleConsult}
            disabled={isRequesting || !userId || !isCameraOn}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 sm:w-auto sm:text-base"
          >
            <FaVideo />
            {isRequesting ? "Requesting..." : "Start Consultation"}
          </button>
          {userId && consultationId && (
            <button
              onClick={handleAcceptCall}
              disabled={!isCameraOn || callAccepted}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 sm:w-auto sm:text-base"
            >
              <FaVideo />
              Accept Call
            </button>
          )}
        </div>

        {/* Note */}
        <p className="mt-6 text-center text-sm text-gray-500 sm:text-base">
          * Consult only users with booked appointments. Use headphones to avoid audio feedback.
        </p>
      </div>
    </div>
  );
};

export default Consultation;
