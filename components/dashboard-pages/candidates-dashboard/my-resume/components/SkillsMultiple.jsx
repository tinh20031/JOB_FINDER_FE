'use client'
import Select from "react-select";

const SkillsMultiple = ({ skills = [] }) => {
  const options = skills.map((s) => ({
    value: s.skillName,
    label: s.skillName,
  }));

  return (
    <Select
      defaultValue={options}
      isMulti
      name="skills"
      options={options}
      className="basic-multi-select"
      classNamePrefix="select"
      required
    />
  );
};

export default SkillsMultiple;