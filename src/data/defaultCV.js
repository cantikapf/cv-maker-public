export const defaultCV = {
  personalInfo: {
    name: 'Jane Doe',
    location: 'San Francisco, CA',
    email: 'jane.doe@example.com',
    phone: '+1 415 555 0198',
    linkedin: 'linkedin.com/in/janedoe',
    github: 'github.com/janedoe',
    portfolio: 'janedoe.design',
    photo: null,
    summary:
      'Innovative Product Designer with 5+ years of experience in creating user-centric digital experiences. Proven track record of leading design projects from concept to launch, increasing user engagement by 40% at previous roles. Passionate about accessibility and scalable design systems.',
  },

  workExperience: [
    {
      id: 'we_001',
      jobTitle: 'Senior Product Designer',
      company: 'TechFlow Solutions',
      location: 'San Francisco, CA',
      startDate: 'Mar 2021',
      endDate: 'Present',
      bullets: [
        'Spearheaded the redesign of the flagship mobile application, resulting in a 45% increase in daily active users.',
        'Established and maintained a comprehensive design system adopted by 5 cross-functional engineering teams.',
        'Conducted user research and usability testing with over 100 participants to validate new feature prototypes.',
      ],
    },
    {
      id: 'we_002',
      jobTitle: 'UX/UI Designer',
      company: 'Creative Studio Agency',
      location: 'New York, NY',
      startDate: 'Jun 2018',
      endDate: 'Feb 2021',
      bullets: [
        'Designed end-to-end e-commerce experiences for 12+ enterprise clients, boosting average conversion rates by 22%.',
        'Collaborated closely with product managers and front-end developers in an Agile environment.',
      ],
    },
  ],

  education: [
    {
      id: 'edu_001',
      degree: 'Bachelor of Fine Arts in Interaction Design',
      institution: 'Rhode Island School of Design',
      location: 'Providence, RI',
      startDate: 'Sep 2014',
      endDate: 'May 2018',
      gpa: '3.8/4.0',
      bullets: [
        'Graduated with Honors',
        'Vice President of the Student Design Association',
      ],
    },
  ],

  organizationalExperience: [],

  skills: [
    {
      id: 'skill_001',
      category: 'Design Tools',
      items: 'Figma, Sketch, Adobe Creative Suite (Illustrator, Photoshop, After Effects), Principle',
    },
    {
      id: 'skill_002',
      category: 'UX Methods',
      items: 'Wireframing, Rapid Prototyping, Usability Testing, User Journey Mapping, Information Architecture',
    },
    {
      id: 'skill_003',
      category: 'Front-end (Basic)',
      items: 'HTML, CSS, React, Tailwind CSS',
    },
  ],

  languages: [
    { id: 'lang_001', name: 'English', proficiency: 'Native' },
    { id: 'lang_002', name: 'Spanish', proficiency: 'Professional working proficiency' },
  ],

  certifications: [
    {
      id: 'cert_001',
      name: 'Google UX Design Professional Certificate',
      issuer: 'Coursera',
      date: 'Aug 2020',
    }
  ],

  awards: [],

  publications: [],

  projects: [
    {
      id: 'proj_001',
      name: 'EcoTrack Mobile App',
      description: 'A personal project aimed at helping users track their daily carbon footprint through automated integrations with maps and purchase history. Designed the full UI/UX flow from scratch.',
      link: 'janedoe.design/ecotrack'
    }
  ],

  customSections: [],
  
  sectionConfig: {
    hiddenSections: [], // array of section IDs (e.g., 'publications') that are hidden from the editor tabs
  }
}
