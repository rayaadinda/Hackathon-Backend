import { supabase } from '../config/supabaseClient.js';

export const getAllTasks = async (req, res) => {
  try {
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('*')
      .order('event_date', { ascending: true });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ tasks });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getActiveTasks = async (req, res) => {
  try {
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('status', 'open')
      .order('event_date', { ascending: true });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ tasks });
  } catch (error) {
    console.error('Error fetching active tasks:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getTaskById = async (req, res) => {
  const { id } = req.params;

  try {
    const { data: task, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return res.status(404).json({ error: 'Task not found' });
    }

    return res.status(200).json({ task });
  } catch (error) {
    console.error('Error fetching task:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const applyForTask = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .single();

    if (taskError || !task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (task.status === 'closed') {
      return res.status(400).json({ error: 'This task is no longer accepting applications' });
    }

    const { data: existingApplication, error: applicationError } = await supabase
      .from('task_applications')
      .select('*')
      .eq('task_id', id)
      .eq('volunteer_id', userId)
      .single();

    if (existingApplication) {
      return res.status(400).json({ 
        error: 'You have already applied for this task',
        status: existingApplication.status
      });
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    if (profile.status_volunteer === 'closed') {
      return res.status(400).json({ error: 'Your volunteer status is currently closed for new tasks' });
    }

    let matchScore = 0;
    const matchReasons = [];

    if (task.required_skills && Array.isArray(task.required_skills) && 
        profile.volunteer_opportunities) {
      
      const userSkills = [];
      Object.entries(profile.volunteer_opportunities).forEach(([category, skills]) => {
        Object.entries(skills).forEach(([skill, value]) => {
          if (value === true) {
            userSkills.push(skill.toLowerCase().replace(/_/g, ' '));
          }
        });
      });
      
      task.required_skills.forEach(skill => {
        const skillLower = skill.toLowerCase();
        if (userSkills.some(userSkill => userSkill.includes(skillLower) || skillLower.includes(userSkill))) {
          matchScore += 25;
          matchReasons.push(`Has required skill: ${skill}`);
        }
      });
    }

    matchScore = Math.min(matchScore, 100);

    const { data: application, error } = await supabase
      .from('task_applications')
      .insert([
        {
          task_id: id,
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
      message: 'Application successful', 
      application: application[0] 
    });
  } catch (error) {
    console.error('Error applying for task:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getRecommendedTasks = async (req, res) => {
  const userId = req.user.id;

  try {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    if (profile.status_volunteer === 'closed') {
      return res.status(400).json({ error: 'Your volunteer status is currently closed for new recommendations' });
    }

    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('*')
      .eq('status', 'open')
      .gt('event_date', new Date().toISOString())
      .order('event_date', { ascending: true });

    if (tasksError) {
      return res.status(500).json({ error: tasksError.message });
    }

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

    const recommendedTasks = tasks.map(task => {
      let matchScore = 0;
      const matchReasons = [];

      if (task.required_skills && Array.isArray(task.required_skills)) {
        task.required_skills.forEach(skill => {
          const skillLower = skill.toLowerCase();
          if (userSkills.some(userSkill => userSkill.includes(skillLower) || skillLower.includes(userSkill))) {
            matchScore += 25;
            matchReasons.push(`Has required skill: ${skill}`);
          }
        });
      }

      matchScore = Math.min(matchScore, 100);

      return {
        ...task,
        match_score: matchScore,
        match_reasons: matchReasons
      };
    });

    recommendedTasks.sort((a, b) => b.match_score - a.match_score);

    return res.status(200).json({ 
      recommended_tasks: recommendedTasks.filter(task => task.match_score > 0)
    });
  } catch (error) {
    console.error('Error getting recommended tasks:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
