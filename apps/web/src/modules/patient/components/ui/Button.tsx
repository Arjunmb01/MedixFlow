interface Props {
  children: React.ReactNode
  variant?: "primary" | "outline"
  onClick?: () => void
}

export default function Button({
  children,
  variant = "primary",
  onClick
}: Props) {

  const styles =
    variant === "primary"
      ? "bg-blue-600 text-white"
      : "border border-gray-300"

  return (

    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg ${styles}`}
    >
      {children}
    </button>

  )
}