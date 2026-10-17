export type TextAreaProps = {
  id: string;
  name: string;
  label: string;
  value: string;
  rows: number;
  onChange: (value: string) => void;
};
