/*Page for creating a new quiz*/
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CreateQuiz = () => {
  const navigate = useNavigate(); // Hook for navigation
  const [quizData, setQuizData] = useState({
    title: '',
    questions: [{
      type: 'MCQ',
      text: '',
      correctAnswer: '',
      options: []
    }]
  });

  const addQuestion = () => {
    setQuizData(prevState => ({
      ...prevState,
      questions: [...prevState.questions, {
        type: 'MCQ',
        text: '',
        correctAnswer: '',
        options: []
      }]
    }));
  };

  const handleQuestionChange = (index, field, value) => {
    setQuizData(prevState => {
      const updatedQuestions = [...prevState.questions];
      updatedQuestions[index] = { ...updatedQuestions[index], [field]: value };
      return { ...prevState, questions: updatedQuestions };
    });
  };

  const handleOptionChange = (questionIndex, optionIndex, value) => {
    setQuizData(prevState => {
      const updatedQuestions = [...prevState.questions];
      const updatedOptions = [...updatedQuestions[questionIndex].options];
      updatedOptions[optionIndex] = value;
      updatedQuestions[questionIndex] = { ...updatedQuestions[questionIndex], options: updatedOptions };
      return { ...prevState, questions: updatedQuestions };
    });
  };

  const addOption = (questionIndex) => {
    setQuizData(prevState => {
      const updatedQuestions = [...prevState.questions];
      updatedQuestions[questionIndex] = {
        ...updatedQuestions[questionIndex],
        options: [...updatedQuestions[questionIndex].options, '']
      };
      return { ...prevState, questions: updatedQuestions };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/quizzes', quizData);
      if (response.status === 201) {
        alert('Quiz created successfully!');
        setQuizData({
          title: '',
          questions: [{
            type: 'MCQ',
            text: '',
            correctAnswer: '',
            options: []
          }]
        });
        navigate('/quizzes'); // Redirect to quizzes page
      } else {
        alert('Unexpected response from the server.');
      }
    } catch (error) {
      console.error('Error creating quiz:', error);
      alert(error.response?.data?.message || 'Error creating quiz');
    }
  };

  return (
    <div className="create-quiz-container">
      <h2>Create New Quiz</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Quiz Title:</label>
          <input
            type="text"
            value={quizData.title}
            onChange={(e) => setQuizData(prev => ({ ...prev, title: e.target.value }))}
            required
          />
        </div>

        {quizData.questions.map((question, index) => (
          <div key={index} className="question-card">
            <h3>Question {index + 1}</h3>
            
            <div className="form-group">
              <label>Question Type:</label>
              <select
                value={question.type}
                onChange={(e) => handleQuestionChange(index, 'type', e.target.value)}
              >
                <option value="MCQ">Multiple Choice</option>
                <option value="TrueFalse">True/False</option>
                <option value="ShortAnswer">Short Answer</option>
              </select>
            </div>

            <div className="form-group">
              <label>Question Text:</label>
              <input
                type="text"
                value={question.text}
                onChange={(e) => handleQuestionChange(index, 'text', e.target.value)}
                required
              />
            </div>

            {question.type === 'MCQ' && (
              <div className="form-group">
                <label>Options:</label>
                {question.options.map((option, optionIndex) => (
                  <input
                    key={optionIndex}
                    type="text"
                    value={option}
                    onChange={(e) => handleOptionChange(index, optionIndex, e.target.value)}
                    placeholder={`Option ${optionIndex + 1}`}
                    required
                  />
                ))}
                <button type="button" onClick={() => addOption(index)}>
                  Add Option
                </button>
                <div className="form-group">
                  <label>Correct Answer:</label>
                  <select
                    value={question.correctAnswer}
                    onChange={(e) => handleQuestionChange(index, 'correctAnswer', e.target.value)}
                    disabled={question.options.length === 0} // Prevent empty dropdown
                    required
                  >
                    <option value="">Select Answer</option>
                    {question.options.map((option, optionIndex) => (
                      <option key={optionIndex} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {question.type === 'TrueFalse' && (
              <div className="form-group">
                <label>Correct Answer:</label>
                <select
                  value={question.correctAnswer}
                  onChange={(e) => handleQuestionChange(index, 'correctAnswer', e.target.value)}
                  required
                >
                  <option value="">Select Answer</option>
                  <option value="True">True</option>
                  <option value="False">False</option>
                </select>
              </div>
            )}

            {question.type === 'ShortAnswer' && (
              <div className="form-group">
                <label>Correct Answer:</label>
                <input
                  type="text"
                  value={question.correctAnswer}
                  onChange={(e) => handleQuestionChange(index, 'correctAnswer', e.target.value)}
                  required
                />
              </div>
            )}
          </div>
        ))}

        <button type="button" onClick={addQuestion}>
          Add Question
        </button>
        
        <button type="submit" className="submit-button">
          Create Quiz
        </button>
      </form>
    </div>
  );
};

export default CreateQuiz;
