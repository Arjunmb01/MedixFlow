interface Props {
  initials: string
}

export default function Avatar({ initials }: Props) {

  return (

    <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-lg font-semibold">

      {initials}

    </div>

  )
}