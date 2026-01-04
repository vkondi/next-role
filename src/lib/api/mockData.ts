/**
 * Mock Data Responses
 * Used when API mode is set to 'mock'
 */

import type {
  ResumeProfile,
  CareerPath,
  CareerPathMinimal,
  SkillGapAnalysis,
  CareerRoadmap,
} from "@/lib/types";

export function generateMockResumeProfile(_resumeText: string): ResumeProfile {
  return {
    name: "Alex Johnson",
    currentRole: "Senior Software Engineer",
    yearsOfExperience: 5,
    techStack: [
      "TypeScript",
      "React",
      "Node.js",
      "PostgreSQL",
      "AWS",
      "Docker",
    ],
    strengthAreas: [
      "Full-stack development",
      "System architecture",
      "Mentoring",
      "Code quality",
    ],
    industryBackground: "Technology",
    certifications: ["AWS Solutions Architect Associate"],
    education: ["BS Computer Science"],
  };
}

export function generateMockCareerPaths(
  profile: ResumeProfile
): CareerPath[] {
  // Generate profession-agnostic career paths based on profile analysis
  // This works for ANY profession: technical, marketing, sales, finance, etc.
  
  const paths: CareerPath[] = [];
  const yearsOfExp = profile.yearsOfExperience;
  const currentRole = profile.currentRole;
  const industryBg = profile.industryBackground;
  const strengthCount = profile.strengthAreas.length;
  
  // Determine seniority level
  const isSenior = yearsOfExp >= 5;
  const isVeryExperienced = yearsOfExp >= 10;
  
  // Path 1: Leadership/Management Track (works for all professions)
  // Natural progression for experienced professionals
  if (yearsOfExp >= 2) {
    const leadershipTitle = isSenior 
      ? `Director of ${industriesToFunction(industryBg) || currentRole}`
      : `Manager of ${industriesToFunction(industryBg) || currentRole}`;
    
    paths.push({
      roleId: "leadership-track",
      roleName: leadershipTitle,
      description: `Lead and manage teams in ${industryBg || "your industry"}. Build organizational culture and drive strategic direction for your team.`,
      marketDemandScore: 78 + (yearsOfExp * 2), // Higher score for more experience
      industryAlignment: 92,
      effortLevel: yearsOfExp >= 4 ? "Low" : "Medium",
      rewardPotential: "High",
      reasoning: `Your ${yearsOfExp} years as a ${currentRole} with strengths in ${profile.strengthAreas.slice(0, 2).join(" and ")} position you well to lead teams.`,
      requiredSkills: [
        "Team Leadership",
        "Strategic Planning",
        "People Management",
        "Decision Making",
      ],
    });
  }

  // Path 2: Specialization/Expert Track (works for all professions)
  // Deepen expertise in current domain
  paths.push({
    roleId: "specialization-track",
    roleName: `Senior/Lead ${currentRole}`,
    description: `Become the go-to expert in your field. Deepen your expertise and influence on specialized work rather than management.`,
    marketDemandScore: 85,
    industryAlignment: 95,
    effortLevel: "Low",
    rewardPotential: "High",
    reasoning: `Your strong foundation in ${profile.strengthAreas[0]} and domain knowledge makes specialization a natural progression.`,
    requiredSkills: [
      "Deep Domain Expertise",
      "Problem Solving",
      "Innovation",
      "Thought Leadership",
    ],
  });

  // Path 3: Lateral Movement (works for all professions)
  // Move to related role with transferable skills
  if (strengthCount >= 2) {
    const relatedRoles = suggestRelatedRoles(currentRole, industryBg);
    paths.push({
      roleId: "lateral-track",
      roleName: relatedRoles.title,
      description: `Transition to ${relatedRoles.title} leveraging your transferable skills. Expand your professional horizons while applying existing expertise.`,
      marketDemandScore: 72,
      industryAlignment: 80,
      effortLevel: "Medium",
      rewardPotential: "High",
      reasoning: `Your experience in ${profile.strengthAreas.slice(0, 2).join(" and ")} translates well to ${relatedRoles.title} roles.`,
      requiredSkills: relatedRoles.requiredSkills,
    });
  }

  // Path 4: Executive/Strategic Track (works for all professions)
  // Move toward C-level or strategic roles
  if (isSenior) {
    const executiveTitle = isVeryExperienced ? "VP/C-Level" : "Senior Leadership";
    paths.push({
      roleId: "executive-track",
      roleName: `${executiveTitle} in ${industryBg || "Your Field"}`,
      description: `Shape organizational strategy and vision at the executive level. Drive business outcomes and set strategic direction for your organization.`,
      marketDemandScore: 75,
      industryAlignment: 85,
      effortLevel: "High",
      rewardPotential: "High",
      reasoning: `With ${yearsOfExp} years of experience and proven success, you're positioned to move into strategic leadership roles.`,
      requiredSkills: [
        "Business Strategy",
        "Organizational Leadership",
        "Financial Acumen",
        "Stakeholder Management",
      ],
    });
  }

  // Path 5: Consulting/Advisory Track (works for all professions)
  // Leverage expertise to advise others
  if (yearsOfExp >= 4) {
    paths.push({
      roleId: "consulting-track",
      roleName: `Consultant / Advisor in ${industryBg || "Your Domain"}`,
      description: `Apply your expertise to help multiple organizations solve complex problems. Build independent practice or join consulting firms.`,
      marketDemandScore: 80,
      industryAlignment: 88,
      effortLevel: "Medium",
      rewardPotential: "High",
      reasoning: `Your ${yearsOfExp} years of hands-on experience combined with ${profile.strengthAreas[0]} make you a valuable consultant.`,
      requiredSkills: [
        "Subject Matter Expertise",
        "Client Communication",
        "Problem Analysis",
        "Strategic Thinking",
      ],
    });
  }

  // Path 6: Entrepreneurship Track (works for all professions)
  // Start own venture or business
  if (yearsOfExp >= 3 && strengthCount >= 2) {
    const businessIdea = suggestBusinessIdea(currentRole, industryBg);
    paths.push({
      roleId: "entrepreneurship-track",
      roleName: `Entrepreneur / Business Owner`,
      description: `Start your own ${businessIdea} leveraging your professional expertise and industry connections.`,
      marketDemandScore: 70,
      industryAlignment: 90,
      effortLevel: "High",
      rewardPotential: "High",
      reasoning: `Your background in ${industryBg} combined with skills in ${profile.strengthAreas[0]} positions you well for entrepreneurship.`,
      requiredSkills: [
        "Business Development",
        "Entrepreneurship",
        "Financial Management",
        "Risk Management",
      ],
    });
  }

  return paths.slice(0, 5); // Return max 5 paths
}

/**
 * Helper function to map industry to functional role
 */
function industriesToFunction(industry: string): string {
  const mapping: Record<string, string> = {
    "Technology": "Engineering",
    "Finance": "Finance",
    "Healthcare": "Healthcare",
    "Marketing": "Marketing",
    "Sales": "Sales",
    "Operations": "Operations",
    "HR": "Human Resources",
    "Legal": "Legal",
    "Education": "Education",
    "Consulting": "Consulting",
    "Retail": "Retail",
    "Manufacturing": "Manufacturing",
  };
  
  // Try exact match first
  if (mapping[industry]) return mapping[industry];
  
  // Try partial match
  for (const [key, value] of Object.entries(mapping)) {
    if (industry.toLowerCase().includes(key.toLowerCase())) {
      return value;
    }
  }
  
  return industry; // Return original if no match
}

/**
 * Helper function to suggest related roles based on current role
 */
function suggestRelatedRoles(currentRole: string, _industry: string): {
  title: string;
  requiredSkills: string[]
} {
  const roleKeywords = currentRole.toLowerCase();
  
  if (roleKeywords.includes("software") || roleKeywords.includes("developer") || roleKeywords.includes("engineer")) {
    return {
      title: "Product Manager / Technical Program Manager",
      requiredSkills: ["Product Strategy", "Technical Communication", "Project Management", "Cross-functional Leadership"],
    };
  }
  
  if (roleKeywords.includes("product") || roleKeywords.includes("manager")) {
    return {
      title: "Business Development / Strategy Manager",
      requiredSkills: ["Business Analysis", "Strategic Planning", "Market Analysis", "Partnership Development"],
    };
  }
  
  if (roleKeywords.includes("sales") || roleKeywords.includes("business")) {
    return {
      title: "Business Operations / Account Management",
      requiredSkills: ["Process Optimization", "Client Relations", "Data Analysis", "Negotiation"],
    };
  }
  
  if (roleKeywords.includes("marketing") || roleKeywords.includes("analyst")) {
    return {
      title: "Growth Manager / Strategic Marketer",
      requiredSkills: ["Growth Strategy", "Data Analytics", "Product Knowledge", "Team Leadership"],
    };
  }
  
  if (roleKeywords.includes("designer") || roleKeywords.includes("creative")) {
    return {
      title: "UX Strategist / Design Lead",
      requiredSkills: ["User Research", "Design Strategy", "Team Leadership", "Business Acumen"],
    };
  }
  
  if (roleKeywords.includes("finance") || roleKeywords.includes("accountant")) {
    return {
      title: "Financial Analyst / Controller",
      requiredSkills: ["Financial Modeling", "Business Strategy", "Risk Analysis", "Regulatory Compliance"],
    };
  }
  
  if (roleKeywords.includes("hr") || roleKeywords.includes("human")) {
    return {
      title: "Talent Strategist / Organizational Development",
      requiredSkills: ["Talent Management", "Organizational Design", "Change Management", "Strategic HR"],
    };
  }
  
  // Default fallback
  return {
    title: "Strategic Advisor / Operations Manager",
    requiredSkills: ["Strategic Planning", "Process Improvement", "Team Leadership", "Business Analysis"],
  };
}

/**
 * Helper function to suggest business ideas based on role and industry
 */
function suggestBusinessIdea(currentRole: string, industry: string): string {
  const roleKeywords = currentRole.toLowerCase();
  
  if (roleKeywords.includes("software") || roleKeywords.includes("developer")) {
    return "Software / SaaS startup";
  }
  
  if (roleKeywords.includes("consultant") || roleKeywords.includes("advisor")) {
    return "consulting firm";
  }
  
  if (roleKeywords.includes("product") || roleKeywords.includes("manager")) {
    return "product or service business";
  }
  
  if (roleKeywords.includes("sales") || roleKeywords.includes("business development")) {
    return "agency or sales-focused business";
  }
  
  if (roleKeywords.includes("marketing")) {
    return "marketing or growth agency";
  }
  
  if (roleKeywords.includes("designer")) {
    return "design or creative studio";
  }
  
  if (roleKeywords.includes("finance")) {
    return "fintech or financial services venture";
  }
  
  return "business leveraging your expertise in " + industry;
}

export function generateMockSkillGapAnalysis(
  _profile: ResumeProfile,
  careerPath: CareerPath
): SkillGapAnalysis {
  // Determine gap severity and estimated time based on effort level
  // This makes the timeline dynamic based on the path characteristics
  const effortLevel = careerPath.effortLevel;
  const estimatedTimeMap = {
    Low: "3-4 months",
    Medium: "6-9 months",
    High: "9-12 months",
  };
  
  const severityMap = {
    Low: "Low" as const,
    Medium: "Medium" as const,
    High: "High" as const,
  };

  return {
    careerPathId: careerPath.roleId,
    careerPathName: careerPath.roleName,
    skillGaps: [
      {
        skillName: careerPath.requiredSkills[0],
        currentLevel: "Intermediate",
        requiredLevel: "Advanced",
        importance: "High",
        learningResources: [
          "System Design Interview course (Algoexpert)",
          "Designing Data-Intensive Applications book",
          "Leetcode system design problems",
        ],
      },
      {
        skillName: careerPath.requiredSkills[1],
        currentLevel: "Beginner",
        requiredLevel: "Intermediate",
        importance: "High",
        learningResources: [
          "The Manager's Path (book)",
          "Radical Candor (book)",
          "Leadership fundamentals course",
        ],
      },
      {
        skillName: careerPath.requiredSkills[2],
        currentLevel: "Intermediate",
        requiredLevel: "Advanced",
        importance: "Medium",
        learningResources: [
          "Presentation skills workshop",
          "Toastmasters membership",
          "Technical writing practice",
        ],
      },
    ],
    overallGapSeverity: severityMap[effortLevel],
    estimatedTimeToClose: estimatedTimeMap[effortLevel],
    summary:
      "You have a solid foundation. Focus on developing the key skills for your target role while leveraging your existing strengths.",
  };
}

export function generateMockRoadmap(
  _profile: ResumeProfile,
  careerPath: CareerPath,
  _skillGaps: SkillGapAnalysis,
  timelineMonths: number = 6
): CareerRoadmap {
  return {
    careerPathId: careerPath.roleId,
    careerPathName: careerPath.roleName,
    timelineMonths,
    phases: [
      {
        phaseNumber: 1,
        duration: `Month 1-${Math.ceil(timelineMonths / 3)}`,
        skillsFocus: [careerPath.requiredSkills[0], careerPath.requiredSkills[1]],
        learningDirection: "Build theoretical foundation in core skills",
        projectIdeas: [
          `Design a system similar to current company's architecture`,
          "Document architecture decisions for existing project",
          "Lead technical discussion on current system",
        ],
        milestones: [
          "Complete 5+ system design problems",
          `Read chapters 1-5 of core reference`,
          "Present one technical design to team",
        ],
        actionItems: [
          "2-3 hours/week: System design course",
          "1 hour/week: Reading and notes",
          "1 hour/week: Practice problems",
          "Collect feedback from peers",
        ],
      },
      {
        phaseNumber: 2,
        duration: `Month ${Math.ceil(timelineMonths / 3) + 1}-${Math.ceil((timelineMonths * 2) / 3)}`,
        skillsFocus: [careerPath.requiredSkills[2]],
        learningDirection: "Apply knowledge to real problems",
        projectIdeas: [
          "Lead architecture redesign of system component",
          "Mentor junior engineers on design patterns",
          "Present technical vision to stakeholders",
        ],
        milestones: [
          "Complete 10+ design problems",
          "Lead one major technical initiative",
          "Present to non-technical stakeholders",
        ],
        actionItems: [
          "2 hours/week: Advanced topics",
          "Mentoring one junior engineer",
          "Document learnings",
          "Practice presentations",
        ],
      },
      {
        phaseNumber: 3,
        duration: `Month ${Math.ceil((timelineMonths * 2) / 3) + 1}-${timelineMonths}`,
        skillsFocus: [careerPath.requiredSkills[3] || "Leadership"],
        learningDirection: "Master role and develop interview skills",
        projectIdeas: [
          "Take on larger scope technical leadership",
          "Contribute to company-wide technical strategy",
          "Interview with target companies for role validation",
        ],
        milestones: [
          `Ready for ${careerPath.roleName} interviews`,
          "Demonstrable impact on team/company",
          "Strong interview performance",
        ],
        actionItems: [
          "Interview practice with peers",
          "Portfolio building",
          "Network with industry contacts",
          "Finalize role transition plan",
        ],
      },
    ],
    successMetrics: [
      "Complete all required skill development",
      `Demonstrate ${careerPath.roleName} competencies in current role`,
      "Get positive feedback from potential hiring managers",
    ],
    riskFactors: [
      "May require work-life balance adjustments",
      "Some skills have steep learning curves",
      "Market conditions could affect timing",
    ],
    supportResources: [
      "Budget for courses and books",
      "Mentor/advisor in target role",
      "Supportive team environment",
    ],
  };
}
/**
 * Generate MINIMAL career paths (for carousel - fast loading)
 */
export function generateMockCareerPathsMinimal(
  profile: ResumeProfile
): CareerPathMinimal[] {
  const fullPaths = generateMockCareerPaths(profile);
  // Convert full paths to minimal versions (just title, description, scores, skills)
  return fullPaths.map(path => ({
    roleId: path.roleId,
    roleName: path.roleName,
    description: path.description,
    marketDemandScore: path.marketDemandScore,
    industryAlignment: path.industryAlignment,
    requiredSkills: path.requiredSkills,
  }));
}

/**
 * Generate detailed info for a specific career path
 */
export function generateMockCareerPathDetails(
  _profile: ResumeProfile,
  pathBasic: { roleId: string; roleName: string }
) {
  // Return the extra fields that weren't in minimal version
  return {
    ...pathBasic,
    effortLevel: "Medium" as const,
    rewardPotential: "High" as const,
    reasoning: `This career path aligns well with your background and offers significant growth potential.`,
    detailedDescription: `${pathBasic.roleName} is an excellent progression that leverages your expertise while opening new opportunities for impact and compensation growth.`,
  };
}