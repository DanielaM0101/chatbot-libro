import type React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface DashboardPanelProps {
  totalQuestions: number;
  totalResponses: number;
  questionsByCategory: { name: string; value: number }[];
}

const DashboardPanel: React.FC<DashboardPanelProps> = ({
  totalQuestions,
  totalResponses,
  questionsByCategory,
}) => {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 p-6">
      <Card className="bg-gradient-to-br from-[#0088D1] to-[#0077BE] text-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-medium">Total Preguntas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">{totalQuestions}</div>
          <p className="text-blue-100 mt-2">Consultas realizadas</p>
        </CardContent>
      </Card>
      <Card className="bg-gradient-to-br from-[#E23B30] to-[#C62828] text-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-medium">Total Respuestas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">{totalResponses}</div>
          <p className="text-red-100 mt-2">Respuestas proporcionadas</p>
        </CardContent>
      </Card>
      <Card className="bg-white col-span-4 shadow-lg">
        <CardHeader className="border-b border-gray-100">
          <CardTitle className="text-[#0088D1] text-xl">Estadísticas por Categoría</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={questionsByCategory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="name" tick={{ fill: "#666" }} axisLine={{ stroke: "#ddd" }} />
              <YAxis tick={{ fill: "#666" }} axisLine={{ stroke: "#ddd" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Bar dataKey="value" fill="#0088D1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardPanel;
