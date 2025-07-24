import { supabase } from '../config/supabaseClient.js';

export const getAllProjects = async (req, res) => {
  try {
    const { data: projects, error } = await supabase
      .from('projects')
      .select('*')
      .order('start_date', { ascending: true });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ projects });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getActiveProjects = async (req, res) => {
  try {
    const { data: projects, error } = await supabase
      .from('projects')
      .select('*')
      .eq('status_project', 'on_going')
      .order('start_date', { ascending: true });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ projects });
  } catch (error) {
    console.error('Error fetching active projects:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getProjectById = async (req, res) => {
  const { id } = req.params;

  try {
    const { data: project, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return res.status(404).json({ error: 'Proyek tidak ditemukan' });
    }

    return res.status(200).json({ project });
  } catch (error) {
    console.error('Error fetching project:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const applyForProject = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();

    if (projectError || !project) {
      return res.status(404).json({ error: 'Proyek tidak ditemukan' });
    }

    if (project.status_project === 'done') {
      return res.status(400).json({ error: 'Proyek sudah selesai, tidak dapat menerima pendaftaran baru' });
    }

    if (project.current_volunteers >= project.max_volunteers) {
      return res.status(400).json({ error: 'Proyek sudah penuh' });
    }

    const { data: existingApplication, error: applicationError } = await supabase
      .from('volunteer_assignments')
      .select('*')
      .eq('project_id', id)
      .eq('volunteer_id', userId)
      .single();

    if (existingApplication) {
      return res.status(400).json({ 
        error: 'Anda sudah mendaftar untuk proyek ini',
        status: existingApplication.status
      });
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      return res.status(404).json({ error: 'Profil tidak ditemukan' });
    }

    if (profile.status_volunteer === 'closed') {
      return res.status(400).json({ error: 'Status volunteer Anda saat ini tidak menerima tugas baru' });
    }

    let matchScore = 0;
    const matchReasons = [];

    if (project.required_skills && Array.isArray(project.required_skills) && 
        profile.volunteer_opportunities) {
      
      const userSkills = [];
      Object.entries(profile.volunteer_opportunities).forEach(([category, skills]) => {
        Object.entries(skills).forEach(([skill, value]) => {
          if (value === true) {
            userSkills.push(skill.toLowerCase().replace(/_/g, ' '));
          }
        });
      });
      
      project.required_skills.forEach(skill => {
        const skillLower = skill.toLowerCase();
        if (userSkills.some(userSkill => userSkill.includes(skillLower) || skillLower.includes(userSkill))) {
          matchScore += 25;
          matchReasons.push(`Memiliki keahlian yang dibutuhkan: ${skill}`);
        }
      });
    }

    if (project.required_languages && Array.isArray(project.required_languages) && 
        profile.languages && Array.isArray(profile.languages)) {
      
      project.required_languages.forEach(language => {
        if (profile.languages.some(lang => lang.toLowerCase() === language.toLowerCase())) {
          matchScore += 25;
          matchReasons.push(`Menguasai bahasa yang dibutuhkan: ${language}`);
        }
      });
    }

    if (project.min_experience && profile.years_experience) {
      const expLevels = {
        '< 6 months': 1,
        '6 months - 1 year': 2,
        '> 1 year': 3
      };
      
      const projectMinExp = expLevels[project.min_experience] || 0;
      const userExp = expLevels[profile.years_experience] || 0;
      
      if (userExp >= projectMinExp) {
        matchScore += 25;
        matchReasons.push(`Memiliki pengalaman yang cukup: ${profile.years_experience}`);
      }
    }

    if (project.project_type && profile.groups) {
      if ((project.project_type === 'explorers' && profile.groups.explorers) ||
          (project.project_type === 'study_group' && profile.groups.study_groups)) {
        matchScore += 25;
        matchReasons.push(`Tertarik dengan tipe proyek: ${project.project_type}`);
      }
    }

    matchScore = Math.min(matchScore, 100);

    const { data: application, error } = await supabase
      .from('volunteer_assignments')
      .insert([
        {
          project_id: id,
          volunteer_id: userId,
          status: 'applied',
          match_score: matchScore,
          match_reason: matchReasons.join('; ')
        }
      ])
      .select();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(201).json({ 
      message: 'Pendaftaran berhasil', 
      application: application[0] 
    });
  } catch (error) {
    console.error('Error applying for project:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getRecommendedProjects = async (req, res) => {
  const userId = req.user.id;

  try {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      return res.status(404).json({ error: 'Profil tidak ditemukan' });
    }

    if (profile.status_volunteer === 'closed') {
      return res.status(400).json({ error: 'Status volunteer Anda saat ini tidak menerima rekomendasi baru' });
    }

    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('*')
      .eq('status_project', 'on_going')
      .lt('start_date', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString())
      .gt('end_date', new Date().toISOString())
      .order('start_date', { ascending: true });

    if (projectsError) {
      return res.status(500).json({ error: projectsError.message });
    }

    let recommendedProjects = [];
    try {
      if (recommendedProjects.length === 0) {
        recommendedProjects = calculateLocalRecommendations(profile, projects);
      }
    } catch (apiError) {
      console.error('Error calling external matchmaking API:', apiError);
      recommendedProjects = calculateLocalRecommendations(profile, projects);
    }

    return res.status(200).json({ recommended_projects: recommendedProjects });
  } catch (error) {
    console.error('Error getting recommended projects:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getUserProjectApplications = async (req, res) => {
  const userId = req.user.id;

  try {
    const { data: applications, error } = await supabase
      .from('volunteer_assignments')
      .select(`
        id,
        status,
        match_score,
        match_reason,
        applied_at,
        projects:project_id (*, status_project)
      `)
      .eq('volunteer_id', userId)
      .order('applied_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ applications });
  } catch (error) {
    console.error('Error fetching user applications:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const createProject = async (req, res) => {
  const { 
    title, description, project_type, details, 
    required_skills, required_languages, min_experience,
    start_date, end_date, duration, max_volunteers, status_project 
  } = req.body;

  if (!title || !project_type) {
    return res.status(400).json({ error: 'Judul dan tipe proyek diperlukan' });
  }

  try {
    const { data, error } = await supabase
      .from('projects')
      .insert([
        { 
          title, 
          description, 
          project_type,
          details: details || {},
          required_skills: Array.isArray(required_skills) ? required_skills : [],
          required_languages: Array.isArray(required_languages) ? required_languages : [],
          min_experience,
          start_date,
          end_date,
          duration,
          max_volunteers: max_volunteers || 1,
          current_volunteers: 0,
          status_project: status_project || 'on_going'
        }
      ])
      .select();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(201).json({ project: data[0] });
  } catch (error) {
    console.error('Error creating project:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateProject = async (req, res) => {
  const { id } = req.params;
  const { 
    title, description, project_type, details, 
    required_skills, required_languages, min_experience,
    start_date, end_date, duration, max_volunteers, status_project
  } = req.body;

  try {
    const { data, error } = await supabase
      .from('projects')
      .update({ 
        title, 
        description, 
        project_type,
        details: details || undefined,
        required_skills: Array.isArray(required_skills) ? required_skills : undefined,
        required_languages: Array.isArray(required_languages) ? required_languages : undefined,
        min_experience,
        start_date,
        end_date,
        duration,
        max_volunteers,
        status_project
      })
      .eq('id', id)
      .select();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    if (data.length === 0) {
      return res.status(404).json({ error: 'Proyek tidak ditemukan' });
    }

    return res.status(200).json({ project: data[0] });
  } catch (error) {
    console.error('Error updating project:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteProject = async (req, res) => {
  const { id } = req.params;

  try {
    await supabase
      .from('volunteer_assignments')
      .delete()
      .eq('project_id', id);

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ message: 'Proyek berhasil dihapus' });
  } catch (error) {
    console.error('Error deleting project:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

function calculateLocalRecommendations(profile, projects) {
  const userSkills = [];
  if (profile.volunteer_opportunities) {
    Object.entries(profile.volunteer_opportunities).forEach(([category, skills]) => {
      Object.entries(skills).forEach(([skill, value]) => {
        if (value === true) {
          userSkills.push(skill.toLowerCase().replace(/_/g, ' '));
        }
      });
    });
  }

  const userLanguages = profile.languages || [];

  const recommendedProjects = projects.map(project => {
    let matchScore = 0;
    const matchReasons = [];

    if (project.required_skills && Array.isArray(project.required_skills)) {
      project.required_skills.forEach(skill => {
        const skillLower = skill.toLowerCase();
        if (userSkills.some(userSkill => userSkill.includes(skillLower) || skillLower.includes(userSkill))) {
          matchScore += 20;
          matchReasons.push(`Memiliki keahlian yang dibutuhkan: ${skill}`);
        }
      });
    }

    if (project.required_languages && Array.isArray(project.required_languages)) {
      project.required_languages.forEach(language => {
        if (userLanguages.some(lang => lang.toLowerCase() === language.toLowerCase())) {
          matchScore += 20;
          matchReasons.push(`Menguasai bahasa yang dibutuhkan: ${language}`);
        }
      });
    }

    if (project.min_experience && profile.years_experience) {
      const expLevels = {
        '< 6 months': 1,
        '6 months - 1 year': 2,
        '> 1 year': 3
      };
      
      const projectMinExp = expLevels[project.min_experience] || 0;
      const userExp = expLevels[profile.years_experience] || 0;
      
      if (userExp >= projectMinExp) {
        matchScore += 20;
        matchReasons.push(`Memiliki pengalaman yang cukup: ${profile.years_experience}`);
      }
    }

    if (project.duration && profile.preferred_duration) {
      const durationLevels = {
        '1 week': 1,
        '2 weeks': 2,
        '1 month': 3,
        '> 1 month': 4
      };
      
      const projectDuration = project.duration.includes('month') ? 
        (project.duration.includes('>') ? 4 : 3) : 
        (project.duration.includes('week') ? 
          (project.duration.includes('2') ? 2 : 1) : 1);
          
      const userPref = durationLevels[profile.preferred_duration] || 0;
      
      if (projectDuration <= userPref) {
        matchScore += 20;
        matchReasons.push(`Durasi proyek sesuai preferensi: ${profile.preferred_duration}`);
      }
    }

    if (project.project_type && profile.groups) {
      if ((project.project_type === 'explorers' && profile.groups.explorers) ||
          (project.project_type === 'study_group' && profile.groups.study_groups) ||
          (project.project_type.includes('museum') && profile.volunteer_opportunities?.museum?.training)) {
        matchScore += 20;
        matchReasons.push(`Tertarik dengan tipe proyek: ${project.project_type}`);
      }
    }

    matchScore = Math.min(matchScore, 100);

    return {
      ...project,
      match_score: matchScore,
      match_reasons: matchReasons
    };
  });

  recommendedProjects.sort((a, b) => b.match_score - a.match_score);

  return recommendedProjects.filter(project => project.match_score > 0);
} 