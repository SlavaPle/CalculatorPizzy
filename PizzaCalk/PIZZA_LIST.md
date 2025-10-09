# Список пицц (PizzaList)

## Концепция

Вместо использования фиксированного количества кусков на пиццу, система создает список пицц (`pizzaList`), где каждая пицца может иметь свое количество кусков.

## Структура пиццы

```typescript
interface Pizza {
  id: string;          // Уникальный идентификатор
  slices: number;      // Количество кусков в этой пицце
  price: number;       // Цена пиццы
  isFree: boolean;     // Бесплатная или нет
}
```

## Создание списка пицц

```typescript
const createPizzaList = (count: number) => {
  const pizzas = []
  for (let i = 0; i < count; i++) {
    const isFree = (i + 1) % freePizzaThreshold === 0
    pizzas.push({
      id: `pizza-${i}`,
      slices: largePizzaSlices,  // Из настроек
      price: largePizzaPrice,     // Из настроек
      isFree: isFree
    })
  }
  return pizzas
}
```

## Расчет общего количества кусков

```typescript
// Вместо: totalSlices = pizzaCount * 8
// Теперь:
const totalPizzaSlices = pizzaList.reduce((sum, pizza) => sum + pizza.slices, 0)
```

## Преимущества

1. **Гибкость**: Каждая пицца может иметь разное количество кусков
2. **Масштабируемость**: Легко добавить разные типы пицц
3. **Точность**: Учитываются настройки для каждой пиццы
4. **Расширяемость**: Можно добавить маленькие и большие пиццы в один заказ

## Примеры использования

### Пример 1: Однородный заказ
```typescript
pizzaList = [
  { id: 'pizza-0', slices: 8, price: 800, isFree: false },
  { id: 'pizza-1', slices: 8, price: 800, isFree: false },
  { id: 'pizza-2', slices: 8, price: 800, isFree: true }
]

totalPizzaSlices = 8 + 8 + 8 = 24
```

### Пример 2: Смешанный заказ (будущая функция)
```typescript
pizzaList = [
  { id: 'pizza-0', slices: 8, price: 800, isFree: false },  // Большая
  { id: 'pizza-1', slices: 6, price: 600, isFree: false },  // Маленькая
  { id: 'pizza-2', slices: 8, price: 800, isFree: true }    // Большая бесплатная
]

totalPizzaSlices = 8 + 6 + 8 = 22
```

### Пример 3: Нестандартные пиццы
```typescript
pizzaList = [
  { id: 'pizza-0', slices: 7, price: 750, isFree: false },  // 7 кусков
  { id: 'pizza-1', slices: 10, price: 1000, isFree: false }, // 10 кусков
  { id: 'pizza-2', slices: 7, price: 750, isFree: true }     // 7 кусков бесплатная
]

totalPizzaSlices = 7 + 10 + 7 = 24
```

## Алгоритм распределения

```typescript
// 1. Создаем список пицц
const pizzaList = createPizzaList(pizzaCount)

// 2. Считаем общее количество кусков
const totalPizzaSlices = pizzaList.reduce((sum, pizza) => sum + pizza.slices, 0)

// 3. Вычисляем лишние куски
const pieces = totalPizzaSlices - totalMinSlices

// 4. Распределяем лишние куски
for (const user of users) {
  if (user.canBeMore && pieces > 0) {
    user.actualSlices++
    pieces--
    if (pieces === 0) break
  }
}
```

## Настройки

Настройки пиццы хранятся в `pizzaSettings`:
```typescript
{
  smallPizzaSlices: 6,      // Кусков в маленькой пицце
  largePizzaSlices: 8,      // Кусков в большой пицце
  smallPizzaPrice: 600,     // Цена маленькой
  largePizzaPrice: 800,     // Цена большой
  freePizzaThreshold: 3     // Каждая N-я бесплатная
}
```

Эти настройки:
- Сохраняются в localStorage
- Можно изменить в модальном окне настроек
- Применяются ко всем расчетам
- Влияют на создание списка пицц




