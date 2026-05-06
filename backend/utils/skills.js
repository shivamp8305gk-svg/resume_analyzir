/**
 * Comprehensive Skills Database
 * Used for detecting skills in resumes and JDs
 */

const SKILLS_DB = {
  programming: {
    label: 'Programming Languages',
    skills: [
      'python', 'javascript', 'typescript', 'java', 'c++', 'c#', 'c', 'go', 'golang',
      'rust', 'swift', 'kotlin', 'php', 'ruby', 'scala', 'r', 'matlab', 'perl',
      'haskell', 'lua', 'dart', 'objective-c', 'assembly', 'bash', 'shell', 'powershell',
      'groovy', 'julia', 'elixir', 'clojure', 'f#', 'vb.net', 'cobol', 'fortran',
    ],
  },
  frontend: {
    label: 'Frontend Development',
    skills: [
      'react', 'react.js', 'reactjs', 'angular', 'angularjs', 'vue', 'vue.js', 'vuejs',
      'next.js', 'nextjs', 'nuxt.js', 'svelte', 'gatsby', 'html', 'html5', 'css', 'css3',
      'sass', 'scss', 'less', 'tailwind', 'tailwindcss', 'bootstrap', 'material-ui', 'mui',
      'chakra-ui', 'ant design', 'redux', 'mobx', 'zustand', 'graphql', 'apollo',
      'webpack', 'vite', 'parcel', 'babel', 'eslint', 'jquery', 'three.js', 'd3.js',
      'styled-components', 'emotion', 'framer motion', 'gsap',
    ],
  },
  backend: {
    label: 'Backend Development',
    skills: [
      'node.js', 'nodejs', 'express', 'express.js', 'expressjs', 'fastapi', 'flask',
      'django', 'spring', 'spring boot', 'laravel', 'rails', 'ruby on rails', 'asp.net',
      '.net core', 'nestjs', 'nest.js', 'koa', 'hapi', 'fastify', 'gin', 'fiber',
      'graphql', 'rest api', 'restful api', 'grpc', 'websocket', 'socket.io',
      'microservices', 'serverless', 'lambda',
    ],
  },
  database: {
    label: 'Databases',
    skills: [
      'mongodb', 'mongoose', 'postgresql', 'postgres', 'mysql', 'sqlite', 'redis',
      'cassandra', 'elasticsearch', 'neo4j', 'dynamodb', 'firestore', 'firebase',
      'oracle', 'sql server', 'mssql', 'mariadb', 'couchdb', 'influxdb', 'supabase',
      'prisma', 'sequelize', 'typeorm', 'knex', 'sql', 'nosql', 'db2',
    ],
  },
  cloud: {
    label: 'Cloud & Infrastructure',
    skills: [
      'aws', 'amazon web services', 'azure', 'microsoft azure', 'gcp', 'google cloud',
      'docker', 'kubernetes', 'k8s', 'terraform', 'ansible', 'chef', 'puppet',
      'jenkins', 'github actions', 'gitlab ci', 'circleci', 'travis ci', 'ci/cd',
      'nginx', 'apache', 'linux', 'ubuntu', 'centos', 'aws ec2', 'aws s3', 'aws lambda',
      'cloudformation', 'helm', 'istio', 'prometheus', 'grafana', 'datadog',
      'heroku', 'vercel', 'netlify', 'digitalocean', 'linode',
    ],
  },
  datascience: {
    label: 'Data Science & AI/ML',
    skills: [
      'machine learning', 'deep learning', 'artificial intelligence', 'ai', 'ml',
      'tensorflow', 'pytorch', 'keras', 'scikit-learn', 'sklearn', 'pandas', 'numpy',
      'matplotlib', 'seaborn', 'plotly', 'scipy', 'nltk', 'spacy', 'hugging face',
      'transformers', 'bert', 'gpt', 'computer vision', 'nlp', 'natural language processing',
      'data analysis', 'data visualization', 'statistical analysis', 'regression',
      'classification', 'clustering', 'neural networks', 'cnn', 'rnn', 'lstm',
      'reinforcement learning', 'feature engineering', 'data preprocessing',
      'jupyter', 'jupyter notebook', 'apache spark', 'hadoop', 'hive', 'kafka',
      'tableau', 'power bi', 'looker', 'dbt', 'airflow', 'mlflow',
    ],
  },
  mobile: {
    label: 'Mobile Development',
    skills: [
      'react native', 'flutter', 'swift', 'swiftui', 'kotlin', 'android', 'ios',
      'xamarin', 'ionic', 'cordova', 'expo', 'mobile development',
    ],
  },
  tools: {
    label: 'Tools & Platforms',
    skills: [
      'git', 'github', 'gitlab', 'bitbucket', 'jira', 'confluence', 'trello',
      'figma', 'sketch', 'adobe xd', 'postman', 'insomnia', 'swagger', 'openapi',
      'vs code', 'visual studio', 'intellij', 'eclipse', 'vim', 'emacs',
      'linux', 'windows', 'macos', 'bash', 'zsh', 'npm', 'yarn', 'pnpm',
      'storybook', 'jest', 'mocha', 'chai', 'cypress', 'playwright', 'selenium',
      'sonarqube', 'maven', 'gradle', 'make', 'cmake',
    ],
  },
  security: {
    label: 'Security',
    skills: [
      'cybersecurity', 'penetration testing', 'ethical hacking', 'owasp',
      'ssl', 'tls', 'oauth', 'jwt', 'authentication', 'authorization',
      'siem', 'soc', 'firewall', 'vpn', 'encryption', 'cryptography',
    ],
  },
  softSkills: {
    label: 'Soft Skills',
    skills: [
      'leadership', 'communication', 'teamwork', 'problem-solving', 'critical thinking',
      'time management', 'project management', 'agile', 'scrum', 'kanban',
      'collaboration', 'mentoring', 'presentation', 'public speaking', 'adaptability',
      'creativity', 'innovation', 'analytical thinking', 'attention to detail',
    ],
  },
};

/**
 * Detect skills from text
 * @param {string} text - Resume or JD text
 * @returns {Array} - Array of {name, category} objects
 */
function detectSkills(text) {
  const lowerText = text.toLowerCase();
  const found = [];
  const foundNames = new Set();

  for (const [categoryKey, categoryData] of Object.entries(SKILLS_DB)) {
    for (const skill of categoryData.skills) {
      if (foundNames.has(skill)) continue;
      // Use word boundary matching for single-word skills
      const regex = skill.length <= 3
        ? new RegExp(`\\b${escapeRegex(skill)}\\b`, 'i')
        : new RegExp(`(?<![a-zA-Z])${escapeRegex(skill)}(?![a-zA-Z])`, 'i');

      if (regex.test(lowerText)) {
        found.push({ name: skill, category: categoryData.label });
        foundNames.add(skill);
      }
    }
  }
  return found;
}

/**
 * Detect missing skills: skills in JD but not in resume
 */
function detectMissingSkills(resumeSkills, jdText) {
  const jdSkills = detectSkills(jdText);
  const resumeSkillNames = new Set(resumeSkills.map(s => s.name.toLowerCase()));
  
  const missing = jdSkills.filter(s => !resumeSkillNames.has(s.name.toLowerCase()));
  
  // Add priority based on frequency in JD
  const jdLower = jdText.toLowerCase();
  return missing.map(skill => {
    const count = (jdLower.match(new RegExp(escapeRegex(skill.name), 'gi')) || []).length;
    return {
      ...skill,
      priority: count >= 3 ? 'high' : count >= 2 ? 'medium' : 'low',
    };
  }).sort((a, b) => {
    const p = { high: 0, medium: 1, low: 2 };
    return p[a.priority] - p[b.priority];
  });
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

module.exports = { detectSkills, detectMissingSkills, SKILLS_DB };
