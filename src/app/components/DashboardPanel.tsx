import React from 'react';

interface DashboardPanelProps {
  totalQuestions: number;
  totalResponses: number;
  questionsByCategory: Array<{ name: string; value: number }>;
}

const DashboardPanel: React.FC<DashboardPanelProps> = ({ totalQuestions, totalResponses, questionsByCategory }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      <div className="bg-gradient-to-r from-blue-500 to-blue-700 p-6 rounded-lg shadow-lg text-white">
        <h3 className="text-lg font-semibold">Total de Preguntas</h3>
        <p className="text-3xl font-bold">{totalQuestions}</p>
      </div>
      <div className="bg-gradient-to-r from-green-500 to-green-700 p-6 rounded-lg shadow-lg text-white">
        <h3 className="text-lg font-semibold">Total de Respuestas</h3>
        <p className="text-3xl font-bold">{totalResponses}</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-lg col-span-1 sm:col-span-2">
        <h3 className="text-lg font-semibold text-gray-800">Preguntas por Categoría</h3>
        <ul className="mt-4 space-y-4">
          {questionsByCategory.map((category, index) => (
            <li key={index} className="flex justify-between items-center bg-gray-100 p-3 rounded-lg shadow-sm">
              <span className="text-gray-700 font-medium">{category.name}</span>
              <span className="text-xl font-bold text-blue-600">{category.value}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default DashboardPanel;