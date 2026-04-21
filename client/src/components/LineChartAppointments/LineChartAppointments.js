import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const LineChartAppointments = ({ data }) => {
  return (
    <div
      style={{
        width: '100%',
        height: 300,
        marginTop: '2rem',
        marginBottom: '2rem',
      }}
    >
      <ResponsiveContainer>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12, fill: '#ffffff' }}
            tickFormatter={(tick) =>
              new Date(tick).toLocaleDateString('ro-RO', {
                day: '2-digit',
                month: '2-digit',
              })
            }
          />
          <YAxis tick={{ fontSize: 12, fill: '#ffffff' }} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(0,0,0,0.7)',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
            }}
            itemStyle={{ color: 'white' }}
            labelStyle={{ color: 'white' }}
            labelFormatter={(label) =>
              new Date(label).toLocaleDateString('ro-RO', {
                weekday: 'long',
                day: '2-digit',
                month: 'long',
              })
            }
          />
          <Legend />
          <Line type="monotone" dataKey="total" stroke="#8884d8" name="Total" />
          <Line
            type="monotone"
            dataKey="completed"
            stroke="#00c49f"
            name="Finalizate"
          />
          <Line
            type="monotone"
            dataKey="cancelled"
            stroke="#ff8042"
            name="Anulate"
          />
          <Line
            type="monotone"
            dataKey="pending"
            stroke="#ffd700"
            name="În așteptare"
          />
          <Line
            type="monotone"
            dataKey="confirmed"
            stroke="#6495ED"
            name="Confirmate"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LineChartAppointments;
