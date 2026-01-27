import { User } from '../../shared/types'
import { ArrowLeft, Calculator, Users, Gift, CheckCircle } from 'lucide-react'

interface PizzaCalculationProps {
  calculation: any
  users: User[]
  onBack: () => void
  onFinalCalculate: () => void
}

const PizzaCalculation = ({ calculation, users, onBack, onFinalCalculate }: PizzaCalculationProps) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Pizza quantity calculation
        </h1>
        <p className="text-gray-600">
          Review the calculation and confirm the order
        </p>
      </div>

      {/* Main statistics */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 text-center">
          <div className="text-2xl font-bold text-pizza-600 mb-1">
            {calculation.totalSlices}
          </div>
          <div className="text-sm text-gray-600">Total slices</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 text-center">
          <div className="text-2xl font-bold text-blue-600 mb-1">
            {calculation.pizzaCount}
          </div>
          <div className="text-sm text-gray-600">Pizzas needed</div>
        </div>
      </div>

      {/* Calculation details */}
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
        <h3 className="font-medium text-gray-900 mb-4 flex items-center space-x-2">
          <Calculator className="h-5 w-5" />
          <span>Calculation details</span>
        </h3>

        <div className="space-y-1 sm: space-y-3">
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-700">Participants:</span>
            <span className="font-medium">{calculation.totalUsers}</span>
          </div>

          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-700">Desired slices:</span>
            <span className="font-medium">{calculation.totalSlices}</span>
          </div>

          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-700">Slices per pizza:</span>
            <span className="font-medium">8</span>
          </div>

          <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
            <span className="text-blue-700 font-medium">Pizzas needed:</span>
            <span className="font-bold text-blue-900">{calculation.pizzaCount}</span>
          </div>
        </div>
      </div>

      {/* Free pizzas */}
      {calculation.freePizzaCount > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Gift className="h-5 w-5 text-green-600" />
            <h4 className="font-medium text-green-900">
              Free pizzas!
            </h4>
          </div>
          <p className="text-sm text-green-800 mb-3">
            When ordering {calculation.pizzaCount} pizzas you get {calculation.freePizzaCount} free pizzas.
          </p>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex justify-between">
              <span>Paid pizzas:</span>
              <span className="font-medium">{calculation.regularPizzaCount}</span>
            </div>
            <div className="flex justify-between">
              <span>Free pizzas:</span>
              <span className="font-medium text-green-600">{calculation.freePizzaCount}</span>
            </div>
          </div>
        </div>
      )}

      {/* Participants */}
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
        <h3 className="font-medium text-gray-900 mb-4 flex items-center space-x-2">
          <Users className="h-5 w-5" />
          <span>Participants ({users.length})</span>
        </h3>

        <div className="space-y-1 sm: space-y-3">
          {users.map((user) => (
            <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium text-gray-900">{user.name}</div>
                <div className="text-sm text-gray-600">
                  Slices: {user.minSlices} - {user.maxSlices}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">
                  {user.maxSlices} slices
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div className="space-y-1 sm: space-y-3">
        <button
          onClick={onFinalCalculate}
          className="w-full bg-pizza-600 text-white py-3 px-6 rounded-lg font-medium flex items-center justify-center space-x-2"
        >
          <CheckCircle className="h-5 w-5" />
          <span>Confirm order</span>
        </button>

        <button
          onClick={onBack}
          className="w-full bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-medium flex items-center justify-center space-x-2"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to editing</span>
        </button>
      </div>

      {/* Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">
          What's next?
        </h4>
        <p className="text-sm text-blue-800">
          After confirmation you will see detailed cost calculation,
          distribution among participants and be able to share the result.
        </p>
      </div>
    </div>
  )
}

export default PizzaCalculation








