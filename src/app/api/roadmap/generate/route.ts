/**
 * POST /api/roadmap/generate
 * Generates a month-by-month career transition roadmap
 */

import { NextRequest, NextResponse } from "next/server";
import { RoadmapGeneratorRequestSchema } from "@/lib/ai/schemas";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request
    const validatedData = RoadmapGeneratorRequestSchema.safeParse(body);
    if (!validatedData.success) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid request: ${validatedData.error.errors[0].message}`,
        },
        { status: 400 }
      );
    }

    // const { resumeProfile, careerPath, skillGapAnalysis, timelineMonths = 6 } =
    //   validatedData.data;

    // Create prompt
    // const prompt = createRoadmapGeneratorPrompt(
    //   resumeProfile,
    //   careerPath,
    //   skillGapAnalysis,
    //   timelineMonths
    // );

    // TODO: Call Deepseek API
    // For now, return mock response for testing
    const mockRoadmap = {
      careerPathId: "tech-lead",
      careerPathName: "Tech Lead",
      timelineMonths: 6,
      phases: [
        {
          phaseNumber: 1,
          duration: "Month 1-2",
          skillsFocus: ["System Design Fundamentals", "Leadership Basics", "Architecture Patterns"],
          learningDirection: "Build theoretical foundation in system design and technical leadership",
          projectIdeas: [
            "Design a Twitter-like system end-to-end",
            "Lead a small technical project or initiative at current job",
            "Document architecture decisions for a current system",
          ],
          milestones: [
            "Complete System Design Interview course",
            "Read 'Designing Data-Intensive Applications'",
            "Lead one cross-team technical discussion",
          ],
          actionItems: [
            "2-3 hours/week: System Design course (Algoexpert)",
            "1 hour/week: System design reading (book chapters)",
            "Schedule knowledge-sharing sessions",
            "Collect feedback from peers on communication",
            "Document one complex system you've built",
          ],
        },
        {
          phaseNumber: 2,
          duration: "Month 3-4",
          skillsFocus: ["Advanced Architecture", "Team Dynamics", "Strategic Communication"],
          learningDirection: "Apply system design knowledge and develop leadership capabilities",
          projectIdeas: [
            "Propose and lead a significant architecture redesign",
            "Mentor junior engineers on system design",
            "Present technical vision to stakeholders",
          ],
          milestones: [
            "Complete 10+ system design problems",
            "Lead one major technical initiative",
            "Read 'The Manager's Path'",
            "Get feedback from leadership team",
          ],
          actionItems: [
            "2 hours/week: Advanced system design practice",
            "1-2 hours/week: Leadership reading",
            "1 mentoring session/week with junior engineer",
            "Prepare and deliver one technical presentation",
            "Start documenting your architectural decisions",
          ],
        },
        {
          phaseNumber: 3,
          duration: "Month 5-6",
          skillsFocus: ["Leadership in Practice", "Strategic Thinking", "Business Acumen"],
          learningDirection: "Transition into leadership role with business perspective",
          projectIdeas: [
            "Lead technical roadmap planning for your team",
            "Develop strategy for technical debt reduction",
            "Present business-aligned technical strategy",
          ],
          milestones: [
            "Secure tech lead or senior engineer promotion/opportunity",
            "Complete leadership fundamentals training",
            "Lead quarterly planning session",
            "Demonstrate understanding of business metrics",
          ],
          actionItems: [
            "Prepare for leadership role transition",
            "Study business metrics relevant to your domain",
            "Have career conversation with your manager",
            "Demonstrate readiness with key projects",
            "Review and refine your technical vision",
          ],
        },
      ],
      successMetrics: [
        "Promote to Tech Lead or Senior Engineer role",
        "Successfully lead a cross-functional technical initiative",
        "Receive positive feedback on leadership and communication from team",
        "Build system design expertise (top 10% in your organization)",
        "Establish yourself as someone who balances technical excellence with business goals",
      ],
      riskFactors: [
        "Time management: Balancing learning with current job responsibilities",
        "Imposter syndrome: Feeling unprepared despite having the fundamentals",
        "Team dynamics: Managing transition while working with current peers",
      ],
      supportResources: [
        "Algoexpert System Design Course",
        "Books: Designing Data-Intensive Applications, The Manager's Path",
        "LeetCode Premium for system design problems",
        "Find a mentor in tech leadership (could be within your organization)",
        "Leadership coaching or training program",
        "Industry conferences and networking events",
        "Tech community (e.g., local engineering meetups)",
      ],
    };

    // In production, parse actual Deepseek response
    // const response = await callDeepseekAPI(prompt);
    // const roadmap = await parseRoadmapGeneratorResponse(response);

    return NextResponse.json({
      success: true,
      data: mockRoadmap,
    });
  } catch (error) {
    console.error("Roadmap generator error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
