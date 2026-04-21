import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LabelList,
} from 'recharts';

const COLORS = [
  '#A8DADC',
  '#FFE5B4',
  '#FFBCBC',
  '#C3AED6',
  '#F6BD60',
  '#B5E48C',
  '#ADE8F4',
  '#F1C0E8',
];

const BarChartProcedures = ({ data, category, colorIndex }) => {
  if (!data || !data[category]) return null;

  const chartData = Object.entries(data[category].procedures).map(
    ([name, value]) => ({
      name,
      value,
    })
  );

  return (
    <div
      style={{
        width: '50%',
        height: '400px',
        minWidth: '400px',
        padding: '1rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <h3
        style={{
          marginBottom: '1rem',
          fontSize: '1.2rem',
          fontWeight: 600,
          textAlign: 'center',
          whiteSpace: 'nowrap',
        }}
      >
        {' '}
        Venituri subcategorie: {category}
      </h3>
      <ResponsiveContainer>
        <BarChart data={chartData} layout="vertical" margin={{ left: 80 }}>
          <XAxis type="number" tick={{ fontSize: 12, fill: '#ffffff' }} />
          <YAxis
            dataKey="name"
            type="category"
            tick={{ fontSize: 12, fill: '#ffffff' }}
          />
          <Legend />
          <Bar dataKey="value" fill={COLORS[colorIndex % COLORS.length]}>
            <LabelList
              dataKey="value"
              position="insideRight"
              fill="#fff"
              style={{ fontSize: 12 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BarChartProcedures;
