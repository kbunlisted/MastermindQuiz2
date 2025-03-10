import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Leaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await axios.get('/api/leaderboard');
        setLeaderboardData(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  if (loading) return <div>Loading leaderboard...</div>;
  if (error) return <div>Error loading leaderboard: {error}</div>;

  return (
    <div className="content-section">
      <h2>Leaderboard</h2>
      {leaderboardData.map((quiz) => (
        <div key={quiz._id} className="quiz-leaderboard">
          <h3>{quiz.quizTitle}</h3>
          <div className="leaderboard-list">
            {quiz.results.map((result, index) => (
              <div key={result._id} className="leaderboard-item">
                <span className="rank">{index + 1}.</span>
                <span className="name">{result.userName}</span>
                <span className="score">{result.score}%</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Leaderboard;