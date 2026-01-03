/**
 * POST /api/career-paths/generate
 * Generates possible career paths based on resume profile
 */

import { NextRequest, NextResponse } from "next/server";
import { CareerPathGeneratorRequestSchema } from "@/lib/ai/schemas";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request
    const validatedData = CareerPathGeneratorRequestSchema.safeParse(body);
    if (!validatedData.success) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid request: ${validatedData.error.errors[0].message}`,
        },
        { status: 400 }
      );
    }

    // const { resumeProfile, numberOfPaths = 5 } = validatedData.data;

    // Create prompt
    // const prompt = createCareerPathGeneratorPrompt(resumeProfile, numberOfPaths);

    // TODO: Call Deepseek API
    // For now, return mock response for testing
    const mockPaths = [
      {
        roleId: "path_001",
        roleName: "Senior Software Engineer / Tech Lead",
        description: "Lead engineering teams and drive technical strategy. Focus on architecture, mentorship, and high-impact projects.",
        marketDemandScore: 95,
        effortLevel: "Low",
        rewardPotential: "High",
        reasoning: "Your 5 years of experience and full-stack expertise position you well for a technical leadership role.",
        requiredSkills: ["System Design", "Team Management", "Architecture", "Communication", "Strategic Thinking"],
        industryAlignment: 95,
      },
      {
        roleId: "path_002",
        roleName: "Solutions Architect",
        description: "Design scalable solutions for enterprise clients. Bridge business needs and technical implementation.",
        marketDemandScore: 85,
        effortLevel: "Medium",
        rewardPotential: "High",
        reasoning: "Your diverse tech stack and problem-solving skills are perfect for designing enterprise solutions.",
        requiredSkills: ["Enterprise Architecture", "Cloud Platforms", "Stakeholder Management", "Business Acumen", "Database Design"],
        industryAlignment: 85,
      },
      {
        roleId: "path_003",
        roleName: "DevOps Engineer / Cloud Specialist",
        description: "Manage infrastructure, deployment pipelines, and cloud platforms. Ensure reliability and scalability.",
        marketDemandScore: 92,
        effortLevel: "Medium",
        rewardPotential: "High",
        reasoning: "Your backend experience provides a strong foundation for cloud infrastructure and DevOps practices.",
        requiredSkills: ["Cloud Platforms", "Kubernetes", "CI/CD", "Infrastructure as Code", "Monitoring & Logging"],
        industryAlignment: 80,
      },
      {
        roleId: "path_004",
        roleName: "Product Engineer / Technical PM",
        description: "Drive product development from technical perspective. Balance engineering and product goals.",
        marketDemandScore: 88,
        effortLevel: "Medium",
        rewardPotential: "Medium",
        reasoning: "Your full-stack expertise allows you to understand both technical and product perspectives.",
        requiredSkills: ["Product Thinking", "User Research", "Analytics", "Roadmap Planning", "Cross-functional Leadership"],
        industryAlignment: 75,
      },
      {
        roleId: "path_005",
        roleName: "ML/AI Engineer",
        description: "Build machine learning systems and AI-powered products. Apply data science to real-world problems.",
        marketDemandScore: 90,
        effortLevel: "High",
        rewardPotential: "High",
        reasoning: "With Python in your toolkit and analytical mindset, you can transition into this high-growth field.",
        requiredSkills: ["Machine Learning", "Python Data Libraries", "Statistics", "Deep Learning", "Model Deployment"],
        industryAlignment: 60,
      },
    ];

    // In production, parse actual Deepseek response
    // const response = await callDeepseekAPI(prompt);
    // const paths = await parseCareerPathGeneratorResponse(response);

    return NextResponse.json({
      success: true,
      data: mockPaths,
    });
  } catch (error) {
    console.error("Career path generator error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
