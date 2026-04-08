import { AreaChart as RechartsArea, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface-card/95 backdrop-blur-xl border border-border rounded-none px-3 py-2 shadow-dropdown">
        <p className="text-xs text-content-secondary mb-1">{label}</p>
        {payload.map((entry, idx) => (
          <p key={idx} className="text-sm font-semibold" style={{ color: entry.color }}>
            {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString('en-IN') : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AreaChartComponent({ data, dataKey, xKey = 'name', color = '#3FAFB0', gradientId = 'colorGrad', height = 300, name = 'Value' }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsArea data={data}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#21262D" />
        <XAxis dataKey={xKey} stroke="#484F58" tick={{ fill: '#8B949E', fontSize: 12 }} />
        <YAxis stroke="#484F58" tick={{ fill: '#8B949E', fontSize: 12 }} />
        <Tooltip content={<CustomTooltip />} />
        <Area type="monotone" dataKey={dataKey} stroke={color} fillOpacity={1} fill={`url(#${gradientId})`} strokeWidth={2} name={name} />
      </RechartsArea>
    </ResponsiveContainer>
  );
}
