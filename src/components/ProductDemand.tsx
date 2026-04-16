import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import { categoryDemand, products } from '../data/mockData';
import { motion } from 'motion/react';
import { ArrowUpRight, Target, PieChart as PieIcon } from 'lucide-react';

const COLORS = ['#2d5a27', '#e67e22', '#3498db', '#9b59b6'];

export default function ProductDemand() {
  const topProducts = [...products]
    .sort((a, b) => b.demandScore - a.demandScore)
    .slice(0, 5)
    .map(p => ({
      name: p.name.split(' ')[0], // Shorten name for chart
      fullName: p.name,
      score: p.demandScore,
      category: p.category
    }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Category Distribution */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white p-8 rounded-[2rem] card-shadow border border-slate-100"
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-orange-50 rounded-lg">
            <PieIcon className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Category Mix</h2>
            <p className="text-sm text-slate-500">Market share by product category</p>
          </div>
        </div>
        
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryDemand}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={90}
                paddingAngle={8}
                dataKey="value"
              >
                {categoryDemand.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cornerRadius={4} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Top Products Analysis */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white p-8 rounded-[2rem] card-shadow border border-slate-100"
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Target className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">High Velocity Items</h2>
            <p className="text-sm text-slate-500">Products with highest market demand scores</p>
          </div>
        </div>

        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topProducts} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
              <XAxis type="number" hide />
              <YAxis 
                dataKey="name" 
                type="category" 
                axisLine={false} 
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
              />
              <Tooltip 
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                formatter={(value: number) => [`${value}%`, 'Demand Score']}
              />
              <Bar dataKey="score" radius={[0, 8, 8, 0]} barSize={32}>
                {topProducts.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} fillOpacity={0.8} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
}
