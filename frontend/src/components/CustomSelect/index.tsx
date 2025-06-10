import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

type ViewOption = {
  label: string;
  value: string;
};

const options: ViewOption[] = [
  { label: "Месяц", value: "dayGridMonth" },
  { label: "Список недели", value: "listWeek" },
];

type CustomSelectProps = {
  value: string;
  onChange: (value: string) => void;
  label: string;
};

export const CustomSelect = ({ value, onChange, label }: CustomSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Закрыть список при клике вне компонента
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className="relative w-48" ref={containerRef}>
      <label className="block mb-1 text-sm font-medium text-gray-700 select-none">
        {label}
      </label>
      <button
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        className="w-full flex justify-between items-center px-4 py-2 bg-white border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500 transition"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="text-gray-800">{selectedOption?.label}</span>
        <svg
          className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
            isOpen ? "rotate-180" : "rotate-0"
          }`}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.ul
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-20 mt-1 w-full bg-white border border-gray-300 rounded-xl shadow-lg max-h-60 overflow-auto focus:outline-none"
            role="listbox"
          >
            {options.map((option) => (
              <li
                key={option.value}
                role="option"
                aria-selected={option.value === value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`
                  cursor-pointer select-none px-4 py-2 text-gray-700 hover:bg-blue-100
                  ${option.value === value ? "bg-blue-200 font-semibold" : ""}
                `}
              >
                {option.label}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
};
