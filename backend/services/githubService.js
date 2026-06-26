const axios = require('axios');

// GitHub API instance with auth header
const githubAPI = axios.create({
  baseURL: 'https://api.github.com',
  headers: {
    Authorization: `token ${process.env.GITHUB_TOKEN}`,
    Accept: 'application/vnd.github.v3+json'
  },
  timeout: 10000
});

// ── Calculate GitHub Score (0-100) ───────────────────────
const calculateGitHubScore = (user, repos, languages) => {
  let score = 0;

  // Profile completeness (20 points)
  if (user.bio)       score += 5;
  if (user.location)  score += 3;
  if (user.blog)      score += 3;
  if (user.company)   score += 3;
  if (user.email)     score += 3;
  if (user.avatar_url) score += 3;

  // Repositories (25 points)
  if (repos.length >= 5)  score += 10;
  if (repos.length >= 10) score += 8;
  if (repos.length >= 20) score += 7;

  // Stars received (20 points)
  const totalStars = repos.reduce((sum, r) => sum + r.stargazers_count, 0);
  if (totalStars >= 5)   score += 8;
  if (totalStars >= 20)  score += 7;
  if (totalStars >= 50)  score += 5;

  // Followers (15 points)
  if (user.followers >= 5)   score += 5;
  if (user.followers >= 20)  score += 5;
  if (user.followers >= 100) score += 5;

  // Language diversity (10 points)
  if (languages.length >= 2) score += 4;
  if (languages.length >= 4) score += 3;
  if (languages.length >= 6) score += 3;

  // Recent activity (10 points)
  const recentRepos = repos.filter(r => {
    const updatedAt = new Date(r.updated_at);
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    return updatedAt > sixMonthsAgo;
  });
  if (recentRepos.length >= 2) score += 5;
  if (recentRepos.length >= 5) score += 5;

  return Math.min(score, 100);
};

// ── Detect Missing Skills from GitHub ────────────────────
const detectMissingSkills = (languages) => {
  const allImportantSkills = [
    'TypeScript', 'Python', 'JavaScript', 'Java', 'Go',
    'Docker', 'Kubernetes', 'GraphQL', 'Testing', 'CI/CD'
  ];

  const lowerLangs = languages.map(l => l.toLowerCase());

  return allImportantSkills.filter(skill =>
    !lowerLangs.includes(skill.toLowerCase())
  ).slice(0, 5);
};

// ── Main GitHub Analyzer Function ────────────────────────
exports.analyzeGitHub = async (username) => {
  // Fetch user profile and repos in parallel
  const [userRes, reposRes] = await Promise.all([
    githubAPI.get(`/users/${username}`),
    githubAPI.get(`/users/${username}/repos?per_page=100&sort=updated`)
  ]);

  const user  = userRes.data;
  const repos = reposRes.data;

  // Count languages across all repos
  const langCount = {};
  repos.forEach(repo => {
    if (repo.language) {
      langCount[repo.language] = (langCount[repo.language] || 0) + 1;
    }
  });

  // Sort languages by frequency
  const languages = Object.entries(langCount)
    .sort((a, b) => b[1] - a[1])
    .map(([lang]) => lang);

  const totalStars = repos.reduce((sum, r) => sum + r.stargazers_count, 0);
  const totalForks = repos.reduce((sum, r) => sum + r.forks_count, 0);

  // Top 6 repos by stars
  const topRepos = [...repos]
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 6)
    .map(r => ({
      name:        r.name,
      description: r.description || '',
      stars:       r.stargazers_count,
      forks:       r.forks_count,
      language:    r.language || 'N/A',
      url:         r.html_url,
      updatedAt:   r.updated_at
    }));

  // Calculate score
  const githubScore = calculateGitHubScore(user, repos, languages);

  // Detect missing skills
  const missingSkills = detectMissingSkills(languages);

  // Build strengths list
  const strengths = [];
  if (repos.length >= 10)  strengths.push(`Active developer with ${repos.length} public repositories`);
  if (totalStars >= 10)    strengths.push(`Strong community recognition with ${totalStars} total stars`);
  if (languages.length >= 3) strengths.push(`Polyglot developer — knows ${languages.slice(0, 3).join(', ')}`);
  if (user.followers >= 10) strengths.push(`Good network with ${user.followers} followers`);
  if (strengths.length === 0) strengths.push('Has public repositories to showcase work');

  // Build improvements list
  const improvements = [];
  if (!user.bio)            improvements.push('Add a bio to your GitHub profile');
  if (repos.length < 5)    improvements.push('Create more public repositories to showcase skills');
  if (totalStars < 5)      improvements.push('Build projects that solve real problems to earn stars');
  if (!user.blog)           improvements.push('Add your portfolio website or LinkedIn to profile');
  if (languages.length < 3) improvements.push('Explore projects in different programming languages');
  if (improvements.length === 0) improvements.push('Pin your best repositories on your profile');

  // Profile summary
  const profileSummary = `${user.name || username} is a ${
    githubScore >= 70 ? 'strong' : githubScore >= 40 ? 'growing' : 'beginner'
  } GitHub contributor with ${repos.length} public repos, ${totalStars} stars, and expertise in ${
    languages.slice(0, 3).join(', ') || 'various technologies'
  }.`;

  return {
    username,
    name:           user.name        || '',
    bio:            user.bio         || '',
    avatar:         user.avatar_url  || '',
    location:       user.location    || '',
    followers:      user.followers,
    following:      user.following,
    publicRepos:    repos.length,
    totalStars,
    totalForks,
    languages,
    topRepos,
    githubScore,
    missingSkills,
    strengths,
    improvements,
    profileSummary
  };
};