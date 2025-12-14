import { Link } from 'react-router-dom'
import { User } from '../shared/types'
import { Pizza, Calculator, Users, ArrowRight } from 'lucide-react'

interface HomePageProps {
  onLogin: (user: User) => void
  onGuestMode: () => void
}

const HomePage = ({ onLogin: _onLogin, onGuestMode }: HomePageProps) => {
  const features = [
    {
      icon: <Calculator className="h-8 w-8 text-pizza-600" />,
      title: "Smart calculation",
      description: "Automatically calculates optimal pizza quantity and distributes cost"
    },
    {
      icon: <Users className="h-8 w-8 text-pizza-600" />,
      title: "Preference tracking",
      description: "Each participant specifies their preferences for number of slices"
    },
    {
      icon: <Pizza className="h-8 w-8 text-pizza-600" />,
      title: "Free pizzas",
      description: "Takes into account promotions and free pizzas when calculating cost"
    }
  ]

  return (
    <div className="max-w-6xl mx-auto">
      {/* Hero section */}
      <div className="text-center py-16">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
          Pizza Purchase Calculator
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Smart calculation of optimal pizza quantity for your office.
          We consider each participant's preferences and distribute costs fairly.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/auth"
            className="btn-primary text-lg px-8 py-3 inline-flex items-center"
          >
            Start calculation
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
          <button
            onClick={onGuestMode}
            className="btn-secondary text-lg px-8 py-3"
          >
            Guest mode
          </button>
        </div>
      </div>

      {/* Features */}
      <div className="py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Why PizzaCalk?
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

      {/* How it works */}
      <div className="py-16 bg-white rounded-lg shadow-sm">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            How it works
          </h2>
          <p className="text-lg text-gray-600">
            Simple process in 4 steps
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-8">
          {[
            "Add participants and their preferences",
            "Choose pizza types",
            "System calculates optimal quantity",
            "Get detailed cost calculation"
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
          Ready to start?
        </h2>
        <p className="text-lg text-gray-600 mb-8">
          Create your first calculation in 2 minutes
        </p>
        <Link
          to="/calculator"
          className="btn-primary text-lg px-8 py-3 inline-flex items-center"
        >
          Open calculator
          <ArrowRight className="ml-2 h-5 w-5" />
        </Link>
      </div>
    </div>
  )
}

export default HomePage









