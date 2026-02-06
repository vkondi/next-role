/**
 * PDF Export Utility for Career Strategy Dashboard
 * Generates a comprehensive PDF report with resume profile, career path, skill gaps, and roadmap
 */

import jsPDF from 'jspdf';
import type {
  ResumeProfile,
  CareerPath,
  SkillGapAnalysis,
  CareerRoadmap,
} from '@/lib/types';

interface PDFExportData {
  resumeProfile: ResumeProfile;
  selectedPath: CareerPath;
  skillGapAnalysis: SkillGapAnalysis;
  roadmap: CareerRoadmap;
  aiProvider: string;
}

// Brand colors matching the app design
const COLORS = {
  primary: '#059669', // emerald-600
  primaryLight: '#d1fae5', // emerald-100
  secondary: '#64748b', // slate-500
  text: '#0f172a', // slate-900
  textLight: '#475569', // slate-600
  border: '#e2e8f0', // slate-200
  white: '#ffffff',
  red: '#dc2626',
  amber: '#f59e0b',
  green: '#16a34a',
};

/**
 * Generates and downloads a PDF report of the career strategy
 */
export async function generateCareerStrategyPDF(
  data: PDFExportData
): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  const footerHeight = 20;
  let yPosition = margin;

  // Helper function to add new page if needed
  const checkPageBreak = (requiredSpace: number): boolean => {
    if (yPosition + requiredSpace > pageHeight - margin - footerHeight) {
      doc.addPage();
      yPosition = margin;
      return true;
    }
    return false;
  };

  // Helper function to add section header with background
  const addSectionHeader = (title: string) => {
    checkPageBreak(15);
    doc.setFillColor(COLORS.primaryLight);
    doc.rect(margin - 5, yPosition - 3, contentWidth + 10, 10, 'F');
    doc.setTextColor(COLORS.text);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(title, margin, yPosition + 4);
    yPosition += 14;
  };

  // Header with branding
  doc.setFillColor(COLORS.primary);
  doc.rect(0, 0, pageWidth, 30, 'F');
  doc.setTextColor(COLORS.white);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('NextRole', margin, 18);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Career Strategy Report', margin, 25);

  yPosition = 40;

  // User Profile Section
  doc.setTextColor(COLORS.text);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Career Profile', margin, yPosition);
  yPosition += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(COLORS.textLight);

  if (data.resumeProfile.name) {
    doc.setFont('helvetica', 'bold');
    doc.text(`Name: `, margin, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(data.resumeProfile.name, margin + 20, yPosition);
    yPosition += 6;
  }

  doc.setFont('helvetica', 'bold');
  doc.text(`Current Role: `, margin, yPosition);
  doc.setFont('helvetica', 'normal');
  doc.text(data.resumeProfile.currentRole, margin + 30, yPosition);
  yPosition += 6;

  doc.setFont('helvetica', 'bold');
  doc.text(`Experience: `, margin, yPosition);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `${data.resumeProfile.yearsOfExperience} years`,
    margin + 30,
    yPosition
  );
  yPosition += 6;

  doc.setFont('helvetica', 'bold');
  doc.text(`Industry: `, margin, yPosition);
  doc.setFont('helvetica', 'normal');
  doc.text(data.resumeProfile.industryBackground, margin + 30, yPosition);
  yPosition += 8;

  // Tech Stack
  if (data.resumeProfile.techStack.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.text('Tech Stack:', margin, yPosition);
    yPosition += 5;
    doc.setFont('helvetica', 'normal');
    const techStackText = data.resumeProfile.techStack.join(', ');
    const splitTechStack = doc.splitTextToSize(techStackText, contentWidth);
    doc.text(splitTechStack, margin + 5, yPosition);
    yPosition += splitTechStack.length * 5 + 5;
  }

  checkPageBreak(40);
  yPosition += 5;

  // Selected Career Path Section
  addSectionHeader('Selected Career Path');

  doc.setFontSize(14);
  doc.setTextColor(COLORS.primary);
  doc.text(data.selectedPath.roleName, margin, yPosition);
  yPosition += 8;

  doc.setFontSize(10);
  doc.setTextColor(COLORS.textLight);
  doc.setFont('helvetica', 'normal');
  const descriptionLines = doc.splitTextToSize(
    data.selectedPath.description,
    contentWidth
  );
  doc.text(descriptionLines, margin, yPosition);
  yPosition += descriptionLines.length * 5 + 8;

  // Career Path Metrics
  checkPageBreak(25);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(COLORS.text);
  doc.text('Path Metrics:', margin, yPosition);
  yPosition += 6;

  doc.setFont('helvetica', 'normal');
  doc.text(
    `Market Demand Score: ${data.selectedPath.marketDemandScore}/100`,
    margin + 5,
    yPosition
  );
  yPosition += 5;
  doc.text(
    `Industry Alignment: ${data.selectedPath.industryAlignment}/100`,
    margin + 5,
    yPosition
  );
  yPosition += 5;
  doc.text(
    `Effort Level: ${data.selectedPath.effortLevel}`,
    margin + 5,
    yPosition
  );
  yPosition += 5;
  doc.text(
    `Reward Potential: ${data.selectedPath.rewardPotential}`,
    margin + 5,
    yPosition
  );
  yPosition += 10;

  // Reasoning
  checkPageBreak(30);
  doc.setFont('helvetica', 'bold');
  doc.text('Why This Path:', margin, yPosition);
  yPosition += 5;
  doc.setFont('helvetica', 'normal');
  const reasoningLines = doc.splitTextToSize(
    data.selectedPath.reasoning,
    contentWidth
  );
  doc.text(reasoningLines, margin + 5, yPosition);
  yPosition += reasoningLines.length * 5 + 10;

  // Skill Gap Analysis Section
  addSectionHeader('Skill Gap Analysis');

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(COLORS.textLight);
  doc.text(
    `Overall Severity: ${data.skillGapAnalysis.overallGapSeverity}`,
    margin,
    yPosition
  );
  yPosition += 5;
  doc.text(
    `Estimated Time: ${data.skillGapAnalysis.estimatedTimeToClose}`,
    margin,
    yPosition
  );
  yPosition += 8;

  const summaryLines = doc.splitTextToSize(
    data.skillGapAnalysis.summary,
    contentWidth
  );
  doc.text(summaryLines, margin, yPosition);
  yPosition += summaryLines.length * 5 + 12;

  // Skill Gaps Details - Individual cards with all information
  checkPageBreak(30);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(COLORS.text);
  doc.text('Skill Gaps Details', margin, yPosition);
  yPosition += 10;

  // Render each skill gap as a detailed card
  data.skillGapAnalysis.skillGaps.forEach((gap, index) => {
    // Estimate space needed for this skill gap
    const hasResources =
      gap.learningResources && gap.learningResources.length > 0;
    const estimatedSpace = hasResources
      ? 35 + (gap.learningResources?.length ?? 0) * 5
      : 25;
    checkPageBreak(estimatedSpace);

    // Skill name header
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(COLORS.primary);
    doc.text(`${index + 1}. ${gap.skillName}`, margin, yPosition);
    yPosition += 7;

    // Skill levels in structured format
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(COLORS.text);
    doc.text('Current Level:', margin + 5, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(COLORS.textLight);
    doc.text(gap.currentLevel, margin + 35, yPosition);
    yPosition += 5;

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(COLORS.text);
    doc.text('Required Level:', margin + 5, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(COLORS.textLight);
    doc.text(gap.requiredLevel, margin + 35, yPosition);
    yPosition += 5;

    // Priority badge
    const priorityColor =
      gap.importance === 'High'
        ? COLORS.red
        : gap.importance === 'Medium'
          ? COLORS.amber
          : COLORS.green;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(COLORS.text);
    doc.text('Priority:', margin + 5, yPosition);
    doc.setTextColor(priorityColor);
    doc.text(gap.importance, margin + 35, yPosition);
    yPosition += 7;

    // Learning resources
    if (hasResources) {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(COLORS.text);
      doc.text('Learning Resources:', margin + 5, yPosition);
      yPosition += 4;

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(COLORS.textLight);
      gap.learningResources!.forEach((resource) => {
        const resourceLines = doc.splitTextToSize(
          `• ${resource}`,
          contentWidth - 15
        );
        doc.text(resourceLines, margin + 10, yPosition);
        yPosition += resourceLines.length * 4;
      });
    }

    yPosition += 6; // Space between skill gaps
  });

  yPosition += 5;

  // Career Roadmap Section
  addSectionHeader('Career Roadmap');

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(COLORS.textLight);
  doc.text(
    `Timeline: ${data.roadmap.timelineMonths} months`,
    margin,
    yPosition
  );
  yPosition += 5;
  doc.text(`Phases: ${data.roadmap.phases.length}`, margin, yPosition);
  yPosition += 10;

  // Roadmap Phases
  for (const phase of data.roadmap.phases) {
    checkPageBreak(40);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(COLORS.primary);
    doc.text(
      `Phase ${phase.phaseNumber}: ${phase.duration}`,
      margin,
      yPosition
    );
    yPosition += 7;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(COLORS.text);
    doc.text('Focus:', margin + 5, yPosition);
    yPosition += 4;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(COLORS.textLight);
    const focusLines = doc.splitTextToSize(
      phase.learningDirection,
      contentWidth - 10
    );
    doc.text(focusLines, margin + 10, yPosition);
    yPosition += focusLines.length * 4 + 3;

    if (phase.skillsFocus.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(COLORS.text);
      doc.text('Skills:', margin + 5, yPosition);
      yPosition += 4;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(COLORS.textLight);
      phase.skillsFocus.forEach((skill) => {
        doc.text(`• ${skill}`, margin + 10, yPosition);
        yPosition += 4;
      });
      yPosition += 2;
    }

    if (phase.milestones.length > 0) {
      checkPageBreak(20);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(COLORS.text);
      doc.text('Milestones:', margin + 5, yPosition);
      yPosition += 4;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(COLORS.textLight);
      phase.milestones.forEach((milestone) => {
        const milestoneLines = doc.splitTextToSize(
          `• ${milestone}`,
          contentWidth - 15
        );
        doc.text(milestoneLines, margin + 10, yPosition);
        yPosition += milestoneLines.length * 4;
      });
      yPosition += 2;
    }

    yPosition += 5;
  }

  // Success Metrics
  checkPageBreak(30);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(COLORS.text);
  doc.text('Success Metrics', margin, yPosition);
  yPosition += 6;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(COLORS.textLight);
  data.roadmap.successMetrics.forEach((metric) => {
    const metricLines = doc.splitTextToSize(`• ${metric}`, contentWidth - 5);
    doc.text(metricLines, margin + 5, yPosition);
    yPosition += metricLines.length * 4;
  });
  yPosition += 8;

  // Risk Factors
  checkPageBreak(30);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(COLORS.text);
  doc.text('Risk Factors', margin, yPosition);
  yPosition += 6;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(COLORS.textLight);
  data.roadmap.riskFactors.forEach((risk) => {
    const riskLines = doc.splitTextToSize(`• ${risk}`, contentWidth - 5);
    doc.text(riskLines, margin + 5, yPosition);
    yPosition += riskLines.length * 4;
  });

  // Footer on every page
  const totalPages = doc.getNumberOfPages();
  const currentYear = new Date().getFullYear();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(COLORS.secondary);
    doc.setFont('helvetica', 'normal');

    // Date and AI provider info
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const footerText = `Generated on ${currentDate} • AI Provider: ${data.aiProvider.charAt(0).toUpperCase() + data.aiProvider.slice(1)}`;
    doc.text(footerText, margin, pageHeight - 15);

    // Page number
    doc.text(
      `Page ${i} of ${totalPages}`,
      pageWidth - margin - 20,
      pageHeight - 15
    );

    // Copyright notice
    doc.setFontSize(7);
    doc.setTextColor(COLORS.secondary);
    const copyright = `© ${currentYear} NextRole. All rights reserved.`;
    doc.text(copyright, margin, pageHeight - 10);

    // Disclaimer
    doc.setFontSize(7);
    doc.setTextColor(COLORS.secondary);
    const disclaimer =
      'This report is AI-generated and should be used as a guide. Please validate recommendations with industry experts.';
    const disclaimerLines = doc.splitTextToSize(disclaimer, contentWidth);
    doc.text(disclaimerLines, margin, pageHeight - 5);
  }

  // Generate filename
  const userName = data.resumeProfile.name || 'User';
  const pathTitle = data.selectedPath.roleName.replace(/[^a-z0-9]/gi, '_');
  const date = new Date().toISOString().split('T')[0];
  const filename = `NextRole_${pathTitle}_${userName}_${date}.pdf`;

  // Save PDF
  doc.save(filename);
}

/**
 * Shares career strategy on social media
 */
export function shareOnSocialMedia(
  platform: 'twitter' | 'linkedin' | 'facebook' | 'whatsapp' | 'telegram',
  data: {
    roleName: string;
    userName?: string;
  }
): void {
  const userName = data.userName || 'I';
  const message = `${userName === 'I' ? "I've" : `${userName} has`} created a personalized career strategy for transitioning to ${data.roleName} using NextRole! 🚀`;
  const appUrl = window.location.origin;
  const encodedUrl = encodeURIComponent(appUrl);
  const encodedText = encodeURIComponent(message);
  const fullMessage = encodeURIComponent(`${message} ${appUrl}`);

  let shareUrl = '';

  switch (platform) {
    case 'twitter':
      shareUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
      break;
    case 'linkedin':
      // LinkedIn doesn't support pre-filled text via URL, only the URL is shared
      shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
      break;
    case 'facebook':
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`;
      break;
    case 'whatsapp':
      // WhatsApp Web share with message and URL
      shareUrl = `https://wa.me/?text=${fullMessage}`;
      break;
    case 'telegram':
      // Telegram share with message and URL
      shareUrl = `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`;
      break;
  }

  if (shareUrl) {
    window.open(shareUrl, '_blank', 'width=600,height=400');
  }
}
