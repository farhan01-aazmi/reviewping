const CATEGORY_MAP = {
  "Restaurant": "food",
  "Cafe": "food",
  "Bar & Lounge": "food",
  "Bakery": "food",
  "Food Truck": "food",
  "Catering": "food",
  "Other Food & Dining": "food",
  "Dentist": "medical",
  "Doctor / Clinic": "medical",
  "Physiotherapy": "medical",
  "Chiropractor": "medical",
  "Optometrist": "medical",
  "Pharmacy": "medical",
  "Mental Health": "medical",
  "Other Health & Medical": "medical",
  "Salon": "beauty",
  "Barbershop": "beauty",
  "Spa": "beauty",
  "Nail Salon": "beauty",
  "Tattoo Studio": "beauty",
  "Med Spa": "beauty",
  "Other Beauty & Personal Care": "beauty",
  "Auto Repair": "auto",
  "Car Wash": "auto",
  "Auto Body Shop": "auto",
  "Tire Shop": "auto",
  "Car Dealership": "auto",
  "Oil Change": "auto",
  "Other Automotive": "auto",
  "Plumber": "home",
  "Electrician": "home",
  "HVAC": "home",
  "House Cleaning": "home",
  "Landscaping": "home",
  "Painter": "home",
  "Roofer": "home",
  "Pest Control": "home",
  "Other Home Services": "home",
  "Legal Consultation": "professional",
  "Accounting": "professional",
  "Real Estate": "professional",
  "Insurance Agent": "professional",
  "Financial Advisor": "professional",
  "Marketing Agency": "professional",
  "Other Professional Services": "professional",
  "Gym / Fitness Center": "fitness",
  "Yoga Studio": "fitness",
  "Personal Trainer": "fitness",
  "Sports Club": "fitness",
  "Dance Studio": "fitness",
  "Martial Arts": "fitness",
  "Other Fitness & Recreation": "fitness",
  "Retail Store": "retail",
  "Boutique": "retail",
  "Supermarket": "retail",
  "Convenience Store": "retail",
  "Electronics": "retail",
  "Furniture Store": "retail",
  "Other Retail & Shopping": "retail",
  "Hotel": "hospitality",
  "Bed & Breakfast": "hospitality",
  "Vacation Rental": "hospitality",
  "Travel Agency": "hospitality",
  "Airport Service": "hospitality",
  "Other Hospitality & Travel": "hospitality",
  "Other": "other",
};

const TEMPLATES_BY_GROUP = {
  food: {
    5: [
      "Everything about {business} was top-notch! The quality and presentation were outstanding, and the staff made sure we had everything we needed. Can't wait to come back!",
      "What an incredible experience at {business}! Every detail was well thought out, the atmosphere was welcoming, and the service was genuinely impressive. Highly recommended!",
      "Absolutely loved {business}! The quality exceeded expectations, the team was professional and friendly, and the overall experience was fantastic. A well-deserved 5 stars!",
    ],
    4: [
      "Really enjoyed my visit to {business}! Great quality, friendly service, and a pleasant atmosphere. A solid choice that delivers consistently. Would definitely recommend!",
      "Had a great experience at {business}. Fresh, well-prepared, and served with a smile. Happy with the value and will be returning soon.",
      "Pleasantly surprised by {business}! Good quality, efficient service, and fair pricing. A reliable option that gets it right more often than not.",
    ],
    3: [
      "Decent experience at {business}. The quality was fine but nothing special. Service was okay. An average experience overall.",
      "Mixed visit to {business}. Some things were good, others could use improvement. Not bad, but not great either.",
      "Stopped by {business} — it was okay. Nothing stood out as exceptional, but nothing was terrible either. Fine for what it is.",
    ],
    2: [
      "Disappointed with {business}. The quality wasn't what I expected and the service felt rushed. Room for improvement in several areas.",
      "Had a below-average experience at {business}. The value didn't match the cost and the overall experience left much to be desired.",
      "Not my best experience. {business} needs to improve on quality and consistency. Wouldn't recommend in its current state.",
    ],
    1: [
      "Very poor experience at {business}. From start to finish, things didn't go well. Quality was subpar and service was lacking.",
      "Wish I could give zero stars. {business} missed the mark on quality, service, and value. Significant improvements needed.",
      "Avoid — terrible experience at {business}. Nothing about the visit was positive. Quality was poor and service was disappointing.",
    ],
  },
  medical: {
    5: [
      "{business} is truly exceptional! The entire team was professional, caring, and made me feel completely at ease. Thorough, knowledgeable, and genuinely compassionate. Highly recommend!",
      "Outstanding care at {business}! From the moment I walked in, everyone was warm and professional. The practitioner took time to listen and explain everything clearly. Five stars!",
      "What a relief to find {business}! Professional, efficient, and they truly care about their patients. Clear communication, comfortable environment, and excellent results.",
    ],
    4: [
      "Good experience at {business}. Professional staff, reasonable wait time, and the practitioner listened to my concerns. Clean facility and clear communication.",
      "Pleased with the care at {business}. Courteous team, thorough consultation, and they explained everything well. A reliable healthcare provider.",
      "Had a positive visit to {business}. Friendly team, addressed my concerns, and followed up appropriately. Good experience overall.",
    ],
    3: [
      "Average experience at {business}. The care was adequate but the wait was longer than expected. Nothing exceptional, nothing terrible.",
      "Okay visit to {business}. The practitioner was professional but the appointment felt a bit rushed. Adequate for basic needs.",
      "Decent but unremarkable experience at {business}. Got the care I needed but the process could have been smoother.",
    ],
    2: [
      "Not the best experience at {business}. Long wait times and communication could have been better. Felt a bit rushed during the appointment.",
      "Disappointed with my visit to {business}. My concerns weren't fully addressed and the follow-up was lacking. Needs improvement.",
      "{business} didn't meet expectations. The facility was fine but the quality of care and communication fell short of what I hoped for.",
    ],
    1: [
      "Very poor experience at {business}. Unprofessional interaction, excessive wait, and my concerns were dismissed. Would not recommend.",
      "Terrible experience at {business}. Felt completely ignored and my health concerns were not taken seriously. Seek care elsewhere.",
      "Avoid — from the front desk to the practitioner, every interaction at {business} was disappointing and unprofessional.",
    ],
  },
  beauty: {
    5: [
      "Absolutely transformed by {business}! The team is incredibly talented, the atmosphere is relaxing, and the results exceeded my expectations. A truly exceptional experience!",
      "{business} is pure magic! Expert technique, high-quality products, and stunning results. Everyone was warm and professional. I've already booked my next appointment!",
      "I am absolutely thrilled with {business}! They listened to exactly what I wanted and delivered beyond my expectations. The best experience I've had in a long time!",
    ],
    4: [
      "Really happy with my experience at {business}! Professional team, clean environment, and the result was exactly what I asked for. Would recommend and will come back!",
      "Had a lovely time at {business}. Good service, fair pricing, and a pleasant atmosphere. Happy with the results.",
      "{business} did a solid job. Friendly staff, nice environment, and good quality work. A reliable choice.",
    ],
    3: [
      "Average experience at {business}. The service was okay but nothing exceptional. Some areas could be improved for a better customer experience.",
      "Decent visit to {business}. The staff was polite but the service didn't quite meet my expectations. Might give them another try.",
      "{business} was fine for a basic appointment. Nothing special, nothing terrible. Fair for the price.",
    ],
    2: [
      "Disappointed with my appointment at {business}. The service didn't match what I asked for and communication was lacking. Needs improvement.",
      "{business} fell short of expectations. The quality was inconsistent and the experience wasn't worth the cost. Wouldn't recommend.",
      "Not impressed with {business}. The result was disappointing and the service didn't meet basic expectations.",
    ],
    1: [
      "Terrible experience at {business}. Completely ignored what I asked for and the result was unacceptable. Will not be returning.",
      "Very disappointed with {business}. Unprofessional service and poor quality work. Save your time and go elsewhere.",
      "Worst experience I've had at a place like this. {business} needs a complete overhaul of their service standards.",
    ],
  },
  auto: {
    5: [
      "Honest mechanics exist and they're at {business}! Fair pricing, transparent communication, and excellent workmanship. My vehicle runs better than ever. Trustworthy for life!",
      "{business} saved the day! Diagnosed the issue quickly, fixed it right the first time, and had me back on the road. Fair prices and top-notch quality.",
      "What a relief to find an honest auto shop! {business} was upfront about what needed fixing and what could wait. Outstanding quality and trustworthy service.",
    ],
    4: [
      "Good experience at {business}. Accurate diagnosis, reasonable timeframe, and fair pricing. Kept me updated throughout. Would recommend.",
      "{business} did a solid job. Clear communication, work completed on schedule, and reasonable price. A reliable shop.",
      "Took my vehicle to {business} for service. They were upfront about costs, did the work well, and had it ready on time. Good local shop.",
    ],
    3: [
      "Average experience at {business}. The work was done adequately but communication could have been better. Nothing exceptional.",
      "{business} fixed the issue but it took longer than quoted. The work was acceptable but the experience was just okay.",
      "Decent service at {business}. Got the problem fixed but the pricing felt a bit high for what was done. Okay for basic service.",
    ],
    2: [
      "Not impressed with {business}. The diagnosis was wrong initially and communication was poor. Took longer than promised.",
      "Disappointed with the service at {business}. The final bill was higher than quoted and the experience was frustrating.",
      "{business} fell short. The repair didn't fully solve the problem and I had to bring it back. Not a great experience.",
    ],
    1: [
      "Terrible experience at {business}. Overcharged for substandard work and the problem wasn't even fixed properly. Avoid at all costs!",
      "Worst auto service experience. {business} was dishonest about what needed repairs. Do not trust them with your vehicle.",
      "Absolute nightmare with {business}. Poor workmanship, hidden fees, and zero accountability. Save yourself the headache.",
    ],
  },
  home: {
    5: [
      "{business} is absolutely fantastic! Professional, punctual, and the quality of work is outstanding. They went above and beyond what I expected. Highly recommend!",
      "Couldn't be happier with {business}! They showed up on time, explained everything clearly, and the work was flawless. Fair pricing and exceptional service.",
      "What a great experience with {business}! Clean, efficient, and the team was incredibly professional. They take real pride in their work and it shows.",
    ],
    4: [
      "Really pleased with {business}! Professional team, good communication, and the work was done well. Fair pricing and on schedule. Would hire again.",
      "Had a great experience with {business}. They were punctual, courteous, and did quality work. Happy with the results.",
      "{business} did a solid job. Clear quote, on-time arrival, and the finished work looks great. A reliable choice.",
    ],
    3: [
      "Average experience with {business}. The work was done adequately but there were some communication hiccups. Not bad, not great.",
      "{business} was okay. They completed the job but it took longer than expected. The quality was acceptable.",
      "Decent but unremarkable. {business} did the work as quoted but nothing stood out as exceptional. Fine for basic jobs.",
    ],
    2: [
      "Disappointed with {business}. The work was below what I expected and communication was lacking. Wouldn't hire again.",
      "Not a great experience. {business} was late, the work was rushed, and the cleanup was minimal. Needs improvement.",
      "{business} fell short of expectations. The quality wasn't there and the value didn't match the cost. Would look elsewhere next time.",
    ],
    1: [
      "Terrible experience with {business}. Unprofessional, poor quality work, and they left a mess. Do not recommend.",
      "Avoid {business} at all costs. Shoddy work, hidden charges, and zero follow-through. Complete waste of time and money.",
      "Worst experience I've had with a service provider. {business} was unreliable, unprofessional, and the work was unacceptable.",
    ],
  },
  professional: {
    5: [
      "Exceptional service from {business}! Professional, thorough, and they took the time to understand my needs completely. The guidance I received was invaluable. Highly recommended!",
      "{business} exceeded all expectations! Knowledgeable, responsive, and they made a complex process feel straightforward. Truly world-class service.",
      "What a difference working with {business} made! Clear communication, expert advice, and genuine care for their clients. Worth every penny and more.",
    ],
    4: [
      "Great experience with {business}. Professional, knowledgeable, and responsive. They provided sound advice and clear communication throughout.",
      "Pleased with the service from {business}. They were thorough, explained everything well, and delivered on their promises. A reliable professional.",
      "{business} provided solid service. Good communication, fair pricing, and they addressed my needs effectively. Would recommend.",
    ],
    3: [
      "Adequate service from {business}. They were professional but the process felt slower than expected. Nothing exceptional but not bad either.",
      "Okay experience with {business}. Communication was decent but follow-through could have been better. Average overall.",
      "{business} was fine for basic needs. Got the job done but didn't go above and beyond. Acceptable but not impressive.",
    ],
    2: [
      "Disappointed with {business}. Communication was slow and the advice felt generic rather than tailored. Expected more for the cost.",
      "Not a great experience. {business} missed deadlines and didn't communicate proactively. Wouldn't use again.",
      "{business} fell short. The service was adequate at best and didn't justify the cost. Needs improvement in several areas.",
    ],
    1: [
      "Very poor experience with {business}. Unresponsive, unprofessional, and the quality of work was unacceptable. Avoid.",
      "Terrible service from {business}. They dropped the ball on multiple occasions and showed no accountability. Save your money.",
      "Worst professional service I've ever used. {business} was disorganized, unreliable, and delivered subpar work. Do not recommend.",
    ],
  },
  fitness: {
    5: [
      "{business} is absolutely incredible! The facility is top-notch, the trainers are knowledgeable and motivating, and the atmosphere is welcoming. Best decision I've ever made!",
      "Cannot say enough good things about {business}! Every session is challenging and rewarding. The team genuinely cares about your progress and pushes you to be your best.",
      "Outstanding experience at {business}! Clean, well-equipped, and the staff is incredibly supportive. Whether you're a beginner or advanced, this is the place to be.",
    ],
    4: [
      "Really happy with {business}! Great facilities, friendly trainers, and a positive atmosphere. Always leave feeling energized. Would recommend!",
      "Enjoying my time at {business}. Good equipment, knowledgeable staff, and a welcoming community. Solid choice for getting fit.",
      "{business} provides a great workout environment. Clean, well-maintained, and the trainers are helpful and encouraging. Happy with my experience.",
    ],
    3: [
      "Decent facility at {business}. Equipment is adequate but could use updating in some areas. Staff is friendly but not always available.",
      "Average experience at {business}. It has what you need for a basic workout but doesn't go above and beyond. Fine for the price.",
      "{business} is okay. Gets the job done for a standard workout but nothing special about the atmosphere or amenities.",
    ],
    2: [
      "Disappointed with {business}. Equipment is often busy or in need of maintenance. The atmosphere could be more welcoming.",
      "Not great experience at {business}. Felt crowded, cleanliness could improve, and staff engagement was minimal.",
      "{business} needs work. The facility is outdated and the overall experience doesn't justify the membership cost.",
    ],
    1: [
      "Terrible experience at {business}. Dirty equipment, unhelpful staff, and the atmosphere was unwelcoming. Would not recommend.",
      "Avoid {business}. Poor maintenance, overcrowded, and the staff showed little interest in helping members. A waste of money.",
      "Worst facility I've been to. {business} is rundown, unprofessional, and the overall experience was extremely disappointing.",
    ],
  },
  retail: {
    5: [
      "Amazing shopping experience at {business}! The selection is fantastic, the staff is incredibly helpful, and the quality is outstanding. My new favorite place to shop!",
      "{business} is a gem! Excellent product range, fair pricing, and the customer service is genuinely outstanding. They go above and beyond for their customers.",
      "Had the best experience at {business}! From the moment I walked in, the service was exceptional. Great quality, beautiful store, and wonderful staff.",
    ],
    4: [
      "Great shopping experience at {business}! Good selection, helpful staff, and easy checkout. Found exactly what I needed. Will definitely return.",
      "Really pleased with {business}. Quality products, reasonable prices, and friendly service. A pleasant shopping experience overall.",
      "{business} had what I needed at a fair price. The staff was helpful and the store was well-organized. Happy with my purchase.",
    ],
    3: [
      "Average shopping experience at {business}. The selection was decent but nothing special. Service was okay but could be more attentive.",
      "Okay experience at {business}. Found what I needed but the pricing felt a bit high for the quality. An average visit overall.",
      "{business} was fine. Got what I came for but the experience wasn't memorable. Acceptable for a quick shopping trip.",
    ],
    2: [
      "Disappointed with {business}. Limited selection and the staff wasn't very helpful. Pricing didn't match the quality offered.",
      "Not a great shopping experience. {business} was disorganized and the customer service was lacking. Expected more.",
      "{business} fell short. The product quality didn't match the description and returns were a hassle. Wouldn't recommend.",
    ],
    1: [
      "Terrible experience at {business}. Rude staff, poor quality products, and the return policy is a nightmare. Avoid at all costs.",
      "Very disappointed with {business}. Misleading product descriptions and zero customer service. Complete waste of time.",
      "Worst shopping experience. {business} is overpriced, understaffed, and the customer service is nonexistent. Will never shop here again.",
    ],
  },
  hospitality: {
    5: [
      "Absolutely loved my stay at {business}! Impeccably clean, beautifully appointed, and the staff anticipated every need. A truly memorable and luxurious experience from start to finish!",
      "{business} exceeded every expectation! The accommodations were stunning, the service was impeccable, and every detail was thoughtfully considered. Can't wait to return!",
      "What a wonderful experience at {business}! From check-in to check-out, everything was seamless. Comfortable, clean, and the hospitality was genuinely warm and welcoming.",
    ],
    4: [
      "Great stay at {business}! Comfortable rooms, friendly staff, and good amenities. Clean and well-maintained. Would definitely stay again.",
      "Really enjoyed my time at {business}. The accommodations were comfortable, the staff was helpful, and the location was convenient. Good value.",
      "{business} provided a pleasant experience. Clean rooms, courteous staff, and everything we needed was available. Happy with the choice.",
    ],
    3: [
      "Decent stay at {business}. The room was comfortable but some areas could use updating. Service was friendly but not exceptional.",
      "Average experience at {business}. It was fine for a short stay but nothing stood out. Adequate accommodation at a fair price.",
      "{business} was okay. Got what I paid for but the amenities were basic and the service was just average.",
    ],
    2: [
      "Disappointed with my stay at {business}. The room wasn't as clean as expected and the service was slow. Needs improvement.",
      "Not a great experience. {business} had maintenance issues and the staff seemed overwhelmed. Expected more for the price.",
      "{business} didn't meet expectations. The accommodations were tired and the hospitality fell short of what was promised.",
    ],
    1: [
      "Terrible experience at {business}. Unclean room, unhelpful staff, and the facilities were in poor condition. Would never return.",
      "Avoid {business}. Misleading photos, poor maintenance, and zero hospitality. The worst experience I've had traveling.",
      "Absolutely awful stay. {business} is rundown, unprofessional, and offered no value whatsoever. Save your money and stay elsewhere.",
    ],
  },
  other: {
    5: [
      "Absolutely amazing experience with {business}! The quality of service exceeded all expectations. Professional, seamless, and genuinely impressive. Highly recommend!",
      "{business} is outstanding! Professional, reliable, and they truly care about their customers. A well-deserved 5 stars!",
      "Cannot recommend {business} enough! The team went above and beyond. Exceptional quality, professionalism, and care from start to finish.",
    ],
    4: [
      "Really pleased with {business}! Good service, friendly staff, and everything went smoothly. Small areas for improvement but overall very positive.",
      "Had a great experience at {business}. Quality service at a fair price. Happy with the results and would consider returning.",
      "{business} provided solid service. Professional team, good quality, and reasonable turnaround. A reliable choice.",
    ],
    3: [
      "Average experience with {business}. The service was okay but nothing stood out as exceptional. Decent but room for improvement.",
      "{business} was fine for what I needed. Not great, not terrible. An adequate experience overall.",
      "Mixed feelings about {business}. Some aspects were good, others could use work. An okay experience overall.",
    ],
    2: [
      "Disappointed with {business}. The service didn't meet my expectations and communication was lacking. Needs improvement.",
      "Not a great experience with {business}. Quality was below par and the value wasn't there. Would not recommend in its current state.",
      "{business} fell short of expectations. Several issues with the service that need to be addressed.",
    ],
    1: [
      "Very poor experience with {business}. From start to finish, everything went wrong. Would not recommend to anyone.",
      "Terrible experience with {business}. Unprofessional, poor quality, and completely unsatisfactory. Avoid.",
      "Worst experience I've had. {business} needs a complete overhaul. Nothing about this experience was positive.",
    ],
  },
};

export function getCategoryGroup(bizType) {
  return CATEGORY_MAP[bizType] || "other";
}

export function getDefaultReviewTemplates(businessType, starRating) {
  const group = getCategoryGroup(businessType);
  const groupTemplates = TEMPLATES_BY_GROUP[group] || TEMPLATES_BY_GROUP.other;
  return groupTemplates[starRating] || groupTemplates[5] || TEMPLATES_BY_GROUP.other[5];
}

export function getTemplateText(businessName, businessType, rating) {
  const templates = getDefaultReviewTemplates(businessType, rating);
  if (!templates || templates.length === 0) return "";
  const text = templates[Math.floor(Math.random() * templates.length)];
  return text.replace(/\{business\}/g, businessName);
}
