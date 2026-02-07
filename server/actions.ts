import { createServerFn } from '@tanstack/react-start'
import { GoogleGenerativeAI } from '@google/generative-ai'
import fs from 'node:fs/promises'
import path from 'node:path'

const serverKV = new Map()
let cachedUserInfo: { hash: string; data: any } | null = null

const CONFIG = {
  github: {
    username: 'Tenuka22',
    profileUrl: 'https://github.com/Tenuka22',
    repositoriesUrl: 'https://github.com/Tenuka22?tab=repositories',
    apiProfileUrl: 'https://api.github.com/users/Tenuka22',
    apiReposUrl:
      'https://api.github.com/users/Tenuka22/repos?sort=updated&per_page=100',
  },
  linkedin: {
    profileUrl: 'https://linkedin.com/in/tenuka-omaljith-31b61538a',
  },
  fallback: {
    name: 'Tenuka',
    email: 'tenukaomaljith2009@gmail.com',
  },
}

async function generateProfileWithAdvancedScraping(
  readmeContent: string,
  realRepos: any[] = [],
): Promise<any> {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not set in environment variables')
  }

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
  })

  const prompt = `
You are an expert web scraper and data analyst. You have web access capabilities and can search for and retrieve information from the internet.

CRITICAL INSTRUCTION: You MUST actively use web search to fetch REAL, CURRENT data. Do not make up or assume any information.

YOUR MISSION:
Create a comprehensive developer profile by actively scraping and collecting data from multiple sources.

REAL DATA FROM GITHUB API (USE THESE AS PRIMARY PROJECT SOURCE):
${JSON.stringify(
  realRepos.slice(0, 20).map((r: any) => ({
    name: r.name,
    description: r.description,
    url: r.html_url,
    language: r.language,
    stars: r.stargazers_count,
    forks: r.forks_count,
    topics: r.topics,
    lastUpdated: r.updated_at,
  })),
  null,
  2,
)}

STEP-BY-STEP SCRAPING PROTOCOL:

STEP 1: SCRAPE GITHUB PROFILE
- Search for and access: ${CONFIG.github.profileUrl}
- Also try the API endpoint: ${CONFIG.github.apiProfileUrl}
- Extract:
  ✓ Full name
  ✓ Username
  ✓ Bio/description
  ✓ Location
  ✓ Company
  ✓ Website/blog URL
  ✓ Avatar/profile picture URL
  ✓ Public repository count
  ✓ Followers count
  ✓ Following count
  ✓ Account creation date

STEP 2: SCRAPE GITHUB REPOSITORIES
- Search for and access: ${CONFIG.github.repositoriesUrl}
- Also try the API: ${CONFIG.github.apiReposUrl}
- For EACH repository, collect:
  ✓ Repository name
  ✓ Description
  ✓ Primary programming language
  ✓ Star count
  ✓ Fork count
  ✓ Topics/tags
  ✓ Repository URL
  ✓ Last updated date
  ✓ README preview (if significant)
- Get at least 10-15 repositories
- Prioritize: most stars, most recently updated, diverse tech stack

STEP 3: ANALYZE REPOSITORY CONTENT
- For top 5-6 repositories:
  - Search for "{username}/{repo-name} github" to find more details
  - Look for: purpose, features, tech stack used
  - Check if it has: live demo, documentation, contributors

STEP 4: SCRAPE LINKEDIN (ATTEMPT)
- Search for: ${CONFIG.linkedin.profileUrl}
- Try to extract:
  ✓ Professional headline
  ✓ Current position/company
  ✓ Education
  ✓ Skills listed
  ✓ Certifications
- Note: LinkedIn may block direct scraping, do your best

STEP 5: SEARCH FOR ADDITIONAL CONTEXT
- Search: "Tenuka22 developer github"
- Search: "Tenuka Omaljith software engineer"
- Look for: blog posts, portfolio sites, DEV.to articles, Stack Overflow presence

STEP 6: ANALYZE README
Use this README content as SUPPLEMENTARY information (not primary):
${readmeContent}

STEP 7: SYNTHESIZE AND GENERATE PROFILE

Create a JSON profile with REAL scraped data. Requirements:

{
  "name": "Full name from GitHub (e.g., 'Tenuka Omaljith')",
  "plainName": "First name only",
  "about": "HTML formatted bio with high creativity. Requirements:
    - Start with a small, relevant ASCII art (e.g., a simple rocket or heart).
    - Use 3-4 paragraphs with emojis to make it engaging.
    - Include a 'Why Hire Me?' or 'Client Benefits' section with <ul> and <li>.
    - Highlight key benefits like: Rapid Development ⚡, Clean Code 💎, and User-Centric Design 🎨.
    - Use <strong> for emphasis and <em> for subtle notes.
    - Ensure it looks professional yet personality-driven.",
  "github": "${CONFIG.github.profileUrl}",
  "linkedin": "${CONFIG.linkedin.profileUrl}",
  "email": "Extract from README or use ${CONFIG.fallback.email}",
  "phone": "Extract from README or leave empty",
  "avatar": "Direct URL to GitHub profile picture",
  "location": "From GitHub profile",
  "website": "Personal website from GitHub profile",
  "bio": "GitHub bio text",
  "company": "Company from GitHub profile",
  "stats": {
    "repos": "Actual public repo count (number)",
    "followers": "Actual followers (number)",
    "following": "Actual following (number)",
    "createdAt": "GitHub account creation date"
  },
  "projects": [
    {
      "name": "REAL repository name",
      "description": "REAL description (enhance slightly if too brief)",
      "url": "REAL repository URL",
      "language": "Primary language",
      "stars": "REAL star count",
      "forks": "REAL fork count",
      "topics": ["REAL", "topics"],
      "lastUpdated": "Last update date",
      "isActive": "boolean - updated in last 6 months"
    }
  ],
  "skills": {
    "languages": ["Languages from repos - frequency sorted"],
    "frameworks": ["Frameworks/libraries found in repos"],
    "tools": ["Tools and technologies"],
    "domains": ["Application domains - web, mobile, ML, etc."]
  },
  "activity": {
    "totalCommits": "Estimate if visible",
    "contributionsLastYear": "Estimate if visible",
    "mostActiveLanguage": "Most used language",
    "projectDiversity": "Assessment of project variety"
  },
  "scrapingReport": {
    "timestamp": "ISO timestamp of scraping",
    "githubProfileScraped": true/false,
    "githubReposScraped": true/false,
    "linkedinScraped": true/false,
    "repositoriesFound": "number of repos found",
    "dataSources": ["list of sources successfully accessed"],
    "limitations": ["any limitations or failures"],
    "confidence": "high/medium/low based on data quality"
  }
}

CRITICAL RULES:
1. You MUST use web search - search for each URL mentioned above
2. Include ONLY real data from scraping - NO made-up examples
3. If you cannot scrape something, note it in scrapingReport.limitations
4. Prioritize scraped data > README content > fallback values
5. For projects, include AT LEAST 6 real repositories
6. Extract actual star counts, languages, and descriptions
7. Return ONLY the JSON object - no markdown formatting, no explanations

VALIDATION CHECKLIST:
Before returning, verify:
- [ ] Avatar URL is a real GitHub CDN URL
- [ ] Repository URLs are real github.com URLs
- [ ] Star counts are numbers, not placeholders
- [ ] Programming languages match actual repositories
- [ ] Project descriptions are from real repos
- [ ] Stats (repos, followers) are real numbers from GitHub
- [ ] scrapingReport accurately reflects what was accessed

If scraping completely fails, use fallbacks but mark confidence as "low" and list limitations.

BEGIN SCRAPING NOW.
`

  try {
    console.log('=== Starting Advanced Gemini Web Scraping ===')
    console.log('Target GitHub Profile:', CONFIG.github.profileUrl)
    console.log('Target GitHub Repos:', CONFIG.github.repositoriesUrl)
    console.log('Target LinkedIn:', CONFIG.linkedin.profileUrl)
    console.log('Calling Gemini...')

    const result = await model.generateContent(prompt)
    const response = result.response
    const text = response.text()

    console.log('Gemini response received')
    console.log('Response length:', text.length, 'characters')

    let cleanedText = text
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim()

    const jsonMatch = cleanedText.match(/\{[\s\S]*\}/)

    if (!jsonMatch) {
      console.error('No JSON found in response')
      console.log('Response preview:', text.substring(0, 500))
      throw new Error('Failed to extract JSON from Gemini response')
    }

    const userInfo = JSON.parse(jsonMatch[0])

    userInfo.lastUpdated = new Date().toISOString()
    userInfo.generationMethod = 'gemini-advanced-web-scraping'
    userInfo.modelUsed = 'gemini-2.5-flash'

    console.log('✓ Successfully parsed user info')
    console.log(
      '✓ Scraping confidence:',
      userInfo.scrapingReport?.confidence || 'unknown',
    )
    console.log(
      '✓ Repositories found:',
      userInfo.scrapingReport?.repositoriesFound || 'unknown',
    )
    console.log('✓ Projects included:', userInfo.projects?.length || 0)

    return userInfo
  } catch (error: any) {
    console.error('❌ Error during scraping:', error)
    throw error
  }
}

export const getUserInfo = createServerFn({
  method: 'GET',
}).handler(async () => {
  try {
    console.log('\n=== getUserInfo Handler Started ===')

    const readmePath = path.join(process.cwd(), 'README.md')
    let readmeContent = ''

    try {
      readmeContent = await fs.readFile(readmePath, 'utf-8')
      console.log('✓ README.md loaded')
    } catch (error) {
      console.warn('⚠ README.md not found - will use web scraping only')
      readmeContent = 'No README file found. Rely entirely on web scraping.'
    }

    const currentPeriod = Math.floor(Date.now() / (1000 * 60 * 60 * 3))
    const hashString = `${currentPeriod}-${CONFIG.github.username}`
    const hashBuffer = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(hashString),
    )
    const currentHash = Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')

    const cached = serverKV.get('user_info_cache')
    if (cached && cached.hash === currentHash) {
      console.log('✓ Returning cached data (valid for 3 hours)')
      return cached.data
    }

    if (cachedUserInfo && cachedUserInfo.hash === currentHash) {
      console.log('✓ Returning in-memory cached data')
      return cachedUserInfo.data
    }

    console.log('⟳ Generating fresh profile with web scraping...')

    // Fetch real repositories from GitHub API
    let realRepos: any[] = []
    try {
      const reposResponse = await fetch(CONFIG.github.apiReposUrl, {
        headers: {
          'User-Agent': 'Tenuka22-Portfolio-Scraper',
        },
      })
      if (reposResponse.ok) {
        realRepos = await reposResponse.json()
        console.log(
          `✓ Fetched ${realRepos.length} real repositories from GitHub API`,
        )
      }
    } catch (error) {
      console.warn('⚠ Failed to fetch real repositories from API', error)
    }

    const userInfo = await generateProfileWithAdvancedScraping(
      readmeContent,
      realRepos,
    )

    serverKV.set('user_info_cache', {
      hash: currentHash,
      data: userInfo,
    })

    cachedUserInfo = {
      hash: currentHash,
      data: userInfo,
    }

    console.log('✓ Profile generated and cached successfully')
    console.log('=== getUserInfo Handler Completed ===\n')

    return userInfo
  } catch (error: any) {
    console.error('❌ Critical error in getUserInfo:', error)

    // Re-fetch repos for fallback if not already fetched
    let fallbackRepos: any[] = []
    try {
      const reposResponse = await fetch(CONFIG.github.apiReposUrl, {
        headers: {
          'User-Agent': 'Tenuka22-Portfolio-Scraper',
        },
      })
      if (reposResponse.ok) {
        fallbackRepos = await reposResponse.json()
      }
    } catch (e) {
      // ignore
    }

    const formattedProjects =
      fallbackRepos.length > 0
        ? fallbackRepos.slice(0, 8).map((r) => ({
            name: r.name,
            description: r.description || 'No description provided.',
            url: r.html_url,
            language: r.language || 'Various',
            stars: r.stargazers_count,
            forks: r.forks_count,
            topics: r.topics || [],
          }))
        : [
            {
              name: 'Visit My GitHub',
              description: 'Check out my repositories and projects on GitHub',
              url: CONFIG.github.profileUrl,
              language: 'Various',
              stars: 0,
              forks: 0,
              topics: [],
            },
          ]

    return {
      error: true,
      errorMessage: error.message,
      errorDetails: 'Failed to scrape profile data. Using fallback values.',
      name: CONFIG.fallback.name,
      plainName: CONFIG.fallback.name,
      about: `
<pre class="text-xs text-emerald-500">
  🚀  _____             _         
     |_   _|__ _ _ _ _| |____ _ 
       | |/ -_) ' \\| ' \\ / / _\` |
       |_|\\___|_||_|_||_\\_\\_\\_,_|
</pre>
<p>👋 <strong>Hi there!</strong> I'm ${CONFIG.fallback.name}, a developer dedicated to crafting exceptional digital experiences.</p>
<p>I specialize in building high-performance applications that don't just work—they <em>excel</em>. My focus is on bridging the gap between complex backend logic and intuitive, beautiful frontends.</p>
<p><strong>✨ Why work with me?</strong></p>
<ul>
  <li>⚡ <strong>Rapid Delivery:</strong> Optimized workflows to get your product to market faster.</li>
  <li>💎 <strong>Clean Code:</strong> Maintainable, scalable, and documented architecture.</li>
  <li>🎨 <strong>UX/UI Focus:</strong> User-centric designs that drive engagement and retention.</li>
  <li>🛠️ <strong>Modern Tech:</strong> Leveraging the latest tools like React, TypeScript, and AI integrations.</li>
  <li>🌐 <strong>Real Projects:</strong> Check out my active repositories below!</li>
</ul>
<p>Let's turn your vision into a reality! Check out my <a href="${CONFIG.github.profileUrl}" class="text-blue-400 underline">GitHub</a> for my latest work.</p>`,
      email: CONFIG.fallback.email,
      github: CONFIG.github.profileUrl,
      linkedin: CONFIG.linkedin.profileUrl,
      avatar: '',
      location: '',
      website: '',
      bio: '',
      stats: {
        repos: fallbackRepos.length,
        followers: 0,
        following: 0,
      },
      projects: formattedProjects,
      skills: {
        languages: Array.from(
          new Set(fallbackRepos.map((r) => r.language).filter(Boolean)),
        ),
        frameworks: [],
        tools: [],
        domains: [],
      },
      scrapingReport: {
        timestamp: new Date().toISOString(),
        githubProfileScraped: false,
        githubReposScraped: fallbackRepos.length > 0,
        linkedinScraped: false,
        repositoriesFound: fallbackRepos.length,
        dataSources: fallbackRepos.length > 0 ? ['GitHub API'] : [],
        limitations: [error.message],
        confidence: 'low',
      },
    }
  }
})