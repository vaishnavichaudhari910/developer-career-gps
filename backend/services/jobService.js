const axios = require('axios');

// ── Calculate match score between user skills and job ────
const calculateMatchScore = (userSkills, jobTags, jobTitle, jobDescription) => {
  if (!userSkills || userSkills.length === 0) return 50;

  const lowerSkills = userSkills.map(s => s.toLowerCase());
  const searchText  = [
    ...(jobTags        || []),
    jobTitle           || '',
    jobDescription     || ''
  ].join(' ').toLowerCase();

  let matchCount = 0;
  lowerSkills.forEach(skill => {
    if (searchText.includes(skill)) matchCount++;
  });

  const score = Math.round((matchCount / lowerSkills.length) * 100);
  return Math.min(Math.max(score, 10), 99); // between 10-99
};

// ── Fetch jobs from Arbeitnow (completely free, no key) ──
exports.fetchArbeitnowJobs = async (skills, role) => {
  try {
    const query = role || skills.slice(0, 3).join(' ');

    const { data } = await axios.get(
      `https://www.arbeitnow.com/api/job-board-api`,
      {
        params: { search: query },
        timeout: 10000
      }
    );

    return (data.data || []).slice(0, 30).map(job => ({
      jobId:       job.slug        || String(Math.random()),
      title:       job.title       || 'Developer',
      company:     job.company_name || 'Company',
      location:    job.location    || 'Remote',
      description: (job.description || '').substring(0, 300),
      url:         job.url         || '',
      salary:      'Not disclosed',
      jobType:     job.job_types?.[0] || 'Full-time',
      tags:        job.tags        || [],
      source:      'Arbeitnow',
      matchScore:  calculateMatchScore(skills, job.tags, job.title, job.description)
    }));

  } catch (err) {
    console.error('Arbeitnow API error:', err.message);
    return [];
  }
};

// ── Fetch jobs from Adzuna API ───────────────────────────
exports.fetchAdzunaJobs = async (skills, role) => {
  try {
    if (!process.env.ADZUNA_APP_ID || !process.env.ADZUNA_API_KEY) {
      console.log('⚠️ Adzuna keys not set, skipping...');
      return [];
    }

    const query = role || skills.slice(0, 2).join(' ');

    const { data } = await axios.get(
      `https://api.adzuna.com/v1/api/jobs/in/search/1`,
      {
        params: {
          app_id:           process.env.ADZUNA_APP_ID,
          app_key:          process.env.ADZUNA_API_KEY,
          what:             query,
          where:            'india',
          results_per_page: 20,
          content_type:     'application/json'
        },
        timeout: 10000
      }
    );

    return (data.results || []).map(job => ({
      jobId:       String(job.id),
      title:       job.title              || 'Developer',
      company:     job.company?.display_name || 'Company',
      location:    job.location?.display_name || 'India',
      description: (job.description || '').substring(0, 300),
      url:         job.redirect_url       || '',
      salary:      job.salary_min
        ? `₹${Math.round(job.salary_min/1000)}k - ₹${Math.round(job.salary_max/1000)}k`
        : 'Not disclosed',
      jobType:     'Full-time',
      tags:        [],
      source:      'Adzuna',
      matchScore:  calculateMatchScore(skills, [], job.title, job.description)
    }));

  } catch (err) {
    console.error('Adzuna API error:', err.message);
    return [];
  }
};

// ── Merge + deduplicate + sort jobs ─────────────────────
exports.mergeAndSortJobs = (arbeitnowJobs, adzunaJobs) => {
  const allJobs = [...arbeitnowJobs, ...adzunaJobs];

  // Remove duplicates by title+company
  const seen    = new Set();
  const unique  = allJobs.filter(job => {
    const key = `${job.title}-${job.company}`.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Sort by match score descending
  return unique.sort((a, b) => b.matchScore - a.matchScore);
};