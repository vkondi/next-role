/**
 * Sample resume data for testing
 * Mock data representing different professional profiles
 */

export const sampleResumeText = `
JOHN DOE
San Francisco, CA | john.doe@example.com | linkedin.com/in/johndoe

PROFESSIONAL SUMMARY
Experienced Full Stack Software Engineer with 5+ years building scalable web applications. 
Expert in modern JavaScript frameworks, backend systems, and cloud infrastructure. 
Led teams of engineers and mentored junior developers.

EXPERIENCE

Senior Software Engineer - Tech Company Inc. (2022-Present)
- Led architecture redesign of microservices platform serving 10M+ daily users
- Mentored team of 4 junior engineers on system design and best practices
- Reduced API response time by 40% through optimization and caching strategies
- Technologies: TypeScript, React, Node.js, PostgreSQL, AWS, Docker

Full Stack Developer - StartupXYZ (2019-2022)
- Built and maintained customer-facing React application with 500K+ users
- Designed and implemented REST APIs handling 1000+ requests/second
- Implemented CI/CD pipelines reducing deployment time from 2 hours to 15 minutes
- Technologies: JavaScript, React, Express.js, MongoDB, AWS Lambda, Docker

Junior Software Engineer - WebDev Company (2018-2019)
- Developed features for e-commerce platform
- Fixed bugs and improved code quality through code reviews
- Technologies: JavaScript, HTML/CSS, Node.js, MySQL

TECHNICAL SKILLS
Languages: JavaScript, TypeScript, Python, SQL
Frontend: React, Redux, HTML5, CSS3, Tailwind CSS
Backend: Node.js, Express.js, Python Django
Databases: PostgreSQL, MongoDB, Redis
Cloud/DevOps: AWS, Docker, Kubernetes, GitHub Actions
Tools: Git, Figma, Jira, Webpack, Jest

EDUCATION
B.S. in Computer Science
State University, 2018

CERTIFICATIONS
- AWS Solutions Architect Associate
- MongoDB Certified Associate Developer

PROJECTS
- Built real-time collaboration tool using WebSockets and React
- Created system design education content on Medium (5K+ followers)
- Open source contributions to popular React libraries
`;

export const mockResumeProfile = {
  currentRole: "Senior Software Engineer",
  yearsOfExperience: 5,
  techStack: [
    "JavaScript",
    "TypeScript",
    "React",
    "Node.js",
    "Python",
    "PostgreSQL",
    "MongoDB",
    "AWS",
    "Docker",
    "Kubernetes",
  ],
  strengthAreas: [
    "Full Stack Development",
    "System Design",
    "Team Leadership",
    "Cloud Architecture",
    "Backend Optimization",
  ],
  industryBackground: "Technology / SaaS",
  certifications: [
    "AWS Solutions Architect Associate",
    "MongoDB Certified Associate Developer",
  ],
  education: ["B.S. Computer Science"],
};

export const mockCareerPaths = [
  {
    roleId: "path_001",
    roleName: "Tech Lead / Engineering Manager",
    description:
      "Lead engineering teams and drive technical strategy. Focus on architecture, mentorship, and high-impact projects.",
    marketDemandScore: 95,
    effortLevel: "Low" as const,
    rewardPotential: "High" as const,
    reasoning:
      "Your 5 years of experience and proven mentorship abilities position you perfectly for technical leadership.",
    requiredSkills: [
      "System Design",
      "Team Management",
      "Architecture",
      "Communication",
      "Strategic Thinking",
    ],
    industryAlignment: 95,
  },
  {
    roleId: "path_002",
    roleName: "Solutions Architect",
    description:
      "Design scalable solutions for enterprise clients. Bridge business needs and technical implementation.",
    marketDemandScore: 85,
    effortLevel: "Medium" as const,
    rewardPotential: "High" as const,
    reasoning:
      "Your diverse tech stack and problem-solving skills are perfect for designing enterprise solutions.",
    requiredSkills: [
      "Enterprise Architecture",
      "Cloud Platforms",
      "Stakeholder Management",
      "Business Acumen",
    ],
    industryAlignment: 85,
  },
  {
    roleId: "path_003",
    roleName: "DevOps Engineer / Cloud Specialist",
    description:
      "Manage infrastructure, deployment pipelines, and cloud platforms. Ensure reliability and scalability.",
    marketDemandScore: 92,
    effortLevel: "Medium" as const,
    rewardPotential: "High" as const,
    reasoning:
      "Your backend experience provides a strong foundation for cloud infrastructure and DevOps practices.",
    requiredSkills: [
      "Cloud Platforms",
      "Kubernetes",
      "CI/CD",
      "Infrastructure as Code",
      "Monitoring",
    ],
    industryAlignment: 80,
  },
  {
    roleId: "path_004",
    roleName: "Product Engineer / Technical PM",
    description:
      "Drive product development from technical perspective. Balance engineering and product goals.",
    marketDemandScore: 88,
    effortLevel: "Medium" as const,
    rewardPotential: "Medium" as const,
    reasoning:
      "Your full-stack expertise allows you to understand both technical and product perspectives.",
    requiredSkills: [
      "Product Thinking",
      "User Research",
      "Analytics",
      "Roadmap Planning",
    ],
    industryAlignment: 75,
  },
  {
    roleId: "path_005",
    roleName: "ML/AI Engineer",
    description:
      "Build machine learning systems and AI-powered products. Apply data science to real-world problems.",
    marketDemandScore: 90,
    effortLevel: "High" as const,
    rewardPotential: "High" as const,
    reasoning:
      "With Python in your toolkit and analytical mindset, you can transition into this high-growth field.",
    requiredSkills: ["Machine Learning", "Python Data Libraries", "Statistics"],
    industryAlignment: 60,
  },
];
