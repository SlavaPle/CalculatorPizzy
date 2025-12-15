import { HelpCircle, ListChecks, ArrowRight, Home, DollarSign } from 'lucide-react'

interface HelpPageProps {
  onClose: () => void
  onStartCalculation: () => void
}

const HelpPage = ({ onClose, onStartCalculation }: HelpPageProps) => {
  const steps = [
    {
      title: 'Add people',
      description:
        'Write down everyone who will eat pizza and roughly how many slices they want. No registrations or emails – just names and appetite (you can even skip names).',
      icon: <ListChecks className="h-6 w-6 text-pizza-600" />
    },
    {
      title: 'Distribute slices',
      description:
        'The app calculates how many pizzas you need and distributes slices among all participants based on their preferences.',
      icon: <HelpCircle className="h-6 w-6 text-pizza-600" />
    },
    {
      title: 'Enter total amount',
      description:
        'Enter the total cost of the order and the app will calculate how much each participant should pay based on the slices they received.',
      icon: <DollarSign className="h-6 w-6 text-pizza-600" />
    }
  ]

  return (
    <div className="card">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center space-x-3">
          <HelpCircle className="h-8 w-8 text-pizza-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Help & tips</h1>
            <p className="text-gray-600">Quick guide to start calculations faster</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Close
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-8">
        {steps.map((step, index) => (
          <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-100">
            {/* Prosty opis kroków - komentarz po polsku */}
            <div className="flex items-center space-x-3 mb-3">
              {step.icon}
              <h3 className="font-semibold text-gray-900">{step.title}</h3>
            </div>
            <p className="text-sm text-gray-600">{step.description}</p>
          </div>
        ))}
      </div>

      <div className="p-4 bg-pizza-50 border border-pizza-100 rounded-lg mb-6">
        {/* Opis logiki aplikacji – komentarz po polsku */}
        <h2 className="text-lg font-semibold text-pizza-800 mb-2">
          What exactly does PizzaCalk calculate?
        </h2>
        <p className="text-sm text-pizza-800 mb-2">
          PizzaCalk does not just count pizzas, it counts slices. The app looks at how many slices each person wants and sums it into one clear number.
        </p>
        <p className="text-sm text-pizza-800 mb-2">
          For every person you set a range: “from” and “to” slices. There is also a checkbox that means “I am okay to take extra slices” – this helps distribute remaining slices fairly.
        </p>
        <p className="text-sm text-pizza-800">
          If after calculation there are only a few extra slices, PizzaCalk can suggest ordering fewer pizzas so the total is closer to what the team can actually eat, without overpaying.
        </p>
      </div>

      <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-2 text-gray-700">
          <Home className="h-5 w-5" />
          <span>Back to the calculator when you are ready to try it.</span>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="btn-secondary px-6"
          >
            Back
          </button>
          <button
            onClick={onStartCalculation}
            className="btn-primary px-6 inline-flex items-center justify-center"
          >
            Start calculation
            <ArrowRight className="h-4 w-4 ml-2" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default HelpPage

