
const GITHUB_API_BASE = 'https://api.github.com';

export const fetchGithubUser = async (username) => {
  if (!username) return null;
  
  try {
    const response = await fetch(`${GITHUB_API_BASE}/users/${username}`);
    if (!response.ok) throw new Error('User not found');
    return await response.json();
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
};

export const fetchUserRepos = async (username, page = 1, perPage = 5) => {
  if (!username) return [];
  
  try {
    const response = await fetch(
      `${GITHUB_API_BASE}/users/${username}/repos?page=${page}&per_page=${perPage}&sort=updated`
    );
    if (!response.ok) throw new Error('Failed to fetch repositories');
    return await response.json();
  } catch (error) {
    console.error('Error fetching repositories:', error);
    throw error;
  }
};