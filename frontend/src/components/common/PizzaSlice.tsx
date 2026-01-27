import smallPizzaSlice from '../../assets/images/small_pizza_slice.png'
import bigPizzaSlice from '../../assets/images/big_pizza_slice.png'

interface PizzaSliceProps {
  className?: string
  isSmall?: boolean
  title?: string
  grayscale?: boolean
}

/**
 * Komponent wyświetlający kawałek pizzy jako obrazek
 * @param className - dodatkowe klasy CSS
 * @param isSmall - czy wyświetlić mały kawałek (domyślnie określane na podstawie className)
 * @param title - tekst tooltipa
 * @param grayscale - czy zastosować efekt szarości
 */
const PizzaSlice = ({ className = '', isSmall, title, grayscale = false }: PizzaSliceProps) => {
  // Jeśli isSmall nie jest podane, próbujemy określić na podstawie className
  let shouldUseSmall = isSmall
  if (shouldUseSmall === undefined) {
    // Sprawdzamy czy className zawiera text-[0.85em] lub podobne małe rozmiary
    shouldUseSmall = className.includes('text-base') || className.includes('text-xs') || className.includes('text-sm')
  }

  const imageSrc = shouldUseSmall ? smallPizzaSlice : bigPizzaSlice
  const sizeClass = shouldUseSmall ? 'text-base' : 'text-base'
  
  return (
    <img
      src={imageSrc}
      alt="🍕"
      className={`inline-block ${sizeClass} ${grayscale ? 'grayscale' : ''} ${className}`}
      title={title}
      style={{ 
        width: '2em', 
        height: '2em', 
        objectFit: 'contain',
        verticalAlign: 'middle'
      }}
    />
  )
}

export default PizzaSlice
