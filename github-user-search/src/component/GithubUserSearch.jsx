import React, { useState, useEffect, useCallback } from 'react';
import { debounce } from 'lodash';
import { Search, Star, Folder, Users, MapPin, Link2, GitFork } from 'lucide-react';

const GithubUserSearch = () => {
  const [username, setUsername] = useState('');
  const [userData, setUserData] = useState(null);
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const perPage = 6;

  const fetchGithubUser = async (username) => {
    const response = await fetch(`https://api.github.com/users/${username}`);
    if (!response.ok) throw new Error('User not found');
    return response.json();
  };

  const fetchUserRepos = async (username, page) => {
    const response = await fetch(
      `https://api.github.com/users/${username}/repos?page=${page}&per_page=${perPage}&sort=updated`
    );
    if (!response.ok) throw new Error('Failed to fetch repositories');
    return response.json();
  };

  const debouncedFetch = useCallback(
    debounce(async (searchTerm) => {
      if (!searchTerm) {
        setUserData(null);
        setRepos([]);
        setError('');
        return;
      }

      setLoading(true);
      setError('');

      try {
        const user = await fetchGithubUser(searchTerm);
        setUserData(user);
        const repositories = await fetchUserRepos(searchTerm, 1);
        setRepos(repositories);
        setHasMore(repositories.length === perPage);
        setPage(1);
      } catch (err) {
        setError('User not found');
        setUserData(null);
        setRepos([]);
      } finally {
        setLoading(false);
      }
    }, 500),
    []
  );

  useEffect(() => {
    debouncedFetch(username);
    return () => debouncedFetch.cancel();
  }, [username, debouncedFetch]);

  const loadMoreRepos = async () => {
    try {
      const nextPage = page + 1;
      const newRepos = await fetchUserRepos(username, nextPage);
      setRepos([...repos, ...newRepos]);
      setHasMore(newRepos.length === perPage);
      setPage(nextPage);
    } catch (err) {
      setError('Failed to load more repositories');
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          GitHub User Search
        </h1>
        <div className="relative max-w-2xl mx-auto">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Search GitHub username..."
            className="w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-lg"
          />
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {userData && (
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8 transition-all duration-300 hover:shadow-xl">
          <div className="flex flex-col md:flex-row md:items-start gap-6">
            <img
              src={userData.avatar_url}
              alt={`${userData.login}'s avatar`}
              className="w-32 h-32 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300"
            />
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                <h2 className="text-2xl font-bold text-gray-800">
                  {userData.name || userData.login}
                </h2>
                <a
                  href={userData.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors duration-300 text-sm"
                >
                  <Link2 size={16} className="mr-2" />
                  View Profile
                </a>
              </div>
              <p className="text-gray-600 mb-4">{userData.bio || 'No bio available'}</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {userData.location && (
                  <div className="flex items-center text-gray-600">
                    <MapPin size={16} className="mr-2" />
                    {userData.location}
                  </div>
                )}
                <div className="flex items-center text-gray-600">
                  <Users size={16} className="mr-2" />
                  {userData.followers} followers
                </div>
                <div className="flex items-center text-gray-600">
                  <Folder size={16} className="mr-2" />
                  {userData.public_repos} repositories
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {repos.length > 0 && (
        <div>
          <h3 className="text-xl font-bold mb-6 text-gray-800">Repositories</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {repos.map((repo) => (
              <div 
                key={repo.id} 
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all duration-300"
              >
                <h4 className="font-bold text-lg mb-2 text-gray-800">
                  <a
                    href={repo.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-blue-500 transition-colors duration-300"
                  >
                    {repo.name}
                  </a>
                </h4>
                <p className="text-gray-600 mb-4 text-sm min-h-[3rem]">
                  {repo.description || 'No description available'}
                </p>
                <div className="flex items-center space-x-6">
                  <div className="flex items-center text-gray-600 text-sm">
                    <Star size={16} className="mr-1" />
                    {repo.stargazers_count}
                  </div>
                  {repo.language && (
                    <div className="flex items-center text-gray-600 text-sm">
                      <span className="w-3 h-3 rounded-full bg-blue-500 mr-1"></span>
                      {repo.language}
                    </div>
                  )}
                  <div className="flex items-center text-gray-600 text-sm">
                    <GitFork size={16} className="mr-1" />
                    {repo.forks_count}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {hasMore && (
            <div className="flex justify-center mt-8">
              <button
                onClick={loadMoreRepos}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-300 flex items-center space-x-2"
              >
                Load More Repositories
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GithubUserSearch;