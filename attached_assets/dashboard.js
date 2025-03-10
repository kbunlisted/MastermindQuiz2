// src/components/dashboard/Dashboard.js
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
/*
import { useAuth } from '../../contexts/AuthContext';
import { API_URL } from '../../config';
*/
const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    assignedQuizzes: 0,
    completedQuizzes: 0,
    pendingQuizzes: 0,
    createdQuizzes: 0,
    assignedStudents: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (user.role === 'student') {
          // Student stats
          const [assignedRes, attemptsRes] = await Promise.all([
            axios.get(`${API_URL}/api/quizzes?assigned=true`),
            axios.get(`${API_URL}/api/users/me/attempts`)
          ]);
          
          const completedQuizIds = new Set(
            attemptsRes.data.filter(a => a.completedAt).map(a => a.quiz._id)
          );
          
          setStats({
            assignedQuizzes: assignedRes.data.length,
            completedQuizzes: completedQuizIds.size,
            pendingQuizzes: assignedRes.data.length - completedQuizIds.size
          });
        } else if (user.role === 'teacher') {
          // Teacher stats
          const [assignmentsRes] = await Promise.all([
            axios.get(`${API_URL}/api/assignments/created`)
          ]);
          
          const uniqueStudents = new Set();
          const uniqueQuizzes = new Set();
          
          assignmentsRes.data.forEach(assignment => {
            uniqueQuizzes.add(assignment.quiz._id);
            assignment.assignedTo.forEach(student => uniqueStudents.add(student));
          });
          
          setStats({
            assignedQuizzes: uniqueQuizzes.size,
            assignedStudents: uniqueStudents.size
          });
        } else if (user.role === 'admin') {
          // Admin stats
          const [quizzesRes, usersRes] = await Promise.all([
            axios.get(`${API_URL}/api/quizzes`),
            axios.get(`${API_URL}/api/users/count`)
          ]);
          
          setStats({
            createdQuizzes: quizzesRes.data.length,
            totalStudents: usersRes.data.students,
            totalTeachers: usersRes.data.teachers
          });
        }
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, [user]);

  if (loading) return <div className="text-center py-10">Loading dashboard...</div>;
  if (error) return <div className="text-red-500 text-center py-10">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="bg-white rounded shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Welcome, {user.username}!</h2>
        <p className="text-gray-600 mb-4">You are logged in as a {user.role}.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {user.role === 'student' && (
            <>
              <div className="bg-blue-50 p-4 rounded border border-blue-100">
                <h3 className="font-semibold text-blue-700">Assigned Quizzes</h3>
                <p className="text-2xl">{stats.assignedQuizzes}</p>
              </div>
              <div className="bg-green-50 p-4 rounded border border-green-100">
                <h3 className="font-semibold text-green-700">Completed</h3>
                <p className="text-2xl">{stats.completedQuizzes}</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded border border-yellow-100">
                <h3 className="font-semibold text-yellow-700">Pending</h3>
                <p className="text-2xl">{stats.pendingQuizzes}</p>
              </div>
            </>
          )}
          
          {user.role === 'teacher' && (
            <>
              <div className="bg-blue-50 p-4 rounded border border-blue-100">
                <h3 className="font-semibold text-blue-700">Assigned Quizzes</h3>
                <p className="text-2xl">{stats.assignedQuizzes}</p>
              </div>
              <div className="bg-green-50 p-4 rounded border border-green-100">
                <h3 className="font-semibold text-green-700">Students</h3>
                <p className="text-2xl">{stats.assignedStudents}</p>
              </div>
            </>
          )}
          
          {user.role === 'admin' && (
            <>
              <div className="bg-blue-50 p-4 rounded border border-blue-100">
                <h3 className="font-semibold text-blue-700">Created Quizzes</h3>
                <p className="text-2xl">{stats.createdQuizzes}</p>
              </div>
              <div className="bg-green-50 p-4 rounded border border-green-100">
                <h3 className="font-semibold text-green-700">Students</h3>
                <p className="text-2xl">{stats.totalStudents}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded border border-purple-100">
                <h3 className="font-semibold text-purple-700">Teachers</h3>
                <p className="text-2xl">{stats.totalTeachers}</p>
              </div>
            </>
          )}
        </div>
        
        <div className="flex flex-wrap gap-3">
          <Link to="/quizzes" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            View Quizzes
          </Link>
          
          {user.role === 'admin' && (
            <Link to="/quizzes/create" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
              Create New Quiz
            </Link>
          )}
          
          <Link to="/profile" className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
            My Profile
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;