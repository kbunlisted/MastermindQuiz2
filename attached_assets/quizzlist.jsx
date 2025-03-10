import React, { useState, useEffect } from 'react';
import axios from 'axios';

const QuizzesList = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/quizzes'); // Update with your backend URL
        setQuizzes(response.data);
      } catch (err) {
        setError('Failed to load quizzes. Try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  if (loading) return <p>Loading quizzes...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="quiz-list-container">
      <h2>Available Quizzes</h2>
      {quizzes.length === 0 ? (
        <p>No quizzes found.</p>
      ) : (
        <ul className="quiz-list">
          {quizzes.map((quiz) => (
            <li key={quiz._id} className="quiz-card">
              <h3>{quiz.title}</h3>
              <p>{quiz.questions.length} Questions</p>
              <button onClick={() => alert(`Start quiz: ${quiz.title}`)}>Take Quiz</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default QuizzesList;
