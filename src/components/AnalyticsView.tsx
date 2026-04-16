import { motion } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  LineChart,
  Line,
  Legend,
  PieChart,
  Pie,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  AreaChart,
  Area
} from 'recharts';
import { categoryDemand, salesHistory, products } from '../data/mockData';
import { formatCurrency } from '../constants';
import { TrendingUp, Users, ShoppingCart, Activity, Zap, Target, ArrowUpRight, IndianRupee } from 'lucide-react';

export default function AnalyticsView() {
  // Prepare data for Radar Chart (Performance Metrics)
  const performanceData = products.slice(0, 5).map(p => ({
    subject: p.name,
    demand: p.demandScore,
    stock: (p.stockLevel / 2000) * 100, // Normalized
    price: (p.price / 150) * 100, // Normalized
    fullMark: 100,
  }));

  // Prepare data for Pie Chart
  const pieData = categoryDemand.map(item => ({
    name: item.name,
    value: item.value
  }));

  const COLORS = ['#2d5a27', '#e67e22', '#3498db', '#9b59b6', '#f1c40f'];

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Intelligence Dashboard</h1>
          <p className="text-slate-500 mt-1">Real-time agricultural market dynamics and performance metrics</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-sm font-bold border border-emerald-100">
          <Activity className="w-4 h-4 animate-pulse" />
          Live Market Data
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Revenue', value: formatCurrency(124500), icon: IndianRupee, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Active Customers', value: '1,284', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Total Orders', value: '3,450', icon: ShoppingCart, color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'Market Reach', value: '94%', icon: Zap, color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-3xl border border-slate-100 card-shadow flex items-center gap-4"
          >
            <div className={`p-3 rounded-2xl ${stat.bg}`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Main Revenue Chart - 8 cols */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="lg:col-span-8 bg-white p-8 rounded-[2rem] card-shadow border border-slate-100"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Growth Trajectory</h2>
              <p className="text-sm text-slate-500">Revenue and sales volume over time</p>
            </div>
            <select className="bg-slate-50 border-none rounded-xl text-sm font-bold px-4 py-2 focus:ring-2 focus:ring-primary/20 outline-none">
              <option>Last 6 Months</option>
              <option>Last Year</option>
            </select>
          </div>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesHistory}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2d5a27" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#2d5a27" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  tickFormatter={(value) => formatCurrency(value/1000) + 'k'}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number, name: string) => [
                    name === 'revenue' ? formatCurrency(value) : value, 
                    name.charAt(0).toUpperCase() + name.slice(1)
                  ]}
                />
                <Area type="monotone" dataKey="revenue" stroke="#2d5a27" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
                <Line type="monotone" dataKey="sales" stroke="#e67e22" strokeWidth={3} dot={{ r: 4, fill: '#e67e22' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Category Share - 4 cols */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-4 bg-white p-8 rounded-[2rem] card-shadow border border-slate-100 flex flex-col"
        >
          <h2 className="text-xl font-bold text-slate-900 mb-2">Market Share</h2>
          <p className="text-sm text-slate-500 mb-8">Distribution by category</p>
          <div className="flex-1 min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {pieData.map((item, i) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="text-xs font-medium text-slate-600">{item.name}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Performance Radar - 5 cols */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-5 bg-slate-900 p-8 rounded-[2rem] shadow-2xl shadow-slate-200"
        >
          <h2 className="text-xl font-bold text-white mb-2">Product DNA</h2>
          <p className="text-sm text-slate-400 mb-8">Multi-dimensional performance analysis</p>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={performanceData}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar
                  name="Performance"
                  dataKey="demand"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.6}
                />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Insights & Trends - 7 cols */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-7 bg-white p-8 rounded-[2rem] card-shadow border border-slate-100"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Target className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Strategic Insights</h2>
          </div>
          
          <div className="space-y-4">
            {[
              { title: 'Demand Surge', desc: 'Organic Grains are trending with 40% higher velocity in urban sectors.', trend: '+12%', color: 'emerald' },
              { title: 'Inventory Optimization', desc: 'Current stock levels for Fruits are 15% above optimal. Consider promotions.', trend: '-5%', color: 'orange' },
              { title: 'Price Sensitivity', desc: 'Legumes show high elasticity; a 5% price drop could double volume.', trend: '+22%', color: 'blue' },
            ].map((insight, i) => (
              <div key={insight.title} className="group p-4 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 flex items-start justify-between">
                <div className="flex gap-4">
                  <div className={`mt-1 w-2 h-2 rounded-full bg-${insight.color}-500 shadow-[0_0_10px_rgba(0,0,0,0.1)] shadow-${insight.color}-500/50`} />
                  <div>
                    <h4 className="font-bold text-slate-900">{insight.title}</h4>
                    <p className="text-sm text-slate-500 leading-relaxed">{insight.desc}</p>
                  </div>
                </div>
                <div className={`flex items-center gap-1 text-xs font-bold text-${insight.color}-600 bg-${insight.color}-50 px-2 py-1 rounded-lg`}>
                  <ArrowUpRight className="w-3 h-3" />
                  {insight.trend}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </div>
  );
}
