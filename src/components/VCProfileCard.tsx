import React from "react";
import { VCProfile } from "../data/vcs";

export const VCProfileCard: React.FC<{ vc: VCProfile }> = ({ vc }) => (
  <div className="flex items-center gap-4 p-4 bg-white rounded-xl shadow border mb-4">
    <img
      src={vc.image}
      alt={vc.name}
      className="w-16 h-16 rounded-full object-cover border"
    />
    <div>
      <div className="font-bold text-lg">{vc.name}</div>
      <div className="text-sm text-gray-600">
        {vc.title} @ {vc.company}
      </div>
      <div className="text-xs text-gray-500 mt-1">{vc.bio}</div>
    </div>
  </div>
);
