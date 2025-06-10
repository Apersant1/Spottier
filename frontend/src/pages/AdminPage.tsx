import React, { useState, useEffect } from "react";
import { observer } from "mobx-react-lite";
import { AnimatePresence, motion } from "framer-motion";
import { Pill, Clock, Repeat2, Pencil, Trash2, Info } from "lucide-react";
import { useStores } from "../stores/useStores";
import { Spot, SpotRead } from "../stores/SpotsStore";
import AdminControls from "../components/adminControls/AdminControls";
import { DrugModal } from "../components/adminControls/AdminDrugModal";
const AdminPage = observer(() => {
  const { authStore, spotsStore } = useStores();
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [successMessage, setSuccessMessage] = useState("");
  const [form, setForm] = useState<Spot>({
    name: "",
    dosage: 0,
    frequency: 0,
    interval: 0,
    description: "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        name === "dosage" || name === "frequency" || name === "interval"
          ? Number(value)
          : value,
    }));
  };

  // const handleAddDrug = () => {
  //   setForm({
  //     name: "",
  //     dosage: 0,
  //     frequency: 0,
  //     interval: 0,
  //     description: "",
  //   });
  //   setEditingId(null);
  //   setModalMode("create");
  //   setShowModal(true);
  // };
  // const handleEditDrug = (drug: DrugRead) => {
  //   setForm(drug);
  //   setEditingId(drug.id);
  //   setModalMode("edit");
  //   setShowModal(true);
  // };

  // const handleDeleteDrug = async (id: string) => {
  //   const tg = (window as any).Telegram?.WebApp;
  //   if (tg) {
  //     try {
  //       (window as any).Telegram.WebApp.showConfirm(
  //         "Вы уверены, что хотите удалить это лекарство?",
  //         async (confirm: boolean) => {
  //           if (confirm) {
  //             await drugStore.deleteDrug(id);
  //             await drugStore.fetchDrugs();
  //             setSuccessMessage("Лекарство удалено!");
  //             setTimeout(() => setSuccessMessage(""), 3000);
  //           }
  //         },
  //       );
  //     } catch (error) {
  //       if (confirm("Вы уверены, что хотите удалить это лекарство?")) {
  //         await drugStore.deleteDrug(id);
  //         await drugStore.fetchDrugs();
  //         setSuccessMessage("Лекарство удалено!");
  //         setTimeout(() => setSuccessMessage(""), 3000);
  //       }
  //     }
  //   }
  // };

  // const handleSubmit = async () => {
  //   try {
  //     if (editingId) {
  //       await drugStore.updateDrug(editingId, form);
  //       setSuccessMessage("Лекарство обновлено!");
  //     } else {
  //       await drugStore.addDrug(form);
  //       setSuccessMessage("Лекарство добавлено!");
  //     }

  //     setShowModal(false);
  //     setForm({
  //       name: "",
  //       dosage: 0,
  //       frequency: 0,
  //       interval: 0,
  //       description: "",
  //     });
  //     setEditingId(null);
  //     await drugStore.fetchDrugs();
  //     setTimeout(() => setSuccessMessage(""), 3000);
  //   } catch (error) {
  //     console.error("Ошибка:", error);
  //   }
  // };

  // useEffect(() => {
  //   drugStore.fetchDrugs();
  // }, [drugStore]);

  return (
    <div className="p-8">
      {authStore.user && (
        <AdminControls
          username={authStore.user.username}
          onAddDrug={handleAddDrug}
        />
      )}
      <div className="overflow-x-auto mb-10">
        {spotsStore.spots && spotsStore.spots.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {spotsStore.spots.map((spot: SpotRead, index) => (
              <motion.div
                key={spot.id}
                className="relative border border-blue-100 rounded-3xl p-5 bg-gradient-to-br from-white via-blue-50 to-white shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xl font-semibold text-blue-800">
                    <Pill className="w-5 h-5 text-blue-600" />
                    {spot.name}
                  </div>

                  <div className="flex items-center text-sm text-gray-700 gap-2">
                    <Info className="w-4 h-4 text-gray-400" />
                    <span>{spot.desc || "Без описания"}</span>
                  </div>

                  <div className="flex items-center text-sm text-gray-600 gap-2">
                    <Repeat2 className="w-4 h-4 text-green-500" />
                    <span>Дозировка: {spot.sport_type} мг</span>
                  </div>
                </div>

                {/* <div className="mt-5 flex justify-end gap-3">
                  <button
                    onClick={() => handleEditDrug(drug)}
                    className="p-2 rounded-full hover:bg-blue-100 text-blue-600 transition"
                    title="Редактировать"
                  >
                    <Pencil className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteDrug(drug.id)}
                    className="p-2 rounded-full hover:bg-red-100 text-red-600 transition"
                    title="Удалить"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div> */}
              </motion.div>
            ))}
          </div>
        ) : (
          <>
            <h2>Лекарства отсутствуют</h2>
          </>
        )}
      </div>

      {/* Сообщение об успехе */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            className="fixed top-10 left-1/2 transform -translate-x-1/2 bg-green-600 text-white py-4 px-8 rounded-xl shadow-2xl z-50 max-w-md w-full text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <div className="font-semibold text-lg">{successMessage}</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Модальное окно */}
      <DrugModal
        isOpen={showModal}
        mode={modalMode}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmit}
        form={form}
        onChange={handleInputChange}
      />
    </div>
  );
});

export default AdminPage;
