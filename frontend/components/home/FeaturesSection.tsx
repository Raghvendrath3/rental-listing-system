'use client';

export default function FeaturesSection() {
  const features = [
    {
      icon: '🔍',
      title: 'Advanced Search',
      description: 'Filter by location, price, property type, and more to find exactly what you need',
    },
    {
      icon: '📋',
      title: 'Easy Listing Creation',
      description: 'Create and manage listings in minutes with our simple, intuitive form',
    },
    {
      icon: '📊',
      title: 'Management Dashboard',
      description: 'Track your listings, view inquiries, and manage your rental business efficiently',
    },
    {
      icon: '🔒',
      title: 'Secure & Verified',
      description: 'All users are verified and transactions are fully secured with encryption',
    },
    {
      icon: '💬',
      title: 'Direct Messaging',
      description: 'Communicate directly with renters and landlords through our platform',
    },
    {
      icon: '📱',
      title: 'Mobile Friendly',
      description: 'Browse and manage listings on the go with our responsive mobile design',
    },
  ];

  return (
    <section className="py-20 bg-white px-6">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Why Choose RentalHub?
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            We provide everything you need to find or list rental properties with confidence
          </p>
        </div>

        {/* Features grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="p-8 bg-slate-50 rounded-xl border border-slate-200 hover:border-blue-300 transition-colors"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-slate-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
