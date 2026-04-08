'use client';

export default function HowItWorks() {
  const steps = [
    {
      number: 1,
      title: 'Create Your Account',
      description: 'Sign up in seconds with just your email and password. Choose your role as renter or landlord.',
    },
    {
      number: 2,
      title: 'Browse or Create',
      description: 'Search millions of listings or create your own. Use advanced filters to find the perfect match.',
    },
    {
      number: 3,
      title: 'Connect & Communicate',
      description: 'Message directly with interested parties. Discuss details and arrange viewings seamlessly.',
    },
    {
      number: 4,
      title: 'Complete Your Rental',
      description: 'Finalize agreements and start your rental journey. Manage everything from your dashboard.',
    },
  ];

  return (
    <section className="py-20 bg-slate-50 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            How It Works
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Get started in four simple steps
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {/* Connector line (hidden on mobile) */}
          <div className="hidden lg:block absolute top-1/4 left-0 right-0 h-1 bg-gradient-to-r from-blue-200 via-purple-200 to-blue-200 transform -translate-y-1/2" />

          {steps.map((step, idx) => (
            <div key={idx} className="relative">
              {/* Step circle */}
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-white border-4 border-blue-600 rounded-full flex items-center justify-center mb-6 font-bold text-xl text-blue-600 shadow-lg relative z-10">
                  {step.number}
                </div>

                <h3 className="text-lg font-semibold text-slate-900 mb-2 text-center">
                  {step.title}
                </h3>
                <p className="text-slate-600 text-center text-sm">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
