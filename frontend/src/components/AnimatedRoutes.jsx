import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PageTransition from './PageTransition';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import Dashboard from '../pages/Dashboard';

const AnimatedRoutes = () => {
  return (
    <PageTransition>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </PageTransition>
  );
};

export default AnimatedRoutes;