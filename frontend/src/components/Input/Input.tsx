import React from "react";

type InputProps = {
  label: string;
  name: string;
  value: string | number;
  onChange: React.ChangeEventHandler<HTMLInputElement | HTMLSelectElement>;
  type?: string;
  disabled?: boolean;
  as?: "input" | "select";
  options?: { label: string; value: string | number }[];
};

const Input: React.FC<InputProps> = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  disabled = false,
  as = "input",
  options = [],
}) => {
  return (
    <div className="mb-4">
      <label
        htmlFor={name}
        className="block text-gray-700 text-sm font-bold mb-2"
      >
        {label}
      </label>
      {as === "select" ? (
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className="input"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className="input"
        />
      )}
    </div>
  );
};

export default Input;
