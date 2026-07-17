'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import { Loader2, Video, VideoOff, Mic, MicOff, Send, PhoneOff, ClipboardList, ShoppingCart, CheckCircle, Heart } from 'lucide-react';
import Link from 'next/link';

export default function PatientConsultationRoom() {
  const router = useRouter();
  const params = useParams();
  const appointmentId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  // WebRTC controls mock
  const [videoActive, setVideoActive] = useState(true);
  const [audioActive, setAudioActive] = useState(true);
  const [callConnected, setCallConnected] = useState(false);

  // Socket.io/Chat states
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState('');

  // Right sidebar tab state: 'chat' or 'cart'
  const [rightTab, setRightTab] = useState<'chat' | 'cart'>('chat');

  // Live report updates from doctor
  const [liveDiagnosis, setLiveDiagnosis] = useState('');
  const [liveNotes, setLiveNotes] = useState('');
  const [liveDiet, setLiveDiet] = useState('');
  const [liveLifestyle, setLiveLifestyle] = useState('');

  // Live cart items
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [cartMsg, setCartMsg] = useState('');

  // Prescription status trigger
  const [isCompleted, setIsCompleted] = useState(false);

  const fetchAppointmentDetails = async () => {
    try {
      const res = await fetch('/api/patient/appointments');
      if (res.ok) {
        const json = await res.json();
        const found = json.appointments.find((a: any) => a.id === appointmentId);
        if (found) {
          setData(found);
          if (found.status === 'COMPLETED') {
            setIsCompleted(true);
          }
        } else {
          router.push('/patient/dashboard');
        }
      }

      // Fetch current cart items
      const cartRes = await fetch(`/api/patient/cart?patientId=${data?.patientId || ''}`);
      if (cartRes.ok) {
        const cartJson = await cartRes.json();
        setCartItems(cartJson.items || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointmentDetails();
  }, [appointmentId]);

  // Periodically check if appointment is marked completed by doctor to show prescription
  useEffect(() => {
    if (isCompleted) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/patient/appointments');
        if (res.ok) {
          const json = await res.json();
          const found = json.appointments.find((a: any) => a.id === appointmentId);
          if (found && found.status === 'COMPLETED') {
            setIsCompleted(true);
            setMessages((prev) => [
              ...prev,
              { system: true, message: 'System: E-Prescription issued! You can now access details on your dashboard.' }
            ]);
            clearInterval(interval);
          }
        }
      } catch (e) {}
    }, 5000);

    return () => clearInterval(interval);
  }, [appointmentId, isCompleted]);

  useEffect(() => {
    if (!data) return;

    // Connect to Socket.io signaling server
    const socketInstance = io();
    setSocket(socketInstance);

    const patientName = data.patient?.user?.name || 'Patient';
    const userId = data.patientId;

    socketInstance.emit('join-room', {
      roomId: appointmentId,
      userId,
      userName: patientName,
    });

    setCallConnected(true);

    socketInstance.on('user-joined', ({ userName }) => {
      setMessages((prev) => [
        ...prev,
        { system: true, message: `System: Physician Dr. ${userName} has joined.` }
      ]);
    });

    // Listen to live report sync events from doctor
    socketInstance.on('report-updated', ({ diagnosis, notes, dietInstructions, lifestyleAdvice }) => {
      if (diagnosis !== undefined) setLiveDiagnosis(diagnosis);
      if (notes !== undefined) setLiveNotes(notes);
      if (dietInstructions !== undefined) setLiveDiet(dietInstructions);
      if (lifestyleAdvice !== undefined) setLiveLifestyle(lifestyleAdvice);
    });

    // Listen to live cart addition events from doctor
    socketInstance.on('cart-item-added', (item) => {
      setCartItems((prev) => [...prev, item]);
      setCartMsg(`Dr. added ${item.name} to your cart live!`);
      // Auto-clear message after 4 seconds
      setTimeout(() => setCartMsg(''), 4000);
    });

    socketInstance.on('receive-message', (msgObj) => {
      setMessages((prev) => [...prev, msgObj]);
    });

    socketInstance.on('user-left', () => {
      setMessages((prev) => [
        ...prev,
        { system: true, message: `System: Doctor disconnected.` }
      ]);
    });

    return () => {
      socketInstance.disconnect();
    };
  }, [data]);

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !socket || !data) return;

    socket.emit('send-message', {
      roomId: appointmentId,
      message: chatInput,
      senderId: data.patientId,
      senderName: data.patient?.user?.name || 'Patient',
      senderRole: 'PATIENT',
    });
    setChatInput('');
  };

  const handleCheckout = async () => {
    try {
      const res = await fetch(`/api/patient/cart?patientId=${data?.patientId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setCartItems([]);
        setCartMsg('Order placed successfully! Prescribed herbs are on the way.');
        setTimeout(() => setCartMsg(''), 4000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-primary-800 bg-cream">
        <Loader2 className="w-8 h-8 animate-spin mr-2" /> Loading video consultation room...
      </div>
    );
  }

  const doctorName = data.doctor?.user?.name || 'Practitioner';
  const speciality = data.doctor?.doctorProfile?.specializations || 'Ayurveda';

  return (
    <div className="flex-grow grid grid-cols-1 lg:grid-cols-12 gap-6 h-[85vh] overflow-hidden font-sans text-slate-800" id="patient-consultation-room">
      
      {/* Left Column: Video Feeds (8 cols) */}
      <section className="lg:col-span-8 bg-slate-900 border border-slate-880 rounded-2xl overflow-hidden flex flex-col justify-between shadow-2xl relative">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-600 to-gold-600 z-10"></div>

        {/* Header information */}
        <div className="bg-slate-950 p-4 border-b border-slate-850 flex justify-between items-center text-white z-10">
          <div>
            <h3 className="font-display font-bold text-sm">Consulting: Dr. {doctorName}</h3>
            <span className="text-[10px] text-slate-400 font-semibold">{speciality}</span>
          </div>
          <Link
            href="/patient/dashboard"
            className="px-3 py-1.5 bg-red-955 border border-red-900/60 hover:bg-red-900 text-red-300 hover:text-white rounded-lg text-xs font-bold transition flex items-center"
          >
            <PhoneOff className="w-4 h-4 mr-1.5" /> Hang Up
          </Link>
        </div>

        {/* Video stream box */}
        <div className="flex-1 grid grid-cols-2 gap-4 p-4 min-h-[50%] bg-slate-950">
          {/* Doctor Stream */}
          <div className="bg-slate-900 rounded-xl relative border border-slate-850 overflow-hidden flex items-center justify-center shadow">
            {callConnected ? (
              <div className="absolute inset-0 bg-slate-900 flex items-center justify-center">
                <div className="text-center space-y-3 z-10">
                  <div className="w-14 h-14 rounded-full bg-gold-600/10 text-gold-600 flex items-center justify-center font-bold text-lg border border-gold-600/20 animate-pulse mx-auto">
                    {doctorName.charAt(0)}
                  </div>
                  <span className="text-slate-400 text-xs font-bold">Dr. {doctorName} (Physician)</span>
                </div>
                <div className="absolute bottom-3 left-3 bg-black/60 px-2 py-0.5 rounded text-[10px] text-green-400 font-bold">
                  ● Live Streaming
                </div>
              </div>
            ) : (
              <div className="text-slate-500 text-xs font-bold">Waiting for practitioner connection...</div>
            )}
          </div>

          {/* Self Stream */}
          <div className="bg-slate-900 rounded-xl relative border border-slate-850 overflow-hidden flex items-center justify-center shadow">
            {videoActive ? (
              <div className="absolute inset-0 bg-slate-900 flex items-center justify-center">
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-primary-100/10 text-primary-400 flex items-center justify-center font-bold border border-primary-500/25 mx-auto">
                    P
                  </div>
                  <span className="text-slate-400 text-[10px] font-bold">Self Stream (You)</span>
                </div>
              </div>
            ) : (
              <div className="text-slate-500 text-xs font-bold">Camera Muted</div>
            )}
            
            {/* Control overlay */}
            <div className="absolute bottom-3 right-3 flex items-center space-x-2">
              <button
                onClick={() => setAudioActive(!audioActive)}
                className={`p-2 rounded-lg cursor-pointer transition ${audioActive ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-red-955/35 text-red-400 border border-red-900'}`}
              >
                {audioActive ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => setVideoActive(!videoActive)}
                className={`p-2 rounded-lg cursor-pointer transition ${videoActive ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-red-955/35 text-red-400 border border-red-900'}`}
              >
                {videoActive ? <Video className="w-3.5 h-3.5" /> : <VideoOff className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Right Column: Chat Box & Live Rx updates / Cart (4 cols) */}
      <section className="lg:col-span-4 bg-white border border-slate-100 rounded-2xl flex flex-col justify-between shadow-2xl h-full overflow-hidden">
        {/* Navigation Tabs */}
        <div className="grid grid-cols-2 bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500">
          <button
            onClick={() => setRightTab('chat')}
            className={`py-3 flex items-center justify-center space-x-1.5 border-b-2 transition cursor-pointer ${
              rightTab === 'chat' ? 'border-primary-600 text-primary-800 bg-white' : 'border-transparent hover:text-slate-855'
            }`}
          >
            <span>Live Chat</span>
          </button>
          <button
            onClick={() => setRightTab('cart')}
            className={`py-3 flex items-center justify-center space-x-1.5 border-b-2 transition cursor-pointer relative ${
              rightTab === 'cart' ? 'border-primary-600 text-primary-800 bg-white' : 'border-transparent hover:text-slate-855'
            }`}
          >
            <span>Rx & Live Cart 🛒</span>
            {cartItems.length > 0 && (
              <span className="absolute top-1 right-3 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-[8px] font-black">
                {cartItems.length}
              </span>
            )}
          </button>
        </div>

        {/* Tab content 1: Live Chat */}
        {rightTab === 'chat' && (
          <div className="flex-grow flex flex-col justify-between overflow-hidden">
            {/* Chat message display */}
            <div className="flex-grow p-4 overflow-y-auto space-y-3 bg-slate-50/20 max-h-[62vh]">
              {messages.map((msg, idx) => {
                if (msg.system) {
                  return (
                    <div key={idx} className="text-center text-[9px] text-slate-400 font-bold bg-slate-100 py-1 rounded">
                      {msg.message}
                    </div>
                  );
                }
                const isMe = msg.senderRole === 'PATIENT';
                return (
                  <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-xl p-3 text-xs font-semibold leading-relaxed ${
                      isMe 
                        ? 'bg-primary-600 text-white rounded-tr-none shadow-sm' 
                        : 'bg-slate-100 border border-slate-150 text-slate-705 rounded-tl-none shadow-sm'
                    }`}>
                      <span className="block text-[9px] text-slate-400 font-bold uppercase mb-1">{msg.senderName}</span>
                      <p>{msg.message}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Input box */}
            {!isCompleted ? (
              <form onSubmit={handleSendChat} className="p-4 border-t border-slate-100 flex items-center space-x-2 bg-slate-50/50">
                <input
                  type="text"
                  required
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Send message to doctor..."
                  className="flex-grow px-3 py-2 bg-white border border-slate-200 text-slate-800 text-xs rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 placeholder-slate-400"
                />
                <button
                  type="submit"
                  className="p-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            ) : (
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-t border-green-200 p-4 space-y-3">
                <div className="flex items-center space-x-2 text-green-800 font-bold text-xs">
                  <ClipboardList className="w-5 h-5 text-green-600" />
                  <span>E-Prescription available!</span>
                </div>
                <p className="text-[10px] text-green-700 font-semibold leading-relaxed">
                  Dr. {doctorName} has finalized your treatment plan and signed the prescription log.
                </p>
                <Link
                  href="/patient/records"
                  className="w-full py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg text-xs text-center block shadow transition cursor-pointer"
                >
                  Inspect Rx & Download PDF
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Tab content 2: Live Rx & Cart */}
        {rightTab === 'cart' && (
          <div className="flex-grow flex flex-col justify-between overflow-y-auto p-5 space-y-6 max-h-[75vh]">
            
            {/* Live Pop-up notice */}
            {cartMsg && (
              <div className="bg-emerald-50 border border-emerald-150 text-emerald-800 text-xs font-bold p-3.5 rounded-xl flex items-center shadow-sm">
                {cartMsg}
              </div>
            )}

            {/* Live Diagnosis notes */}
            <div className="space-y-4 border-b pb-4 border-slate-100">
              <h4 className="text-xs font-bold text-primary-850 uppercase tracking-wider">Live Physician Report</h4>
              
              <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-150 text-xs">
                <div>
                  <strong className="block text-[10px] text-slate-400 uppercase">Diagnosis / Ailment:</strong>
                  <span className="font-bold text-slate-800">{liveDiagnosis || data.consultation?.diagnosis || 'Doctor is writing...'}</span>
                </div>
                {liveNotes && (
                  <div className="mt-2.5">
                    <strong className="block text-[10px] text-slate-400 uppercase">Doctor Notes:</strong>
                    <p className="text-slate-655 mt-0.5">{liveNotes}</p>
                  </div>
                )}
                {liveDiet && (
                  <div className="mt-2.5 border-t pt-2 border-slate-200/50">
                    <strong className="block text-[10px] text-emerald-800 uppercase">Dietary Advice (Pathya):</strong>
                    <p className="text-slate-655 mt-0.5 font-medium">{liveDiet}</p>
                  </div>
                )}
                {liveLifestyle && (
                  <div className="mt-2.5">
                    <strong className="block text-[10px] text-slate-400 uppercase">Lifestyle Advice (Vihara):</strong>
                    <p className="text-slate-655 mt-0.5">{liveLifestyle}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Patient Shopping Cart */}
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold text-primary-850 uppercase tracking-wider mb-3">Live Shopping Cart</h4>
                {cartItems.length === 0 ? (
                  <div className="text-[11px] text-slate-400 italic py-4">No prescribed herbs in your cart yet.</div>
                ) : (
                  <div className="space-y-2">
                    {cartItems.map((item, idx) => (
                      <div key={idx} className="bg-slate-50 border border-slate-150 rounded-xl p-3 flex justify-between items-center">
                        <div className="text-xs font-semibold">
                          <strong className="text-slate-800 block">{item.name}</strong>
                          <span className="text-[10px] text-slate-500">{item.dosage}</span>
                        </div>
                        <span className="text-xs font-extrabold text-primary-750">₹{item.price}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Checkout actions */}
              {cartItems.length > 0 && (
                <div className="border-t border-slate-100 pt-4 mt-6 space-y-3.5">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-slate-500 uppercase">Total Prescribed Herbs:</span>
                    <span className="text-sm font-extrabold text-primary-855">
                      ₹{cartItems.reduce((sum, item) => sum + (item.price || 150.0), 0)}
                    </span>
                  </div>
                  <button
                    onClick={handleCheckout}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs text-center block shadow transition cursor-pointer"
                  >
                    Checkout & Buy Herbs
                  </button>
                </div>
              )}
            </div>

          </div>
        )}
      </section>

    </div>
  );
}
