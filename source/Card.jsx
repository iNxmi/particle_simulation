function Card({className, children, ...rest}) {
    return (
        <div className={`${className} bg-white/7 rounded-2xl`} {...rest}>
            {children}
        </div>
    )
}

export default Card