// Skill → Specialism mapping derived from recruitable.asia/domains.
// Used during onboarding: user picks top 5 skills → we determine their specialism.

class Skill {
  final String name;
  final String category; // matches Specialism.id
  final String displayName;

  const Skill({
    required this.name,
    required this.category,
    required this.displayName,
  });
}

class Specialism {
  final String id;
  final String category;     // top-level category shown in app tabs
  final String title;
  final String description;
  final String color;        // hex
  final String accent;       // hex
  final List<String> coreSkills;

  const Specialism({
    required this.id,
    required this.category,
    required this.title,
    required this.description,
    required this.color,
    required this.accent,
    required this.coreSkills,
  });
}

// ─── Specialisms (mirrors DOMAINS in index.js) ────────────────────────────────

const List<Specialism> kSpecialisms = [
  // AI & ML
  Specialism(
    id: 'ai-eng',
    category: 'AI & ML',
    title: 'AI Engineer',
    description: 'Developing cutting edge AI models and integrating them into production-ready environments.',
    color: '#E91E63',
    accent: '#FF9400',
    coreSkills: ['Python', 'PyTorch', 'LLMs', 'RAG', 'TensorFlow', 'ONNX'],
  ),
  Specialism(
    id: 'ai-prod-eng',
    category: 'AI & ML',
    title: 'AI Product Engineer',
    description: 'Bridging the gap between AI research and user-facing product features.',
    color: '#03A9F4',
    accent: '#3F51B5',
    coreSkills: ['LangChain', 'Next.js', 'Prompt Engineering', 'LLM APIs', 'Vector DBs'],
  ),
  Specialism(
    id: 'sol-eng',
    category: 'AI & ML',
    title: 'Solution Engineer',
    description: 'Architecting complex technical solutions for enterprise AI integrations.',
    color: '#3F51B5',
    accent: '#E91E63',
    coreSkills: ['Sales Engineering', 'Solutions Architecture', 'Pre-Sales', 'APIs', 'Integration'],
  ),
  Specialism(
    id: 'fwd-deploy',
    category: 'AI & ML',
    title: 'Forward Deployment Engineer',
    description: 'Executing high-impact AI deployments directly within client infrastructure.',
    color: '#FF9400',
    accent: '#FFC107',
    coreSkills: ['DevOps', 'Field Engineering', 'SaaS', 'Enterprise Integration', 'Change Management'],
  ),
  Specialism(
    id: 'ai-pm',
    category: 'AI & ML',
    title: 'AI Product Manager',
    description: 'Leading the strategy and roadmap for AI-native product ecosystems.',
    color: '#03A9F4',
    accent: '#3F51B5',
    coreSkills: ['Product Management', 'AI Strategy', 'Roadmapping', 'Stakeholder Management'],
  ),

  // Software Engineering
  Specialism(
    id: 'backend',
    category: 'Software Engineering',
    title: 'Back-end Development',
    description: 'Scaling robust server-side architectures for high-concurrency systems.',
    color: '#E91E63',
    accent: '#03A9F4',
    coreSkills: ['NodeJS', 'Go', 'Rust', 'Postgres', 'Redis', 'gRPC', 'Kubernetes'],
  ),
  Specialism(
    id: 'fullstack',
    category: 'Software Engineering',
    title: 'Full Stack Development',
    description: 'End-to-end product delivery across modern web and mobile stacks.',
    color: '#03A9F4',
    accent: '#3F51B5',
    coreSkills: ['React', 'Next.js', 'TypeScript', 'NodeJS', 'GraphQL', 'Postgres'],
  ),
  Specialism(
    id: 'frontend',
    category: 'Software Engineering',
    title: 'Front End Development',
    description: 'Crafting pixel-perfect, high-performance user interfaces.',
    color: '#3F51B5',
    accent: '#00BCD4',
    coreSkills: ['React', 'Vue', 'TailwindCSS', 'TypeScript', 'WebGL', 'CSS'],
  ),
  Specialism(
    id: 'mobile',
    category: 'Software Engineering',
    title: 'Mobile Development',
    description: 'Building native and cross-platform mobile experiences for scale.',
    color: '#FF9400',
    accent: '#FFC107',
    coreSkills: ['Kotlin', 'Flutter', 'Swift', 'React Native', 'Jetpack Compose', 'SwiftUI'],
  ),
  Specialism(
    id: 'eng-mgr',
    category: 'Software Engineering',
    title: 'Engineering Manager',
    description: 'Leading and scaling high-performing technical teams and culture.',
    color: '#00BCD4',
    accent: '#3F51B5',
    coreSkills: ['Leadership', 'Agile', 'Mentorship', 'System Design', 'Hiring', 'OKRs'],
  ),

  // Data
  Specialism(
    id: 'ml-eng',
    category: 'Data',
    title: 'ML Engineering',
    description: 'Productionizing ML models with scalable infrastructure and MLOps.',
    color: '#E91E63',
    accent: '#3F51B5',
    coreSkills: ['Kubeflow', 'SageMaker', 'Docker', 'MLflow', 'Feature Stores', 'CI/CD'],
  ),
  Specialism(
    id: 'data-eng',
    category: 'Data',
    title: 'Data Engineering',
    description: 'Architecting data pipelines and warehouses for large-scale intelligence.',
    color: '#03A9F4',
    accent: '#FF9400',
    coreSkills: ['Spark', 'Snowflake', 'SQL', 'ETL', 'Airflow', 'dbt', 'Kafka'],
  ),
  Specialism(
    id: 'data-sci',
    category: 'Data',
    title: 'Data Scientist',
    description: 'Extracting actionable insights from complex datasets via statistical modelling.',
    color: '#3F51B5',
    accent: '#E91E63',
    coreSkills: ['Python', 'Statistics', 'Pandas', 'Scikit-Learn', 'A/B Testing', 'SQL'],
  ),

  // Product
  Specialism(
    id: 'prod-mgr',
    category: 'Product',
    title: 'Product Manager',
    description: 'Driving user-centric product discovery and execution.',
    color: '#FF9400',
    accent: '#3F51B5',
    coreSkills: ['Agile', 'UI/UX', 'Roadmapping', 'User Research', 'Analytics', 'Stakeholder Management'],
  ),
  Specialism(
    id: 'prod-des',
    category: 'Product',
    title: 'Product Designer',
    description: 'Designing intuitive and beautiful user experiences for complex software.',
    color: '#03A9F4',
    accent: '#E91E63',
    coreSkills: ['Figma', 'Design Systems', 'Prototyping', 'User Research', 'Accessibility'],
  ),
  Specialism(
    id: 'prod-eng',
    category: 'Product',
    title: 'Product Engineering',
    description: 'Highly technical product leaders who code and lead features.',
    color: '#E91E63',
    accent: '#03A9F4',
    coreSkills: ['MVP', 'Full Stack', 'Tech Lead', 'System Design', 'Roadmapping'],
  ),
];

// ─── All selectable skills (flattened from specialism coreSkills) ──────────────

const List<String> kAllSkills = [
  // AI & ML
  'Python', 'PyTorch', 'TensorFlow', 'LLMs', 'RAG', 'ONNX',
  'LangChain', 'Prompt Engineering', 'LLM APIs', 'Vector DBs',
  'Sales Engineering', 'Solutions Architecture', 'Pre-Sales',
  'DevOps', 'Field Engineering', 'SaaS', 'Enterprise Integration',
  'Product Management', 'AI Strategy',

  // Software Engineering
  'NodeJS', 'Go', 'Rust', 'Postgres', 'Redis', 'gRPC', 'Kubernetes',
  'React', 'Next.js', 'TypeScript', 'GraphQL',
  'Vue', 'TailwindCSS', 'CSS', 'WebGL',
  'Kotlin', 'Flutter', 'Swift', 'React Native', 'Jetpack Compose', 'SwiftUI',
  'Leadership', 'Agile', 'Mentorship', 'System Design', 'Hiring',

  // Data
  'Kubeflow', 'SageMaker', 'Docker', 'MLflow', 'CI/CD',
  'Spark', 'Snowflake', 'SQL', 'ETL', 'Airflow', 'dbt', 'Kafka',
  'Statistics', 'Pandas', 'Scikit-Learn', 'A/B Testing',

  // Product
  'UI/UX', 'Roadmapping', 'User Research', 'Analytics',
  'Figma', 'Design Systems', 'Prototyping', 'Accessibility',
  'MVP', 'Full Stack', 'Tech Lead',

  // General
  'APIs', 'Integration', 'Change Management', 'OKRs',
  'Feature Stores', 'Stakeholder Management',
];

// ─── Mapping: given a set of skills, return the best-matching specialism ──────

/// Returns the [Specialism] whose coreSkills have the most overlap with [selectedSkills].
/// Tie-breaks in favour of the specialism listed first (maintains recruitable.asia priority order).
Specialism resolveSpecialism(List<String> selectedSkills) {
  final normalised = selectedSkills.map((s) => s.toLowerCase()).toSet();

  Specialism? best;
  int bestScore = -1;

  for (final spec in kSpecialisms) {
    final score = spec.coreSkills
        .where((s) => normalised.contains(s.toLowerCase()))
        .length;
    if (score > bestScore) {
      bestScore = score;
      best = spec;
    }
  }

  // Fallback to Full Stack if no clear match
  return best ?? kSpecialisms.firstWhere((s) => s.id == 'fullstack');
}

/// Returns the top 3 matching specialisms ranked by skill overlap.
/// Used to show "You could also match as..." suggestions.
List<Specialism> resolveTopSpecialisms(List<String> selectedSkills, {int count = 3}) {
  final normalised = selectedSkills.map((s) => s.toLowerCase()).toSet();

  final scored = kSpecialisms.map((spec) {
    final score = spec.coreSkills
        .where((s) => normalised.contains(s.toLowerCase()))
        .length;
    return (spec: spec, score: score);
  }).toList()
    ..sort((a, b) => b.score.compareTo(a.score));

  return scored.take(count).map((e) => e.spec).toList();
}
