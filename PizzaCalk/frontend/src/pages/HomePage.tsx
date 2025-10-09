import { Link } from 'react-router-dom'
import { User } from '../types'
import { Pizza, Calculator, Users, Settings, ArrowRight } from 'lucide-react'

interface HomePageProps {
  onLogin: (user: User) => void
  onGuestMode: () => void
}

const HomePage = ({ onLogin, onGuestMode }: HomePageProps) => {
  const features = [
    {
      icon: <Calculator className="h-8 w-8 text-pizza-600" />,
      title: "Умный расчет",
      description: "Автоматически рассчитывает оптимальное количество пицц и распределяет стоимость"
    },
    {
      icon: <Users className="h-8 w-8 text-pizza-600" />,
      title: "Учет предпочтений",
      description: "Каждый участник указывает свои предпочтения по количеству кусков"
    },
    {
      icon: <Pizza className="h-8 w-8 text-pizza-600" />,
      title: "Бесплатные пиццы",
      description: "Учитывает акции и бесплатные пиццы при расчете стоимости"
    }
  ]

  return (
    <div className="max-w-6xl mx-auto">
      {/* Hero секция */}
      <div className="text-center py-16">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
          Калькулятор закупок пиццы
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Умный расчет оптимального количества пицц для вашего офиса. 
          Учитываем предпочтения каждого участника и распределяем стоимость справедливо.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            to="/auth" 
            className="btn-primary text-lg px-8 py-3 inline-flex items-center"
          >
            Начать расчет
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
          <button 
            onClick={onGuestMode}
            className="btn-secondary text-lg px-8 py-3"
          >
            Гостевой режим
          </button>
        </div>
      </div>

      {/* Особенности */}
      <div className="py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Почему PizzaCalk?
        </h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="card text-center">
              <div className="flex justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Как это работает */}
      <div className="py-16 bg-white rounded-lg shadow-sm">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Как это работает
          </h2>
          <p className="text-lg text-gray-600">
            Простой процесс в 4 шага
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-8">
          {[
            "Добавьте участников и их предпочтения",
            "Выберите типы пицц и соусов",
            "Система рассчитает оптимальное количество",
            "Получите детальный расчет стоимости"
          ].map((step, index) => (
            <div key={index} className="text-center">
              <div className="w-12 h-12 bg-pizza-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                {index + 1}
              </div>
              <p className="text-gray-700">{step}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center py-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Готовы начать?
        </h2>
        <p className="text-lg text-gray-600 mb-8">
          Создайте свой первый расчет за 2 минуты
        </p>
        <Link 
          to="/calculator" 
          className="btn-primary text-lg px-8 py-3 inline-flex items-center"
        >
          Открыть калькулятор
          <ArrowRight className="ml-2 h-5 w-5" />
        </Link>
      </div>
    </div>
  )
}

export default HomePage





