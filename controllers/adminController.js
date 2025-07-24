import { supabase } from '../config/supabaseClient.js';

export const getAllUsers = async (req, res) => {
  try {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ users: profiles });
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAllTasks = async (req, res) => {
  try {
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ tasks });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const createTask = async (req, res) => {
  const { title, description, required_skills, event_date } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  try {
    const { data, error } = await supabase
      .from('tasks')
      .insert([
        { 
          title, 
          description, 
          required_skills: Array.isArray(required_skills) ? required_skills : [],
          event_date 
        }
      ])
      .select();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(201).json({ task: data[0] });
  } catch (error) {
    console.error('Error creating task:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateTask = async (req, res) => {
  const { id } = req.params;
  const { title, description, required_skills, status, event_date } = req.body;

  try {
    const { data, error } = await supabase
      .from('tasks')
      .update({ 
        title, 
        description, 
        required_skills: Array.isArray(required_skills) ? required_skills : undefined,
        status,
        event_date 
      })
      .eq('id', id)
      .select();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    if (data.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    return res.status(200).json({ task: data[0] });
  } catch (error) {
    console.error('Error updating task:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteTask = async (req, res) => {
  const { id } = req.params;

  try {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateUserRole = async (req, res) => {
  const { userId, role } = req.body;

  if (!userId || !role) {
    return res.status(400).json({ error: 'User ID and role are required' });
  }

  if (role !== 'admin' && role !== 'volunteer') {
    return res.status(400).json({ error: 'Role must be either "admin" or "volunteer"' });
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', userId)
      .select();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    if (data.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json({ user: data[0] });
  } catch (error) {
    console.error('Error updating user role:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateVolunteerStatus = async (req, res) => {
  const { userId } = req.params;
  const { status_volunteer } = req.body;

  if (!status_volunteer || !['open', 'closed'].includes(status_volunteer)) {
    return res.status(400).json({ error: 'Status must be either "open" or "closed"' });
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({ status_volunteer })
      .eq('id', userId)
      .select();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    if (data.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json({ 
      message: `Volunteer status updated to ${status_volunteer}`,
      user: data[0] 
    });
  } catch (error) {
    console.error('Error updating volunteer status:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateProjectStatus = async (req, res) => {
  const { projectId } = req.params;
  const { status_project } = req.body;

  if (!status_project || !['on_going', 'done'].includes(status_project)) {
    return res.status(400).json({ error: 'Status must be either "on_going" or "done"' });
  }

  try {
    const { data, error } = await supabase
      .from('projects')
      .update({ status_project })
      .eq('id', projectId)
      .select();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    if (data.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    return res.status(200).json({ 
      message: `Project status updated to ${status_project}`,
      project: data[0] 
    });
  } catch (error) {
    console.error('Error updating project status:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAllApplications = async (req, res) => {
  try {
    const { data: applications, error } = await supabase
      .from('volunteer_assignments')
      .select(`
        id,
        status,
        match_score,
        match_reason,
        applied_at,
        volunteer_id,
        project_id,
        profiles:volunteer_id (id, name, email, status_volunteer),
        projects:project_id (id, title, description, project_type, status_project)
      `)
      .order('applied_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ applications });
  } catch (error) {
    console.error('Error fetching applications:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateApplicationStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status || !['confirmed', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Status harus "confirmed" atau "rejected"' });
  }

  try {
    const { data: application, error: fetchError } = await supabase
      .from('volunteer_assignments')
      .select('project_id, volunteer_id, status')
      .eq('id', id)
      .single();

    if (fetchError || !application) {
      return res.status(404).json({ error: 'Aplikasi tidak ditemukan' });
    }

    if (application.status === status) {
      return res.status(400).json({ error: `Aplikasi sudah dalam status "${status}"` });
    }

    const { data, error } = await supabase
      .from('volunteer_assignments')
      .update({ status })
      .eq('id', id)
      .select();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    if (status === 'confirmed') {
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('current_volunteers')
        .eq('id', application.project_id)
        .single();

      if (!projectError && project) {
        await supabase
          .from('projects')
          .update({ current_volunteers: project.current_volunteers + 1 })
          .eq('id', application.project_id);
      }
    }

    if (status === 'rejected' && application.status === 'confirmed') {
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('current_volunteers')
        .eq('id', application.project_id)
        .single();

      if (!projectError && project && project.current_volunteers > 0) {
        await supabase
          .from('projects')
          .update({ current_volunteers: project.current_volunteers - 1 })
          .eq('id', application.project_id);
      }
    }

    return res.status(200).json({ 
      message: `Status aplikasi berhasil diubah menjadi "${status}"`,
      application: data[0]
    });
  } catch (error) {
    console.error('Error updating application status:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const runMatchmaking = async (req, res) => {
  const { projectId } = req.params;
  
  try {
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();
      
    if (projectError || !project) {
      return res.status(404).json({ error: 'Proyek tidak ditemukan' });
    }
    
    const { data: volunteers, error: volunteersError } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'volunteer')
      .eq('status_volunteer', 'open');
      
    if (volunteersError) {
      return res.status(500).json({ error: volunteersError.message });
    }
    
    const matches = [];
    
    for (const volunteer of volunteers) {
      let matchScore = 0;
      const matchReasons = [];
      
      if (project.required_skills && Array.isArray(project.required_skills) && 
          volunteer.volunteer_opportunities) {
        
        const volunteerSkills = [];
        Object.entries(volunteer.volunteer_opportunities).forEach(([category, skills]) => {
          Object.entries(skills).forEach(([skill, value]) => {
            if (value === true) {
              volunteerSkills.push(skill.toLowerCase().replace(/_/g, ' '));
            }
          });
        });
        
        project.required_skills.forEach(requiredSkill => {
          const skillLower = requiredSkill.toLowerCase();
          if (volunteerSkills.some(volunteerSkill => 
              volunteerSkill.includes(skillLower) || 
              skillLower.includes(volunteerSkill))) {
            matchScore += 20;
            matchReasons.push(`Memiliki keahlian yang dibutuhkan: ${requiredSkill}`);
          }
        });
      }
      
      if (project.required_languages && Array.isArray(project.required_languages) &&
          volunteer.languages && Array.isArray(volunteer.languages)) {
        
        project.required_languages.forEach(requiredLanguage => {
          if (volunteer.languages.some(lang => 
              lang.toLowerCase() === requiredLanguage.toLowerCase())) {
            matchScore += 20;
            matchReasons.push(`Menguasai bahasa yang dibutuhkan: ${requiredLanguage}`);
          }
        });
      }
      
      if (project.min_experience && volunteer.years_experience) {
        const expLevels = {
          '< 6 months': 1,
          '6 months - 1 year': 2,
          '> 1 year': 3
        };
        
        const projectMinExp = expLevels[project.min_experience] || 0;
        const volunteerExp = expLevels[volunteer.years_experience] || 0;
        
        if (volunteerExp >= projectMinExp) {
          matchScore += 20;
          matchReasons.push(`Memiliki pengalaman yang cukup: ${volunteer.years_experience}`);
        }
      }
      
      if (project.duration && volunteer.preferred_duration) {
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
            
        const volunteerPref = durationLevels[volunteer.preferred_duration] || 0;
        
        if (projectDuration <= volunteerPref) {
          matchScore += 20;
          matchReasons.push(`Durasi proyek sesuai preferensi: ${volunteer.preferred_duration}`);
        }
      }
      
      if (project.project_type && volunteer.groups) {
        if ((project.project_type === 'explorers' && volunteer.groups.explorers) ||
            (project.project_type === 'study_group' && volunteer.groups.study_groups) ||
            (project.project_type.includes('museum') && volunteer.volunteer_opportunities?.museum?.training)) {
          matchScore += 20;
          matchReasons.push(`Tertarik dengan tipe proyek: ${project.project_type}`);
        }
      }
      
      matchScore = Math.min(matchScore, 100);
      
      if (matchScore > 0) {
        matches.push({
          volunteer_id: volunteer.id,
          project_id: project.id,
          match_score: matchScore,
          match_reason: matchReasons.join('; '),
          status: 'recommended'
        });
      }
    }
    
    matches.sort((a, b) => b.match_score - a.match_score);
    
    if (matches.length > 0) {
      const { data: insertedMatches, error: insertError } = await supabase
        .from('volunteer_assignments')
        .upsert(matches, { 
          onConflict: 'volunteer_id,project_id',
          ignoreDuplicates: true 
        })
        .select();
        
      if (insertError) {
        return res.status(500).json({ error: insertError.message });
      }
      
      return res.status(200).json({
        message: `${matches.length} rekomendasi volunteer berhasil dibuat`,
        matches: matches
      });
    } else {
      return res.status(200).json({
        message: 'Tidak ada rekomendasi volunteer yang cocok untuk proyek ini',
        matches: []
      });
    }
  } catch (error) {
    console.error('Error running matchmaking:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const assignVolunteers = async (req, res) => {
  const { projectId } = req.params;
  const { volunteerIds } = req.body;
  
  if (!Array.isArray(volunteerIds) || volunteerIds.length === 0) {
    return res.status(400).json({ error: 'Daftar volunteer_id diperlukan' });
  }
  
  try {
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, max_volunteers, current_volunteers, status_project')
      .eq('id', projectId)
      .single();
      
    if (projectError || !project) {
      return res.status(404).json({ error: 'Proyek tidak ditemukan' });
    }
    
    if (project.status_project === 'done') {
      return res.status(400).json({ error: 'Cannot assign volunteers to a completed project' });
    }
    
    const availableSlots = project.max_volunteers - project.current_volunteers;
    if (availableSlots < volunteerIds.length) {
      return res.status(400).json({ 
        error: `Hanya tersedia ${availableSlots} slot untuk volunteer baru`
      });
    }
    
    const { data: volunteers, error: volunteersError } = await supabase
      .from('profiles')
      .select('id, status_volunteer')
      .in('id', volunteerIds);
      
    if (volunteersError) {
      return res.status(500).json({ error: volunteersError.message });
    }
    
    const closedVolunteers = volunteers.filter(v => v.status_volunteer === 'closed');
    if (closedVolunteers.length > 0) {
      return res.status(400).json({
        error: `${closedVolunteers.length} volunteer(s) have a closed status and cannot be assigned`
      });
    }
    
    const assignments = volunteerIds.map(volunteerId => ({
      volunteer_id: volunteerId,
      project_id: projectId,
      status: 'confirmed',
      match_score: null,
      match_reason: 'Ditugaskan langsung oleh admin'
    }));
    
    const { data, error } = await supabase
      .from('volunteer_assignments')
      .upsert(assignments, {
        onConflict: 'volunteer_id,project_id',
        ignoreDuplicates: false
      })
      .select();
      
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    
    await supabase
      .from('projects')
      .update({ current_volunteers: project.current_volunteers + assignments.length })
      .eq('id', projectId);
    
    return res.status(200).json({
      message: `${assignments.length} volunteer berhasil ditugaskan ke proyek`,
      assignments: data
    });
  } catch (error) {
    console.error('Error assigning volunteers:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
