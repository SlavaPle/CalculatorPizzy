import { HelpCircle, BookOpen, ListChecks, Mail, ArrowRight, Home } from 'lucide-react'

interface HelpPageProps {
  onClose: () => void
  onStartCalculation: () => void
}

const HelpPage = ({ onClose, onStartCalculation }: HelpPageProps) => {
  const steps = [
    {
      title: 'Add participants',
      description: 'Specify names and slice ranges for everyone',
      icon: <ListChecks className="h-6 w-6 text-pizza-600" />
    },
    {
      title: 'Calculate',
      description: 'We build an optimal order and show cost sharing',
      icon: <HelpCircle className="h-6 w-6 text-pizza-600" />
    }
  ]

  const faq = [
    {
      question: 'How do free pizzas work?',
      answer: 'Mark pizzas as free — they stay in the order but do not add to total cost.'
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
          <div key={index} className="p-4 bg-gray-50 rounded-lg">
            {/* Prosty opis kroków - komentarz po polsku */}
            <div className="flex items-center space-x-3 mb-3">
              {step.icon}
              <h3 className="font-semibold text-gray-900">{step.title}</h3>
            </div>
            <p className="text-sm text-gray-600">{step.description}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">FAQ</h2>
        <div className="space-y-4">
          {faq.map((item, index) => (
            <div key={index}>
              <p className="font-medium text-gray-900">{item.question}</p>
              <p className="text-sm text-gray-600">{item.answer}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="p-4 bg-pizza-50 border border-pizza-100 rounded-lg">
          <h3 className="font-semibold text-pizza-800 mb-2">Need more details?</h3>
          <p className="text-sm text-pizza-800 mb-3">
            Read our extended guide about calculation schemes and pizza settings.
          </p>
          <a
            className="inline-flex items-center text-sm text-pizza-700 hover:text-pizza-800 font-medium"
            href="https://github.com/"
            target="_blank"
            rel="noreferrer"
          >
            Open docs
            <ArrowRight className="h-4 w-4 ml-1" />
          </a>
        </div>

        <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">Contact us</h3>
          <p className="text-sm text-blue-900 mb-3">
            Have issues or feature requests? Send a message and we will reply.
          </p>
          <div className="flex items-center space-x-2 text-sm text-blue-800">
            <Mail className="h-4 w-4" />
            <span>support@pizzacalk.app</span>
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-2 text-gray-700">
          <Home className="h-5 w-5" />
          <span>Back to app when you are ready.</span>
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

