'use client';

export default function TestimonialsSection() {
  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Renter',
      content: 'Found my dream apartment in just one week. The process was so smooth and transparent.',
      rating: 5,
    },
    {
      name: 'Michael Chen',
      role: 'Landlord',
      content: 'Managing my 5 properties has never been easier. Highly recommended for property owners.',
      rating: 5,
    },
    {
      name: 'Emma Wilson',
      role: 'Renter',
      content: 'Great selection of listings and responsive landlords. Best experience renting online!',
      rating: 5,
    },
  ];

  return (
    <section className="py-20 bg-white px-6">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Loved by Users
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Real feedback from renters and landlords using RentalHub
          </p>
        </div>

        {/* Testimonials grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, idx) => (
            <div
              key={idx}
              className="p-8 bg-slate-50 rounded-xl border border-slate-200 hover:shadow-lg transition-shadow"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <span key={i} className="text-yellow-400 text-lg">★</span>
                ))}
              </div>

              {/* Content */}
              <p className="text-slate-700 mb-6 italic">
                &ldquo;{testimonial.content}&rdquo;
              </p>

              {/* Author */}
              <div>
                <p className="font-semibold text-slate-900">{testimonial.name}</p>
                <p className="text-sm text-slate-600">{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
