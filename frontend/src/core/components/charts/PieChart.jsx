import { PieChart as RechartsPie, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#3FAFB0', '#E0128A', '#7A2E8E', '#58A6FF', '#D29922', '#2EA043', '#5AC2B1', '#B21F7A'];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface-card/95 backdrop-blur-xl border border-border rounded-none px-3 py-2 shadow-dropdown">
        <p className="text-sm font-semibold" style={{ color: payload[0].payload.fill || payload[0].color }}>
          {payload[0].name}: {payload[0].value.toLocaleString('en-IN')}
        </p>
      </div>
    );
  }
  return null;
};

export default function PieChartComponent({ data, dataKey = 'value', nameKey = 'name', height = 300, innerRadius = 60, outerRadius = 100, showLegend = true }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsPie>
        <Pie data={data} dataKey={dataKey} nameKey={nameKey} cx="50%" cy="50%" innerRadius={innerRadius} outerRadius={outerRadius} paddingAngle={2} strokeWidth={0}>
          {data.map((_, idx) => (
            <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        {showLegend && (
          <Legend
            verticalAlign="bottom"
            formatter={(value) => <span className="text-xs text-content-secondary">{value}</span>}
          />
        )}
      </RechartsPie>
    </ResponsiveContainer>
  );
}
