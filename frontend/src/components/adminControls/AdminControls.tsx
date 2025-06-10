import React from "react";
import { PlusCircle } from "lucide-react";

interface AdminControlsProps {
  username: string;
  onAddDrug: () => void;
}

const AdminControls: React.FC<AdminControlsProps> = ({
  username,
  onAddDrug,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white rounded-2xl shadow-md p-6 mb-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
          Админ-панель
        </h1>
        <p className="text-gray-500 mt-1">
          Добро пожаловать,{" "}
          <span className="font-semibold text-blue-600">{username}</span>
        </p>
      </div>

      <div className="flex gap-3 mt-4 sm:mt-0">
        <button
          onClick={onAddDrug}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition transform hover:scale-105"
        >
          <PlusCircle size={18} />
          Добавить лекарство
        </button>
      </div>
    </div>
  );
};

export default AdminControls;
