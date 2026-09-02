function Input({className, ...rest}) {
    return <input className={`${className} bg-black text-white border border-white/50 rounded-md p-1`} {...rest} />
}

export default Input