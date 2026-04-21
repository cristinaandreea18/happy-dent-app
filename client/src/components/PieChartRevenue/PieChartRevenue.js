import {
  PieChart,
  Pie,
  Tooltip,
  Cell,
  Legend,
  ResponsiveContainer,
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

const PieChartRevenue = ({ data, onCategoryClick }) => {
  const chartData = Object.entries(data).map(([category, info]) => ({
    name: category,
    value: info.total,
  }));

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
          marginTop: '4rem',
          fontSize: '1.2rem',
          fontWeight: 600,
          textAlign: 'center',
          whiteSpace: 'nowrap',
        }}
      >
        Distribuție venituri pe categorii
      </h3>
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            outerRadius={100}
            label
            onClick={(data, index) => onCategoryClick?.(data.name, index)}
            activeIndex={-1}
          >
            {chartData.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
                stroke="none"
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => `${value} RON`}
            contentStyle={{
              backgroundColor: 'rgba(0,0,0,0.7)',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
            }}
          />
          <Legend
            layout="horizontal"
            verticalAlign="bottom"
            align="center"
            wrapperStyle={{ paddingTop: 20 }}
          />{' '}
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PieChartRevenue;
