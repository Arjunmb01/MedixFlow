interface Props {
    children : React.ReactNode
    className?: string
}

export default function Card({children,className} : Props){
    return (
        <div className={`bg-white rounded-xl shadow-sm border p-5 ${className}`}>
            {children}
        </div>
    )
}