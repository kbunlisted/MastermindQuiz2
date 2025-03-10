import React, { useState } from 'react';
import { Link } from "react-router-dom";


const Sidebar = ({ selectedFunction, setSelectedFunction, userRole }) => {
  return (
    <div className="sidebar">
      <h1 className="title">MasterMindQuiz</h1>
      <nav>
        <ul>
          <li>
            <Link
              to="./quizzes/pages/createquiz.jsx"
              className={selectedFunction === "create-quiz" ? "active" : ""}
              onClick={() => setSelectedFunction("create-quiz")}
            >
              Create Quiz
            </Link>
          </li>
          <li>
            <Link
              to="./quizzes/pages/takequiz.jsx"
              className={selectedFunction === "take-quiz" ? "active" : ""}
              onClick={() => setSelectedFunction("take-quiz")}
            >
              Take Quiz
            </Link>
          </li>
          <li>
            <Link
              to="./quizzes/components/Leaderboard.jsx"
              className={selectedFunction === "leaderboard" ? "active" : ""}
              onClick={() => setSelectedFunction("leaderboard")}
            >
              Leaderboard
            </Link>
          </li>
          <li>
            <Link
              to="./quizzes/components/performanceanalytics.jsx"
              className={selectedFunction === "performance" ? "active" : ""}
              onClick={() => setSelectedFunction("performance")}
            >
              Performance Analytics
            </Link>
          </li>
          {userRole === "admin" && (
            <li>
              <Link
                to="/createquiz"
                className={selectedFunction === "create-quiz" ? "active" : ""}
                onClick={() => setSelectedFunction("create-quiz")}
              >
                Create Quiz
              </Link>
            </li>
          )}
          <li>
            <Link to="/logout">Logout</Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
