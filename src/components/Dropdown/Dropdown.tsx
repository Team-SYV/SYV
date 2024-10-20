import React from "react";
import { SelectList } from "react-native-dropdown-select-list";

interface DropdownProps {
  placeholder?: string;
  data: { key: string; value: string }[];
  defaultOption?: { key: string; value: string };
  dropdownStyles?: object;
  boxStyles?: object;
  inputStyles?: object;
  onSelect?: (value: string) => void;
}

const Dropdown: React.FC<DropdownProps> = ({
  placeholder = "Select an option",
  data,
  defaultOption,
  dropdownStyles = {},
  boxStyles = {},
  inputStyles = {},
  onSelect,
}) => {
  const handleSelect = (key: string) => {
    const selectedItem = data.find((item) => item.key === key);
    if (selectedItem && onSelect) {
      onSelect(selectedItem.value);
    }
  };

  return (
    <SelectList
      setSelected={handleSelect}
      placeholder={placeholder}
      data={data}
      search={false}
      defaultOption={defaultOption}
      dropdownStyles={{
        marginRight: 12,
        marginLeft: 40,
        marginTop: 0,

        ...dropdownStyles,
      }}
      boxStyles={{
        marginRight: 12,
        marginLeft: 40,
        marginBottom: 8,
        ...boxStyles,
      }}
      inputStyles={{
        fontSize: 13,
        ...inputStyles,
      }}
      dropdownTextStyles={{
        marginBottom: 0.5,
        marginTop: 0.5,
        fontSize: 13,
      }}
    />
  );
};

export default Dropdown;
