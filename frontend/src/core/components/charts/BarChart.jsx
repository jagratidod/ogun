import { BarChart as RechartsBar, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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

export default function BarChartComponent({ data, dataKey, xKey = 'name', color = '#3FAFB0', height = 300, name = 'Value', layout = 'vertical' }) {
  if (layout === 'horizontal') {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <RechartsBar data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#21262D" horizontal={false} />
          <XAxis type="number" stroke="#484F58" tick={{ fill: '#8B949E', fontSize: 12 }} />
          <YAxis dataKey={xKey} type="category" stroke="#484F58" tick={{ fill: '#8B949E', fontSize: 12 }} width={100} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey={dataKey} fill={color} radius={[0, 4, 4, 0]} name={name} />
        </RechartsBar>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBar data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#21262D" vertical={false} />
        <XAxis dataKey={xKey} stroke="#484F58" tick={{ fill: '#8B949E', fontSize: 12 }} />
        <YAxis stroke="#484F58" tick={{ fill: '#8B949E', fontSize: 12 }} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} name={name} />
      </RechartsBar>
    </ResponsiveContainer>
  );
}
