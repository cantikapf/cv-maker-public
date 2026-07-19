export const defaultCV = {
  personalInfo: {
    name: 'Your Full Name',
    location: 'City, Country',
    email: 'your.email@example.com',
    phone: '+1 234 567 890',
    linkedin: 'linkedin.com/in/your-profile',
    github: '',
    portfolio: '',
    photo: null,
    summary:
      'Write a brief professional summary here. Describe your key skills, experience, and career goals in 2–3 sentences. Keep it under 50 words.',
  },

  workExperience: [
    {
      id: 'we_001',
      jobTitle: 'Your Job Title',
      company: 'Company Name',
      location: 'City, Country',
      startDate: 'Jan 2023',
      endDate: 'Present',
      bullets: [
        'Describe your key achievement or responsibility here. Use action verbs and quantify results.',
        'Led a team of X people to accomplish Y, resulting in Z% improvement.',
      ],
    },
  ],

  education: [
    {
      id: 'edu_001',
      degree: 'Bachelor of Science in Your Major',
      institution: 'University Name',
      location: 'City, Country',
      startDate: 'Sep 2019',
      endDate: 'Jun 2023',
      gpa: '',
      bullets: [],
    },
  ],

  organizationalExperience: [],

  skills: [
    {
      id: 'skill_001',
      category: 'Technical Skills',
      items: 'List your tools and technologies here, e.g. Python, Excel, Figma',
    },
    {
      id: 'skill_002',
      category: 'Professional Skills',
      items: 'List your soft skills, e.g. Project Management, Communication, Problem Solving',
    },
  ],

  languages: [
    { id: 'lang_001', name: 'English', proficiency: 'Professional working proficiency' },
  ],

  certifications: [],

  awards: [],

  publications: [],

  projects: [],
}
