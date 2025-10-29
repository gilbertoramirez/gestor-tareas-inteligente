interface BadgeProps {
  texto: string;
  color?: string;
  onClick?: () => void;
}

export const Badge = ({ texto, color = 'bg-gray-200 text-gray-800', onClick }: BadgeProps) => {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color} ${
        onClick ? 'cursor-pointer hover:opacity-80' : ''
      }`}
      onClick={onClick}
    >
      {texto}
    </span>
  );
};
