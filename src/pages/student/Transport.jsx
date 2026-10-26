import React from 'react';
import {
  Bus,
  MapPin,
  Phone,
  ShieldCheck,
  Clock,
  Radio,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import Button from '../../components/common/Button';

export default function StudentTransport() {
  const { user } = useAuth();
  const busRoute = user?.busRoute;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <span className="text-xs font-bold text-school-700 uppercase tracking-widest block mb-1">
          CAMPUS LOGISTICS • TRANSPORT DESK
        </span>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          School Bus & Van Conveyance
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Local pickup & drop service for Daulatyarpur, Madhoganj, and neighboring rural areas.
        </p>
      </div>

      {!busRoute || busRoute === 'Self / Pedestrian' ? (
        <Card className="p-12 text-center bg-white border border-slate-200">
          <Bus className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No School Conveyance Route Assigned</h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-1">
            Your profile is currently recorded as self-commute / local guardian pickup. If you require school van or bus service in Daulatyarpur, Madhoganj, or nearby villages, please contact the administrative office.
          </p>
          <div className="mt-6 flex justify-center">
            <Button to="/contact" variant="primary" size="sm">
              Contact School Office
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="p-6 bg-white border border-slate-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <Bus className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-school-700 uppercase">Assigned Route</span>
              <h3 className="text-lg font-bold text-slate-900">{busRoute}</h3>
              <p className="text-xs text-slate-500 mt-0.5">Daulatyarpur, Madhoganj, Uttar Pradesh</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
