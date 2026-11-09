import React from 'react';
import { 
  ShieldCheck, 
  Wifi, 
  Speaker, 
  Package, 
  Users, 
  Palette, 
  Clock, 
  Eye, 
  Search,
  Monitor
} from 'lucide-react';
import { sound } from '../../utils/audio';
import { AppId } from '../../types';

interface ControlPanelAppProps {
  onOpenApp?: (appId: AppId) => void;
}

export const ControlPanelApp: React.FC<ControlPanelAppProps> = ({ onOpenApp }) => {
  return (
    <div className="flex flex-col h-full bg-[#fbfdff] select-none text-[#1a2d42]">
      {/* Top Address / Search */}
      <div className="bg-gradient-to-b from-[#fbfdff] to-[#e4eef6] border-b border-[#bad0e2] px-3 py-1.5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-[#16416b]">Control Panel</span>
          <span className="text-slate-400">▸</span>
          <span className="text-slate-600">All Control Panel Items</span>
        </div>
        <div className="w-48 flex items-center h-6 border border-[#9bb7cf] bg-white rounded-xs px-2 shadow-inner">
          <input 
            type="text" 
            placeholder="Search Control Panel" 
            className="w-full text-[11px] outline-none bg-transparent"
          />
          <Search className="w-3.5 h-3.5 text-slate-400" />
        </div>
      </div>

      {/* Main Category Grid */}
      <div className="flex-1 overflow-auto p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <div>
            <h1 className="text-lg font-normal text-[#174873]">Adjust your computer's settings</h1>
            <p className="text-xs text-slate-500">View by: <span className="font-semibold text-slate-800">Category ▾</span></p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          {/* System & Security */}
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-9 h-9 text-[#1c78c0] shrink-0 drop-shadow-xs" />
            <div>
              <div className="font-bold text-sm text-[#144a77] hover:underline cursor-pointer">
                System and Security
              </div>
              <ul className="text-xs text-slate-600 space-y-0.5 mt-1">
                <li className="hover:underline cursor-pointer text-[#185384]">Review your computer's status</li>
                <li className="hover:underline cursor-pointer text-[#185384]">Back up your computer</li>
                <li className="hover:underline cursor-pointer text-[#185384]">Find and fix problems</li>
              </ul>
            </div>
          </div>

          {/* User Accounts */}
          <div className="flex items-start gap-3">
            <Users className="w-9 h-9 text-[#299a5d] shrink-0 drop-shadow-xs" />
            <div>
              <div className="font-bold text-sm text-[#144a77] hover:underline cursor-pointer">
                User Accounts and Family Safety
              </div>
              <ul className="text-xs text-slate-600 space-y-0.5 mt-1">
                <li className="hover:underline cursor-pointer text-[#185384]">Change account type</li>
                <li className="hover:underline cursor-pointer text-[#185384]">Set up parental controls</li>
              </ul>
            </div>
          </div>

          {/* Network & Internet */}
          <div className="flex items-start gap-3">
            <Wifi className="w-9 h-9 text-[#0e83b8] shrink-0 drop-shadow-xs" />
            <div>
              <div className="font-bold text-sm text-[#144a77] hover:underline cursor-pointer">
                Network and Internet
              </div>
              <ul className="text-xs text-slate-600 space-y-0.5 mt-1">
                <li className="hover:underline cursor-pointer text-[#185384]">View network status and tasks</li>
                <li className="hover:underline cursor-pointer text-[#185384]">Choose homegroup and sharing options</li>
              </ul>
            </div>
          </div>

          {/* Appearance & Personalization */}
          <div className="flex items-start gap-3">
            <Palette className="w-9 h-9 text-[#b23ea0] shrink-0 drop-shadow-xs" />
            <div>
              <div 
                onClick={() => { sound.playClick(); if (onOpenApp) onOpenApp('personalize'); }}
                className="font-bold text-sm text-[#144a77] hover:underline cursor-pointer"
              >
                Appearance and Personalization
              </div>
              <ul className="text-xs text-slate-600 space-y-0.5 mt-1">
                <li 
                  onClick={() => { sound.playClick(); if (onOpenApp) onOpenApp('personalize'); }}
                  className="hover:underline cursor-pointer text-[#185384]"
                >
                  Change the theme
                </li>
                <li 
                  onClick={() => { sound.playClick(); if (onOpenApp) onOpenApp('personalize'); }}
                  className="hover:underline cursor-pointer text-[#185384]"
                >
                  Change desktop background
                </li>
                <li className="hover:underline cursor-pointer text-[#185384]">Adjust screen resolution</li>
              </ul>
            </div>
          </div>

          {/* Hardware and Sound */}
          <div className="flex items-start gap-3">
            <Speaker className="w-9 h-9 text-[#d97706] shrink-0 drop-shadow-xs" />
            <div>
              <div className="font-bold text-sm text-[#144a77] hover:underline cursor-pointer">
                Hardware and Sound
              </div>
              <ul className="text-xs text-slate-600 space-y-0.5 mt-1">
                <li className="hover:underline cursor-pointer text-[#185384]">View devices and printers</li>
                <li className="hover:underline cursor-pointer text-[#185384]">Add a device</li>
                <li className="hover:underline cursor-pointer text-[#185384]">Adjust system volume</li>
              </ul>
            </div>
          </div>

          {/* Clock, Language, Region */}
          <div className="flex items-start gap-3">
            <Clock className="w-9 h-9 text-[#0891b2] shrink-0 drop-shadow-xs" />
            <div>
              <div className="font-bold text-sm text-[#144a77] hover:underline cursor-pointer">
                Clock, Language, and Region
              </div>
              <ul className="text-xs text-slate-600 space-y-0.5 mt-1">
                <li className="hover:underline cursor-pointer text-[#185384]">Change display language</li>
                <li className="hover:underline cursor-pointer text-[#185384]">Change keyboards or other input methods</li>
              </ul>
            </div>
          </div>

          {/* Programs */}
          <div className="flex items-start gap-3">
            <Package className="w-9 h-9 text-[#475569] shrink-0 drop-shadow-xs" />
            <div>
              <div className="font-bold text-sm text-[#144a77] hover:underline cursor-pointer">
                Programs
              </div>
              <ul className="text-xs text-slate-600 space-y-0.5 mt-1">
                <li className="hover:underline cursor-pointer text-[#185384]">Uninstall a program</li>
                <li className="hover:underline cursor-pointer text-[#185384]">Turn Windows features on or off</li>
              </ul>
            </div>
          </div>

          {/* Ease of Access */}
          <div className="flex items-start gap-3">
            <Eye className="w-9 h-9 text-[#2563eb] shrink-0 drop-shadow-xs" />
            <div>
              <div className="font-bold text-sm text-[#144a77] hover:underline cursor-pointer">
                Ease of Access
              </div>
              <ul className="text-xs text-slate-600 space-y-0.5 mt-1">
                <li className="hover:underline cursor-pointer text-[#185384]">Let Windows suggest settings</li>
                <li className="hover:underline cursor-pointer text-[#185384]">Optimize visual display</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
