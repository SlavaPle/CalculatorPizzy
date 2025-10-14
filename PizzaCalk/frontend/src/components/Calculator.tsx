import { useState, useEffect } from 'react'
import { User } from '../types'
import { Plus, Users, Trash2, Calculator, Minus, Settings } from 'lucide-react'
import SettingsModal, { PizzaSettings } from './SettingsModal'

interface CalculatorProps {
  users: User[]
  setUsers: (users: User[]) => void
  onShowResults: () => void
}

const CalculatorComponent = ({ users, setUsers, onShowResults }: CalculatorProps) => {
  const [formData, setFormData] = useState({
    name: '',
    slices: 3,
    canBeMore: false
  })
  const [savedUsers, setSavedUsers] = useState<string[]>(() => {
    const saved = localStorage.getItem('savedUsers')
    return saved ? JSON.parse(saved) : []
  })
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [selectedVariant, setSelectedVariant] = useState<'current' | 'reduced' | 'small'>('current')
  
  // Настройки пиццы (из localStorage или значения по умолчанию)
  const [pizzaSettings, setPizzaSettings] = useState<PizzaSettings>(() => {
    const saved = localStorage.getItem('pizzaSettings')
    const defaultSettings = {
      smallPizzaSlices: 6,
      largePizzaSlices: 8,
      largePizzaPrice: 800,
      smallPizzaPricePercent: 65,
      freePizzaThreshold: 3,
      useFreePizza: true,
      freePizzaIsSmall: false,
      smallEqual: false // 6 < 8
    }
    
    if (saved) {
      const parsed = JSON.parse(saved)
      // Добавляем новые поля если их нет в сохраненных данных
      const merged = { ...defaultSettings, ...parsed }
      // Пересчитываем smallEqual при загрузке
      merged.smallEqual = merged.smallPizzaSlices >= merged.largePizzaSlices
      return merged
    }
    
    return defaultSettings
  })

  const handleAddUser = () => {
    if (formData.slices < 1) {
      alert('Количество кусков должно быть не менее 1')
      return
    }

    if (formData.slices > 20) {
      alert('Количество кусков не может быть больше 20')
      return
    }

    // Автоматическое имя, если не указано
    const userName = formData.name.trim() || `User ${users.length + 1}`

    const newUser: User = {
      id: `user-${Date.now()}`,
      name: userName,
      minSlices: formData.slices,
      canBeMore: formData.canBeMore,
      personalSauces: [],
      totalCost: 0,
      assignedSlices: []
    }

    setUsers([...users, newUser])
    
    // Сохраняем имя пользователя, если оно введено вручную
    if (formData.name.trim() && !savedUsers.includes(userName)) {
      const updatedSavedUsers = [...savedUsers, userName]
      setSavedUsers(updatedSavedUsers)
      localStorage.setItem('savedUsers', JSON.stringify(updatedSavedUsers))
    }
    
    setFormData({ name: '', slices: 3, canBeMore: false })
    setShowSuggestions(false)
  }

  const handleRemoveUser = (userId: string) => {
    setUsers(users.filter(user => user.id !== userId))
  }

  const handleUpdateUserSlices = (userId: string, delta: number) => {
    setUsers(users.map(user => {
      if (user.id === userId) {
        const newValue = Math.max(1, Math.min(20, user.minSlices + delta))
        return { 
          ...user, 
          minSlices: newValue
        }
      }
      return user
    }))
  }

  const handleToggleCanBeMore = (userId: string) => {
    setUsers(users.map(user => {
      if (user.id === userId) {
        return {
          ...user,
          canBeMore: !user.canBeMore
        }
      }
      return user
    }))
  }

  // Получение актуальной цены маленькой пиццы с учетом процента
  const getActualSmallPizzaPrice = (): number => {
    return Math.round(pizzaSettings.largePizzaPrice * pizzaSettings.smallPizzaPricePercent / 100)
  }
  
  // Функция оптимального подбора количества пицц
  const bestFactors = (N: number, K: number, M: number, limit: number = 100): [number, number, number] => {
    let best: [number, number, number] = [0, 0, Math.abs(N)]
    
    for (let b = 0; b <= limit; b++) {
      const a = Math.round((N - b * M) / K)
      if (a < 0) continue;
      const R = Math.abs(N - (a * K + b * M))
      if (R < best[2]) {
        best = [a, b, R]
      }
    }
    
    return best
  }

  // Создание списка пицц
  const createPizzaList = (count: number, useSmall: boolean = false) => {
    const pizzas = []
    const slices = useSmall ? pizzaSettings.smallPizzaSlices : pizzaSettings.largePizzaSlices
    const price = useSmall ? getActualSmallPizzaPrice() : pizzaSettings.largePizzaPrice
    
    for (let i = 0; i < count; i++) {
      const isFree = pizzaSettings.useFreePizza && (i + 1) % pizzaSettings.freePizzaThreshold === 0
      
      // Если пицца бесплатная, используем настройку freePizzaIsSmall
      let pizzaSlices = slices
      let pizzaSize = useSmall ? 'small' : 'large'
      
      if (isFree && pizzaSettings.freePizzaIsSmall) {
        pizzaSlices = pizzaSettings.smallPizzaSlices
        pizzaSize = 'small'
      }
      
      pizzas.push({
        id: `pizza-${i}`,
        slices: pizzaSlices,
        price: price,
        isFree: isFree,
        size: pizzaSize
      })
    }
    return pizzas
  }
  
  // Функция расчета для выбранного варианта на основе списка пицц
  const calculateDistribution = (pizzaList: any[]) => {
    // Суммируем куски всех пицц в списке (каждая может иметь разное количество)
    const totalPizzaSlices = pizzaList.reduce((sum, pizza) => sum + pizza.slices, 0)
    let pieces = totalPizzaSlices - totalMinSlices  // Лишние куски
    const distribution: { [key: string]: number } = {}
    
    // Инициализация - каждый получает минимум
    users.forEach(user => {
      distribution[user.id] = user.minSlices
    })
    
    // Распределяем лишние куски по схеме
    // Распределяем оставшиеся кусочки по кругу
    while (pieces > 0) {
      let distributed = false
      
      for (const user of users) {
        if (pieces <= 0) break // Проверка на 0 или отрицательное значение
        
        if (user.canBeMore) {
          // Добавляем по 1 кусочку
          distribution[user.id]++
          pieces--
          distributed = true
        }
      }
      
      // Если никому не удалось распределить, выходим из цикла
      if (!distributed) break
    }
    
    return {
      distribution,
      extraSlices: pieces,
      totalSlices: Object.values(distribution).reduce((sum, val) => sum + val, 0),
      pizzaList
    }
  }
  
  // Расчет на лету
  // Шаг 1: Получаем общее количество желаемых кусков
  const totalMinSlices = users.reduce((sum, user) => sum + user.minSlices, 0)
  
  // Шаг 1.1: Получаем общее количество фактических кусков (для отображения)
  const totalActualSlices = users.reduce((sum, user) => sum + user.minSlices, 0)
  
  // Шаг 2: Находим ближайшее оптимальное количество пицц (большие)
  const largePizzaCount = Math.ceil(totalMinSlices / pizzaSettings.largePizzaSlices)
  const largePizzaList = createPizzaList(largePizzaCount, false)
  
  // Шаг 3: Если маленькие пиццы отличаются, делаем дополнительный расчет
  const smallPizzaCount = Math.ceil(totalMinSlices / pizzaSettings.smallPizzaSlices)
  const smallPizzaList = createPizzaList(smallPizzaCount, true)
  
  // Шаг 4: Оптимальная комбинация больших и маленьких пицц
  const [optimalLarge, optimalSmall, optimalRemainder] = bestFactors(
    totalMinSlices, 
    pizzaSettings.largePizzaSlices, 
    pizzaSettings.smallPizzaSlices
  )
  
  // Определяем, показывать ли вариант с оптимальной комбинацией
  const showOptimalOption = !pizzaSettings.smallEqual && optimalSmall > 0
  
  // Основной расчет (большие пиццы или выбранный вариант)
  let pizzaList = largePizzaList
  
  if (selectedVariant === 'small') {
    pizzaList = smallPizzaList
  }
  
  // Шаг 4: Теперь распределяем куски на человека на основе pizzaList
  const currentCalc = calculateDistribution(pizzaList)
  const actualSlices = currentCalc.distribution
  
  // Расчет лишних кусков для больших пицц (нужен для отображения кнопки "-1 пицца")
  const largeExtraSlices = (largePizzaCount * pizzaSettings.largePizzaSlices) - totalActualSlices
  
  // Альтернативный расчет (если убрать лишние куски) - только для больших
  const altPizzaCount = largePizzaCount - 1
  const altPizzaList = createPizzaList(altPizzaCount, false)
  const altCalc = calculateDistribution(altPizzaList)
  const altMissingSlices = altCalc.extraSlices < 0 ? Math.abs(altCalc.extraSlices) : 0
  
  // Подсчитываем количество активных вариантов для позиционирования
  const hasOptimal = showOptimalOption
  const hasLarge = true // Большие пиццы всегда показываются
  const hasReduced = altMissingSlices > 0 && altMissingSlices <= Math.floor(pizzaSettings.largePizzaSlices / 4) && altPizzaCount > 0
  
  const activeVariants = [hasOptimal, hasLarge, hasReduced].filter(Boolean).length
  
  // Автоматически выбираем единственный доступный вариант
  useEffect(() => {
    if (activeVariants === 1) {
      if (hasOptimal) {
        setSelectedVariant('small')
      } else if (hasLarge) {
        setSelectedVariant('current')
      } else if (hasReduced) {
        setSelectedVariant('reduced')
      }
    }
  }, [activeVariants, hasOptimal, hasLarge, hasReduced])
  
  // Если выбран альтернативный вариант, используем его
  if (selectedVariant === 'reduced') {
    Object.assign(actualSlices, altCalc.distribution)
  }
  
  // Рассчитываем дополнительные куски для каждого варианта
  const currentCalcForExtra = calculateDistribution(largePizzaList)
  
  const currentExtraSlicesForUsers = Object.values(currentCalcForExtra.distribution).reduce((sum, slices) => sum + slices, 0) - totalActualSlices
  const reducedExtraSlicesForUsers = Object.values(altCalc.distribution).reduce((sum, slices) => sum + slices, 0) - totalMinSlices
  

  const filteredSuggestions = savedUsers.filter(name => 
    name.toLowerCase().includes(formData.name.toLowerCase())
  )

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 overflow-y-auto pb-80">
        <div className="space-y-6">

      {/* Список участников */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2 text-gray-700">
          <Users className="h-5 w-5" />
          <span className="font-medium">Участники ({users.length})</span>
        </div>
        
        {users.length > 0 && (
          <div className="space-y-3">
          
          {users.map((user, index) => {
            const userRequiredSlices = user.minSlices  // Количество требуемых кусков
            
            // Рассчитываем actualSlices динамически на основе выбранного варианта
            let userActualSlices = user.minSlices
            if (selectedVariant === 'reduced') {
              const altCalc = calculateDistribution(createPizzaList(largePizzaCount - 1, false))
              userActualSlices = altCalc.distribution[user.id] || user.minSlices
            } else if (selectedVariant === 'small') {
              const [optimalLarge, optimalSmall] = bestFactors(
                users.reduce((sum, u) => sum + u.minSlices, 0), 
                pizzaSettings.largePizzaSlices, 
                pizzaSettings.smallPizzaSlices
              )
              // Создаем список пицц для оптимальной комбинации
              const optimalPizzaList = []
              for (let i = 0; i < optimalLarge; i++) {
                optimalPizzaList.push({ slices: pizzaSettings.largePizzaSlices, price: pizzaSettings.largePizzaPrice, isFree: false })
              }
              for (let i = 0; i < optimalSmall; i++) {
                optimalPizzaList.push({ slices: pizzaSettings.smallPizzaSlices, price: getActualSmallPizzaPrice(), isFree: false })
              }
              const optimalCalc = calculateDistribution(optimalPizzaList)
              userActualSlices = optimalCalc.distribution[user.id] || user.minSlices
            } else {
              // Обычный расчет (большие пиццы)
              userActualSlices = actualSlices[user.id] || user.minSlices
            }
            
            const gotExtra = userActualSlices > userRequiredSlices
            
            return (
              <div key={user.id} className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-3">
                  <div className="flex items-center gap-2 sm:gap-3">
                    {/* Номер */}
                    <div className="w-8 h-8 bg-pizza-100 text-pizza-600 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {index + 1}
                    </div>
                    
                    {/* Имя */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-900 truncate">{user.name}</p>
                    </div>
                    
                    {/* Кнопки +/- */}
                    <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleUpdateUserSlices(user.id, -1)}
                        disabled={user.minSlices <= 1}
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${
                          user.minSlices <= 1 
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                            : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                        }`}
                      >
                        <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
                      </button>
                      <span className="w-6 sm:w-8 text-center font-medium text-sm text-gray-900">
                        {userRequiredSlices}
                      </span>
                      <button
                        onClick={() => handleUpdateUserSlices(user.id, 1)}
                        disabled={user.minSlices >= 20}
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${
                          user.minSlices >= 20 
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                            : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                        }`}
                      >
                        <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                      </button>
                    </div>
                    
                    {/* Чекбокс "Можно больше" */}
                    <label className="flex items-center cursor-pointer flex-shrink-0" title="Можно больше">
                      <input
                        type="checkbox"
                        checked={user.canBeMore}
                        onChange={() => handleToggleCanBeMore(user.id)}
                        className="rounded border-gray-300 text-pizza-600 focus:ring-pizza-500 w-4 h-4 sm:w-5 sm:h-5"
                      />
                    </label>
                    
                    {/* Кнопка удалить */}
                    <button
                      onClick={() => handleRemoveUser(user.id)}
                      className="text-red-600 hover:text-red-800 p-1 flex-shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                {/* Визуализация кусков пиццы */}
                <div className="px-3 pb-3">
                  <div className="bg-gray-50 rounded-lg p-2">
                    <div className="flex flex-wrap gap-1 justify-center">
                      {(() => {
                        // Рассчитываем количество недостающих кусков только для выбранного варианта
                        let missingSlicesCount = 0
                        
                        // Зачеркиваем только если этот вариант в фокусе (выбран)
                        if (selectedVariant === 'small' && optimalRemainder < 0) {
                          missingSlicesCount = Math.abs(optimalRemainder)
                        } else if (selectedVariant === 'current' && currentCalcForExtra.extraSlices < 0) {
                          missingSlicesCount = Math.abs(currentCalcForExtra.extraSlices)
                        } else if (selectedVariant === 'reduced' && altMissingSlices > 0) {
                          missingSlicesCount = altMissingSlices
                        }
                        
                        // Определяем сколько кусков нужно зачеркнуть у этого пользователя
                        // Распределяем по круговой схеме: отнимаем по 1 у каждого пользователя по очереди
                        let slicesToCross = 0
                        if (missingSlicesCount > 0) {
                          // Полные круги - каждый получает одинаково
                          const fullRounds = Math.floor(missingSlicesCount / users.length)
                          slicesToCross = fullRounds
                          
                          // Остаток - распределяем первым пользователям
                          const remainder = missingSlicesCount % users.length
                          if (index < remainder) {
                            slicesToCross++
                          }
                          
                          slicesToCross = Math.min(slicesToCross, userRequiredSlices)
                        }
                        
                        return (
                          <>
                            {/* Основные куски (цветные) */}
                            {Array.from({ length: userRequiredSlices }).map((_, i) => {
                              const shouldCross = slicesToCross > 0 && i >= (userRequiredSlices - slicesToCross)
                              return (
                                <span 
                                  key={`main-${i}`} 
                                  className={`text-base sm:text-xl ${shouldCross ? 'relative' : ''}`}
                                  title={shouldCross ? "Не хватит" : "Основной кусок"}
                                >
                                  🍕
                                  {shouldCross && (
                                    <span className="absolute inset-0 flex items-center justify-center">
                                      <span className="w-full h-0.5 bg-red-600 rotate-45 transform scale-150"></span>
                                    </span>
                                  )}
                      </span>
                              )
                            })}
                            {/* Дополнительные куски (черно-белые) */}
                            {gotExtra && Array.from({ length: userActualSlices - userRequiredSlices }).map((_, i) => (
                              <span key={`extra-${i}`} className="text-base sm:text-xl grayscale" title="Дополнительный кусок">🍕</span>
                            ))}
                          </>
                        )
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
          
          {/* Панель с лишними кусками - показываем только для выбранного варианта */}
          {(() => {
            // Проверяем, есть ли хотя бы один пользователь с "Можно больше"
            const hasCanBeMore = users.some(user => user.canBeMore)
            
            // Если есть пользователи с "Можно больше", лишние куски распределяются как серые
            // и зеленую панель показывать не нужно
            if (hasCanBeMore) {
              return null
            }
            
            let extraSlicesCount = 0
            
            // Показываем панель только если вариант в фокусе
            if (selectedVariant === 'small' && optimalRemainder > 0) {
              extraSlicesCount = optimalRemainder
            } else if (selectedVariant === 'current' && (currentExtraSlicesForUsers > 0 || largeExtraSlices > 0)) {
              extraSlicesCount = currentExtraSlicesForUsers > 0 ? currentExtraSlicesForUsers : largeExtraSlices
            } else if (selectedVariant === 'reduced' && reducedExtraSlicesForUsers > 0) {
              extraSlicesCount = reducedExtraSlicesForUsers
            }
            
            if (extraSlicesCount > 0) {
              return (
                <div className="bg-green-50 rounded-lg shadow-sm border-2 border-green-200 p-3">
                  <div className="text-center mb-2">
                    <span className="text-sm font-medium text-green-800">Лишние куски</span>
                  </div>
                  <div className="flex flex-wrap gap-1 justify-center">
                    {Array.from({ length: extraSlicesCount }).map((_, i) => (
                      <span key={`extra-slice-${i}`} className="text-base sm:text-xl" title="Лишний кусок">🍕</span>
                    ))}
                  </div>
                </div>
              )
            }
            return null
          })()}
          </div>
        )}

        {/* Поле для добавления участника */}
      <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-200">
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Номер */}
          <div className="w-8 h-8 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
            {users.length + 1}
          </div>
          
          {/* Имя с автодополнением */}
          <div className="flex-1 min-w-0 relative">
            <input
              type="text"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value })
                setShowSuggestions(savedUsers.length > 0 && e.target.value.length > 0)
              }}
              onFocus={() => setShowSuggestions(savedUsers.length > 0 && formData.name.length > 0)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddUser()}
              className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pizza-500 text-sm"
              placeholder={`User ${users.length + 1}`}
            />
            
            {/* Выпадающий список */}
            {showSuggestions && filteredSuggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto">
                {filteredSuggestions.map((name, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      setFormData({ ...formData, name })
                      setShowSuggestions(false)
                    }}
                    className="px-3 py-2 hover:bg-pizza-50 cursor-pointer text-sm"
                  >
                    {name}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Кнопки +/- */}
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <button
              onClick={() => setFormData({ ...formData, slices: Math.max(1, formData.slices - 1) })}
              disabled={formData.slices <= 1}
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${
                formData.slices <= 1 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
            >
              <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
            </button>
            <span className="w-6 sm:w-8 text-center font-medium text-sm text-gray-900">{formData.slices}</span>
            <button
              onClick={() => setFormData({ ...formData, slices: Math.min(20, formData.slices + 1) })}
              disabled={formData.slices >= 20}
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${
                formData.slices >= 20 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
            >
              <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
            </button>
          </div>
          
          {/* Чекбокс "Можно больше" */}
          <label className="flex items-center cursor-pointer flex-shrink-0">
            <input
              type="checkbox"
              checked={formData.canBeMore}
              onChange={(e) => setFormData({ ...formData, canBeMore: e.target.checked })}
              className="rounded border-gray-300 text-pizza-600 focus:ring-pizza-500 w-4 h-4 sm:w-5 sm:h-5"
            />
          </label>
          
          {/* Кнопка добавить */}
          <button
            onClick={handleAddUser}
            className="bg-pizza-600 text-white p-1.5 sm:p-2 rounded-md hover:bg-pizza-700 flex-shrink-0"
          >
            <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </div>
      </div>
      </div>

        </div>
      </div>

      {/* Фиксированная панель снизу с расчетом */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="mx-auto px-4 py-3" style={{ maxWidth: '800px' }}>
          {/* Расчет */}
      {users.length > 0 && (
            <div className="mb-3">
              <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 min-h-[200px]">
                
                {showOptimalOption || (altMissingSlices > 0 && altMissingSlices <= Math.floor(pizzaSettings.largePizzaSlices / 4)) ? (
                  // Варианты расчета (кликабельные) - фиксированная сетка 9 полей
                  <div className="grid grid-cols-9 gap-1">
                    {/* Вариант 1: Оптимальная комбинация (если отличается от обычных больших) - ВСЕГДА СЛЕВА */}
                    {hasOptimal && (
                      <div className={`${activeVariants === 3 ? 'col-span-3' : activeVariants === 2 ? 'col-span-4' : 'col-span-5'}`}>
                        <button
                          onClick={() => setSelectedVariant('small')}
                          className={`border-2 rounded-lg p-3 transition-all w-full h-full ${
                            selectedVariant === 'small'
                              ? 'border-pizza-500 bg-pizza-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                        <div className="text-xs text-gray-600 mb-2 text-center font-medium">Оптимальная комбинация</div>
                        <div className="space-y-2">
                          <div className="text-center">
                            <div className="text-base sm:text-xl font-bold text-gray-900">
                              {optimalLarge === 0 ? optimalSmall : 
                               optimalSmall === 0 ? optimalLarge : 
                               `${optimalLarge} (${optimalSmall})`}
                            </div>
                            <div className="text-xs text-gray-600">
                              {optimalLarge === 0 ? 'Малых пицц' : 
                               optimalSmall === 0 ? 'Больших пицц' : 
                               'Больших (малых) пицц'}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm sm:text-lg font-bold text-blue-600">
                              {totalMinSlices}
                              {optimalRemainder !== 0 && (
                                <span className="text-gray-500 font-normal"> {optimalRemainder > 0 ? '+' : ''}</span>
                              )}
                              {optimalRemainder !== 0 && (
                                <span className={`font-bold ${optimalRemainder > 0 ? 'text-green-600' : 'text-red-600'}`}>{optimalRemainder}</span>
                              )}
                              {optimalRemainder !== 0 && (
                                <span className="text-gray-500 font-normal"> = </span>
                              )}
                              {optimalRemainder !== 0 && (
                                <span className="text-blue-600 font-bold">{totalMinSlices + optimalRemainder}</span>
                              )}
                            </div>
                            <div className="text-xs text-gray-600">Заказано кусков</div>
                          </div>
                          <div className="text-center">
                            <div className={`text-sm font-bold ${optimalRemainder !== 0 ? (optimalRemainder > 0 ? 'text-green-600' : 'text-red-600') : 'text-gray-400'}`}>
                              {Math.abs(optimalRemainder)}
                            </div>
                            <div className={`text-xs ${optimalRemainder !== 0 ? (optimalRemainder > 0 ? 'text-green-800' : 'text-red-800') : 'text-gray-400'}`}>
                              {optimalRemainder > 0 ? 'Лишних' : optimalRemainder < 0 ? 'Не хватит' : 'Лишних'}
                            </div>
                          </div>
                        </div>
                        </button>
                      </div>
                    )}
                    
                    {/* Пустые места для центрирования */}
                    {activeVariants === 2 && !hasOptimal && <div></div>}
                    {activeVariants === 1 && hasLarge && <div></div>}
                    {activeVariants === 1 && hasLarge && <div></div>}
                    
                    {/* Вариант 2: Большие пиццы */}
                    <div className={`${activeVariants === 3 ? 'col-span-3' : activeVariants === 2 ? 'col-span-4' : 'col-span-5'}`}>
              <button
                onClick={() => setSelectedVariant('current')}
                          className={`border-2 rounded-lg p-3 transition-all w-full h-full ${
                  selectedVariant === 'current'
                    ? 'border-pizza-500 bg-pizza-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-xs text-gray-600 mb-2 text-center font-medium">Большие</div>
                <div className="space-y-2">
                  <div className="text-center">
                    <div className="text-base sm:text-xl font-bold text-gray-900">{largePizzaCount}</div>
                    <div className="text-xs text-gray-600">Пицц</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm sm:text-lg font-bold text-blue-600">
                      {totalActualSlices}
                      {largeExtraSlices !== 0 && (
                        <span className="text-gray-500 font-normal"> {largeExtraSlices > 0 ? '+' : ''}</span>
                      )}
                      {largeExtraSlices !== 0 && (
                        <span className={`font-bold ${largeExtraSlices > 0 ? 'text-green-600' : 'text-red-600'}`}>{largeExtraSlices}</span>
                      )}
                      {largeExtraSlices !== 0 && (
                        <span className="text-gray-500 font-normal"> = </span>
                      )}
                      {largeExtraSlices !== 0 && (
                        <span className="text-blue-600 font-bold">{totalActualSlices + largeExtraSlices}</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-600">Заказано кусков</div>
                </div>
                    <div className="text-center">
                    <div className={`text-sm font-bold ${largeExtraSlices !== 0 ? (largeExtraSlices > 0 ? 'text-green-600' : 'text-red-600') : 'text-gray-400'}`}>
                      {Math.abs(largeExtraSlices)}
                    </div>
                    <div className={`text-xs ${largeExtraSlices !== 0 ? (largeExtraSlices > 0 ? 'text-green-800' : 'text-red-800') : 'text-gray-400'}`}>
                      {largeExtraSlices > 0 ? 'Лишних' : largeExtraSlices < 0 ? 'Не хватит' : 'Лишних'}
                    </div>
                      </div>
                  </div>
                </button>
                      </div>
                    
                    {/* Пустые места для центрирования после больших пицц */}
                    {activeVariants === 1 && hasLarge && <div></div>}
                    {activeVariants === 1 && hasLarge && <div></div>}
              
                    {/* Вариант 3: Убрать лишние (если при -1 пицце не хватит 1/4 пиццы и меньше и результат > 0) */}
                    {hasReduced && (
                      <div className={`${activeVariants === 3 ? 'col-span-3' : activeVariants === 2 ? 'col-span-4' : 'col-span-5'}`}>
                <button
                  onClick={() => setSelectedVariant('reduced')}
                            className={`border-2 rounded-lg p-3 transition-all w-full h-full ${
                    selectedVariant === 'reduced'
                      ? 'border-pizza-500 bg-pizza-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-xs text-gray-600 mb-2 text-center font-medium">-1 пицца</div>
                  <div className="space-y-2">
                    <div className="text-center">
                      <div className="text-base sm:text-xl font-bold text-gray-900">{altPizzaCount}</div>
                      <div className="text-xs text-gray-600">Пицц</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm sm:text-lg font-bold text-blue-600">
                        {totalMinSlices}
                        {reducedExtraSlicesForUsers > 0 && (
                          <span className="text-gray-500 font-normal"> +</span>
                        )}
                        {reducedExtraSlicesForUsers > 0 && (
                          <span className="text-green-600 font-bold">{reducedExtraSlicesForUsers}</span>
                        )}
                        {reducedExtraSlicesForUsers > 0 && (
                          <span className="text-gray-500 font-normal"> = </span>
                        )}
                        {reducedExtraSlicesForUsers > 0 && (
                          <span className="text-blue-600 font-bold">{totalMinSlices + reducedExtraSlicesForUsers}</span>
                        )}
                        {altMissingSlices > 0 && (
                          <span className="text-gray-500 font-normal"> -</span>
                        )}
                        {altMissingSlices > 0 && (
                          <span className="text-red-600 font-bold">{altMissingSlices}</span>
                        )}
                        {altMissingSlices > 0 && (
                          <span className="text-gray-500 font-normal"> = </span>
                        )}
                        {altMissingSlices > 0 && (
                          <span className="text-blue-600 font-bold">{totalMinSlices - altMissingSlices}</span>
                        )}
                      </div>
                      <div className="text-xs text-gray-600">Заказано кусков</div>
                    </div>
                      <div className="text-center">
                      <div className={`text-sm font-bold ${reducedExtraSlicesForUsers > 0 ? 'text-green-600' : altMissingSlices > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                        {reducedExtraSlicesForUsers > 0 ? reducedExtraSlicesForUsers : altMissingSlices > 0 ? altMissingSlices : 0}
                      </div>
                      <div className={`text-xs ${reducedExtraSlicesForUsers > 0 ? 'text-green-800' : altMissingSlices > 0 ? 'text-red-800' : 'text-gray-400'}`}>
                        {reducedExtraSlicesForUsers > 0 ? 'Лишних' : altMissingSlices > 0 ? 'Не хватит' : 'Лишних'}
                      </div>
                    </div>
                  </div>
                </button>
                        </div>
              )}
            </div>
          ) : (
            // Обычный расчет
            <div className="grid grid-cols-9 gap-1">
              {/* Пустые места для центрирования */}
              <div></div>
              <div></div>
              
              {/* Основной блок - 5 полей по центру */}
              <div className="col-span-5">
                <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 min-h-[200px]">
                  <div className="space-y-4">
                <div className="text-center">
                      <div className="sm:text-lg font-bold text-gray-900">{largePizzaCount}</div>
                  <div className="text-xs text-gray-600">Пицц</div>
                </div>
                <div className="text-center">
                      <div className="sm:text-lg font-bold text-blue-600">
                        {totalActualSlices}
                        {(currentExtraSlicesForUsers > 0 || largeExtraSlices > 0) && (
                          <span className="text-gray-500 font-normal text-sm sm:text-lg"> +</span>
                        )}
                        {(currentExtraSlicesForUsers > 0 || largeExtraSlices > 0) && (
                          <span className="text-green-600 font-bold text-sm sm:text-lg">{currentExtraSlicesForUsers > 0 ? currentExtraSlicesForUsers : largeExtraSlices}</span>
                        )}
                        {(currentExtraSlicesForUsers > 0 || largeExtraSlices > 0) && (
                          <span className="text-gray-500 font-normal text-sm sm:text-lg"> = </span>
                        )}
                        {(currentExtraSlicesForUsers > 0 || largeExtraSlices > 0) && (
                          <span className="text-blue-600 font-bold text-sm sm:text-lg">{totalActualSlices + (currentExtraSlicesForUsers > 0 ? currentExtraSlicesForUsers : largeExtraSlices)}</span>
                        )}
                      </div>
                      <div className="text-xs text-gray-600">Заказано кусков</div>
                    </div>
                    <div className="text-center">
                      <div className={`sm:text-lg font-bold ${(currentExtraSlicesForUsers > 0 || largeExtraSlices > 0) ? 'text-green-600' : currentCalcForExtra.extraSlices < 0 ? 'text-red-600' : 'text-gray-400'}`}>
                        {(currentExtraSlicesForUsers > 0 || largeExtraSlices > 0) ? (currentExtraSlicesForUsers > 0 ? currentExtraSlicesForUsers : largeExtraSlices) : currentCalcForExtra.extraSlices < 0 ? Math.abs(currentCalcForExtra.extraSlices) : 0}
                      </div>
                      <div className={`text-xs ${(currentExtraSlicesForUsers > 0 || largeExtraSlices > 0) ? 'text-green-800' : currentCalcForExtra.extraSlices < 0 ? 'text-red-800' : 'text-gray-400'}`}>
                        {(currentExtraSlicesForUsers > 0 || largeExtraSlices > 0) ? 'Лишних' : currentCalcForExtra.extraSlices < 0 ? 'Не хватит' : 'Лишних'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Пустые места для центрирования */}
              <div></div>
              <div></div>
            </div>
          )}
              </div>
        </div>
      )}

          <div className="flex items-center justify-between gap-3">
            {/* Кнопка показа результатов */}
            {users.length > 0 && (
              <button
                onClick={onShowResults}
                className="flex-1 bg-pizza-600 text-white py-2.5 px-6 rounded-lg font-medium flex items-center justify-center space-x-2"
              >
                <Calculator className="h-5 w-5" />
                <span>Показать результат</span>
              </button>
            )}
            
            {/* Пустое пространство для выравнивания */}
            {users.length === 0 && <div className="flex-1"></div>}
            
            {/* Кнопка настроек справа */}
            <button
              onClick={() => setShowSettings(true)}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-2.5 rounded-lg flex items-center justify-center flex-shrink-0"
              title="Настройки"
            >
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Модальное окно настроек */}
      <SettingsModal 
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={pizzaSettings}
        onSave={(newSettings: PizzaSettings) => {
          setPizzaSettings(newSettings)
          localStorage.setItem('pizzaSettings', JSON.stringify(newSettings))
          setShowSettings(false)
        }}
      />
    </div>
  )
}

export default CalculatorComponent

