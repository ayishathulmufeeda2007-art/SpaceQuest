import React, { useState, useEffect } from 'react';
import { TelemetryStream } from '../../types';
import { Radio, Signal, CheckCircle2, RefreshCw, HardDrive, Globe2 } from 'lucide-react';
import { sound } from '../../utils/soundEngine';

interface GroundSegmentViewProps {
  telemetry: TelemetryStream;
  totalDataGeneratedMB: number;
  dataDownlinkedMB: number;
  downlinkSpeedMbps: number;
  onDownlinkTick: (downloadedAmount: number) => void;
  onDownlinkComplete: () => void;
}

export const GroundSegmentView: React.FC<GroundSegmentViewProps> = ({
  telemetry,
  totalDataGeneratedMB,
  dataDownlinkedMB,
  downlinkSpeedMbps,
  onDownlinkTick,
  onDownlinkComplete
}) => {
  const [activeDsnNode, setActiveDsnNode] = useState('Goldstone (USA)');
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [signalQuality, setSignalQuality] = useState(96);
  const [recoveredJitter, setRecoveredJitter] = useState(false);

  // DSN Node rotation
  const dsnNodes = [
    { name: 'Goldstone (USA)', freq: '7.145 GHz (X-Band)', elevation: '48°' },
    { name: 'Madrid (Spain)', freq: '32.05 GHz (Ka-Band)', elevation: '62°' },
    { name: 'Canberra (Australia)', freq: '8.420 GHz (X-Band)', elevation: '35°' }
  ];

  const handleStartDownlink = () => {
    if (isTransmitting) return;
    setIsTransmitting(true);
    sound.playSwitch();
  };

  useEffect(() => {
    if (!isTransmitting) return;

    const interval = setInterval(() => {
      // Transfer chunk
      const chunkMB = Math.max(10, Math.round(downlinkSpeedMbps * 5));
      sound.playTelemetryPing();
      onDownlinkTick(chunkMB);

      if (dataDownlinkedMB + chunkMB >= totalDataGeneratedMB) {
        setIsTransmitting(false);
        clearInterval(interval);
        onDownlinkComplete();
      }
    }, 400);

    return () => clearInterval(interval);
  }, [isTransmitting, dataDownlinkedMB, totalDataGeneratedMB, downlinkSpeedMbps, onDownlinkTick, onDownlinkComplete]);

  const progressPct = Math.min(100, Math.round((dataDownlinkedMB / Math.max(1, totalDataGeneratedMB)) * 100));

  return (
    <div className="bg-slate-900/90 border border-cyan-500/30 rounded-2xl p-6 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-cyan-500/20 border border-cyan-500/40 rounded-xl text-cyan-400">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">
              GROUND SEGMENT OPERATIONS • NASA DEEP SPACE NETWORK
            </div>
            <h2 className="text-xl font-bold text-white">Telemetry & Scientific Data Downlink Station</h2>
          </div>
        </div>

        {/* Signal Status Pill */}
        <div className="flex items-center gap-2 bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-700 font-mono text-xs">
          <Signal className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span className="text-slate-400">CARRIER LOCK:</span>
          <span className="text-emerald-400 font-bold">{signalQuality}% SNR</span>
        </div>
      </div>

      {/* DSN Ground Nodes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {dsnNodes.map((node, idx) => (
          <button
            key={idx}
            onClick={() => { setActiveDsnNode(node.name); sound.playClick(); }}
            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
              activeDsnNode === node.name
                ? 'bg-cyan-950/40 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                : 'bg-slate-800/50 border-slate-700/60 hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-mono mb-1">
              <span className="flex items-center gap-1.5 text-slate-300">
                <Globe2 className="w-3.5 h-3.5 text-cyan-400" />
                {node.name}
              </span>
              {activeDsnNode === node.name && (
                <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-400/40">
                  TRACKING
                </span>
              )}
            </div>
            <div className="text-[11px] font-mono text-slate-400">Carrier: {node.freq}</div>
            <div className="text-[11px] font-mono text-slate-400">Elevation: {node.elevation}</div>
          </button>
        ))}
      </div>

      {/* Downlink Progress Bar */}
      <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="flex items-center gap-1.5 text-slate-300">
            <HardDrive className="w-4 h-4 text-cyan-400" />
            SCIENCE DATA DOWNLINK PROGRESS
          </span>
          <span className="text-cyan-300 font-bold">
            {dataDownlinkedMB} MB / {totalDataGeneratedMB} MB ({progressPct}%)
          </span>
        </div>

        <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
          <div 
            className="h-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-emerald-400 transition-all duration-300 relative"
            style={{ width: `${progressPct}%` }}
          >
            {isTransmitting && (
              <div className="absolute inset-0 bg-white/20 animate-pulse" />
            )}
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span>Downlink Rate: <strong className="text-white">{downlinkSpeedMbps} Mbps</strong></span>
          <span>Remaining in SSR: <strong className="text-amber-400">{Math.max(0, totalDataGeneratedMB - dataDownlinkedMB)} MB</strong></span>
        </div>
      </div>

      {/* Controls & Signal Recovery */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
        <button
          onClick={() => {
            setSignalQuality(99);
            setRecoveredJitter(true);
            sound.playTelemetryPing();
          }}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg border border-slate-700 text-xs font-mono flex items-center gap-2 transition-all cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
          {recoveredJitter ? 'CARRIER LOCK OPTIMIZED' : 'AUTO-TUNE FREQUENCY OFFSET'}
        </button>

        {progressPct < 100 ? (
          <button
            onClick={handleStartDownlink}
            disabled={isTransmitting}
            className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/25 flex items-center gap-2 font-mono text-sm cursor-pointer"
          >
            <Radio className="w-4 h-4" />
            {isTransmitting ? 'TRANSMITTING TELEMETRY...' : 'INITIATE DOWNLINK PASS'}
          </button>
        ) : (
          <div className="px-5 py-2.5 bg-emerald-500/20 border border-emerald-500/50 rounded-xl text-emerald-300 font-mono text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            DOWNLINK COMPLETE • ALL SCIENCE PACKETS RECEIVED
          </div>
        )}
      </div>
    </div>
  );
};
