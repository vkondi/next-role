# API Specification

## Overview

The NextRole API provides endpoints for resume analysis, career path generation, skill gap analysis, and roadmap generation.

## API Routes

### `POST /api/resume/interpret`
Interprets resume text and extracts structured profile.

**Request:**
```json
{
  "resumeText": "string",
  "aiProvider": "deepseek" | "gemini" (optional)
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "name": "string",
    "currentRole": "string",
    "yearsOfExperience": number,
    "techStack": ["string"],
    "strengthAreas": ["string"],
    "industryBackground": "string",
    "certifications": ["string"],
    "education": ["string"]
  }
}
```

**Description:**
- Converts resume text into a structured profile
- Extracts current role, experience level, technical skills, strengths, certifications, and education

---

### `POST /api/career-paths/generate`
Generates minimal career path suggestions for carousel display (fast loading).

**Request:**
```json
{
  "resumeProfile": { /* Full ResumeProfile object */ },
  "numberOfPaths": 5 (optional, default: 5),
  "aiProvider": "deepseek" | "gemini" (optional)
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "paths": [
      {
        "roleId": "string",
        "roleName": "string",
        "description": "string",
        "marketDemandScore": 0-100,
        "industryAlignment": 0-100,
        "requiredSkills": ["string"]
      }
    ]
  }
}
```

**Description:**
- Generates minimal career paths for quick carousel display
- Returns 4-6 strategic career paths based on user profile
- Includes market demand and industry alignment scores

---

### `POST /api/career-paths/details`
Generates detailed information for a selected career path.

**Request:**
```json
{
  "resumeProfile": { /* Full ResumeProfile object */ },
  "pathBasic": {
    "roleId": "string",
    "roleName": "string"
  },
  "aiProvider": "deepseek" | "gemini" (optional)
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "roleId": "string",
    "roleName": "string",
    "description": "string",
    "marketDemandScore": 0-100,
    "effortLevel": "Low" | "Medium" | "High",
    "rewardPotential": "Low" | "Medium" | "High",
    "reasoning": "string",
    "requiredSkills": ["string"],
    "industryAlignment": 0-100
  }
}
```

**Description:**
- Returns detailed information for a selected career path
- Includes effort level, reward potential, and detailed reasoning
- Called after user selects a path from carousel

---

### `POST /api/skill-gap/analyze`
Analyzes skill gaps for a selected career path.

**Request:**
```json
{
  "resumeProfile": { /* Full ResumeProfile object */ },
  "careerPath": {
    "roleId": "string",
    "roleName": "string",
    "description": "string",
    "marketDemandScore": 0-100,
    "effortLevel": "Low" | "Medium" | "High",
    "rewardPotential": "Low" | "Medium" | "High",
    "reasoning": "string",
    "requiredSkills": ["string"],
    "industryAlignment": 0-100
  },
  "aiProvider": "deepseek" | "gemini" (optional)
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "requiredSkills": [
      {
        "skill": "string",
        "proficiency": "Beginner" | "Intermediate" | "Expert",
        "importance": "Low" | "Medium" | "High",
        "currentLevel": "Beginner" | "Intermediate" | "Expert",
        "gapSeverity": 0-100,
        "learningResources": ["string"]
      }
    ],
    "overallGapScore": 0-100,
    "estimatedTimeToClose": "string",
    "quickWins": ["string"]
  }
}
```

**Description:**
- Compares current skills against required skills for target role
- Provides gap assessment with learning resources
- Estimates timeline for skill development
- Includes quick wins (skills that can be learned quickly)

---

### `POST /api/roadmap/generate`
Generates actionable month-by-month career roadmap.

**Request:**
```json
{
  "resumeProfile": { /* Full ResumeProfile object */ },
  "careerPath": { /* Full CareerPath object */ },
  "skillGapAnalysis": { /* Full SkillGapAnalysis object */ },
  "timelineMonths": 6 (optional, default: 6, range: 3-24),
  "aiProvider": "deepseek" | "gemini" (optional)
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "roadmap": [
      {
        "month": 1,
        "title": "string",
        "focus": ["string"],
        "keySkills": ["string"],
        "actionItems": ["string"],
        "projects": ["string"],
        "milestones": ["string"],
        "resources": ["string"]
      }
    ],
    "successMetrics": ["string"],
    "riskFactors": ["string"],
    "supportResources": ["string"]
  }
}
```

**Description:**
- Creates a detailed month-by-month transition plan
- Includes actionable projects, milestones, and resources
- Provides success metrics and risk mitigation strategies
- Timeline adjusts based on skill gap severity

---

## Response Format

All API routes follow a consistent response format:

```json
{
  "success": true|false,
  "data": { /* Route-specific data */ },
  "error": "string (only if success is false)"
}
```

---

## Additional API Routes

### `GET /api/samples/resume/[id]`
Retrieves sample resume content by ID.

**Supported IDs:**
- `entry-level-marketing`
- `mid-level-software`
- `executive-finance`
- `senior-healthcare`

**Response:**
```json
{
  "success": true,
  "data": "string (resume content)"
}
```

---

### `POST /api/upload/parse-file`
Parses PDF, TXT, and DOCX files and extracts text.

**Request:**
Multipart form data with `file` field containing PDF, TXT, or DOCX file (max 2MB)

**Response:**
```json
{
  "success": true,
  "data": {
    "text": "string (extracted text)",
    "fileName": "string"
  }
}
```

**Description:**
- Supports PDF, TXT, and DOCX file uploads
- Extracts and cleans text using pdf2json (PDF), TextDecoder (TXT), and mammoth (DOCX)
- Handles special character spacing issues
- Maximum file size: 2MB

---

For AI provider configuration, caching, rate limiting, and debugging information, see [TECHNICAL_DETAILS.md](TECHNICAL_DETAILS.md).
