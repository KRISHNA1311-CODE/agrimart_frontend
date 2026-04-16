import { useState } from 'react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  BarChart,
  Bar,
  ComposedChart,
  Line
} from 'recharts';
import { salesHistory } from '../data/mockData';
import { motion } from 'motion/react';
import { formatCurrency } from '../constants';
import { TrendingUp, BarChart3 } from 'lucide-react';

export default function SalesAnalysis() {
  const [view, setView] = useState<'composed' | 'area'>('composed');

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-8 rounded-[2rem] card-shadow border border-slate-100"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-50 rounded-lg">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Revenue Dynamics</h2>
            <p className="text-sm text-slate-500">Correlation between revenue and order volume</p>
          </div>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button 
            onClick={() => setView('composed')}
            className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
              view === 'composed' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Mixed View
          </button>
          <button 
            onClick={() => setView('area')}
            className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
              view === 'area' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Area View
          </button>
        </div>
      </div>

      <div className="h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          {view === 'composed' ? (
            <ComposedChart data={salesHistory}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="month" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 12 }}
                dy={10}
              />
              <YAxis 
                yAxisId="left"
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 12 }}
                tickFormatter={(value) => formatCurrency(value/1000) + 'k'}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#e67e22', fontSize: 12 }}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Bar yAxisId="left" dataKey="revenue" fill="#2d5a27" radius={[8, 8, 0, 0]} barSize={40} />
              <Line yAxisId="right" type="monotone" dataKey="sales" stroke="#e67e22" strokeWidth={3} dot={{ r: 4, fill: '#e67e22' }} />
            </ComposedChart>
          ) : (
            <AreaChart data={salesHistory}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2d5a27" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#2d5a27" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(value) => formatCurrency(value/1000) + 'k'} />
              <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
              <Area type="monotone" dataKey="revenue" stroke="#2d5a27" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

