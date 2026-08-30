'use client';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#C98F79', '#AAB7A0', '#3B312D', '#F8F4EF', '#b87d68'];

export default function AdminCharts({ stats }: { stats: any }) {
  const monthlyData = stats?.monthlyRevenue ?? [];
  const serviceData = stats?.serviceBreakdown ?? [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="font-playfair text-lg font-semibold text-[#3B312D] mb-4">Revenus mensuels</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData}>
              <XAxis dataKey="month" tickLine={false} tick={{ fontSize: 10 }} />
              <YAxis tickLine={false} tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ fontSize: 11 }} />
              <Bar dataKey="revenue" fill="#C98F79" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="font-playfair text-lg font-semibold text-[#3B312D] mb-4">Répartition des soins</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={serviceData.length > 0 ? serviceData : [{ name: 'Kobido', value: 40 }, { name: 'Drainage', value: 30 }, { name: 'Nutrition', value: 20 }, { name: 'Autre', value: 10 }]} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                {(serviceData.length > 0 ? serviceData : [1,2,3,4]).map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Legend verticalAlign="top" wrapperStyle={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
