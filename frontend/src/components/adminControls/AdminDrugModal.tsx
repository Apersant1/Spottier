import { AnimatePresence, motion } from "framer-motion";

type DrugModalProps = {
  isOpen: boolean;
  mode: "create" | "edit";
  onClose: () => void;
  onSubmit: () => void;
  form: {
    name: string;
    dosage: number;
    frequency: number;
    interval: number;
    description: string;
  };
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
};

export const DrugModal = ({
  isOpen,
  mode,
  onClose,
  onSubmit,
  form,
  onChange,
}: DrugModalProps) => {
  const title =
    mode === "create" ? "Создать лекарство" : "Редактировать лекарство";

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Задний фон */}
          <motion.div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Модалка */}
          <motion.div
            className="relative z-10 bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg mx-4"
            initial={{ scale: 0.95, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 40 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">
              {title}
            </h2>

            <div className="space-y-4">
              <InputField
                label="Название"
                name="name"
                value={form.name}
                onChange={onChange}
                placeholder="Например, Ибупрофен"
              />
              <InputField
                label="Дозировка (мг)"
                name="dosage"
                type="number"
                value={form.dosage}
                onChange={onChange}
                placeholder="Например, 200"
              />
              <InputField
                label="Частота (в день)"
                name="frequency"
                type="number"
                value={form.frequency}
                onChange={onChange}
                placeholder="Например, 3"
              />
              <InputField
                label="Интервал (часы)"
                name="interval"
                type="number"
                value={form.interval}
                onChange={onChange}
                placeholder="Например, 8"
              />
              <TextareaField
                label="Описание"
                name="description"
                value={form.description}
                onChange={onChange}
                placeholder="Дополнительная информация"
              />
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition active:scale-95"
              >
                Отмена
              </button>
              <button
                onClick={onSubmit}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition active:scale-95"
              >
                Сохранить
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Вспомогательный компонент для инпута
const InputField = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  name: string;
  value: string | number;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  placeholder?: string;
  type?: string;
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      className="w-full px-4 py-2 border rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition"
      placeholder={placeholder}
    />
  </div>
);

// Вспомогательный компонент для textarea
const TextareaField = ({
  label,
  name,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  name: string;
  value: string;
  onChange: React.ChangeEventHandler<HTMLTextAreaElement>;
  placeholder?: string;
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      className="w-full px-4 py-2 border rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition resize-none"
      placeholder={placeholder}
      rows={3}
    />
  </div>
);
