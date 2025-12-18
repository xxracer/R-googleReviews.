import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import './AdminDashboard.css';

const AdminDashboard = () => {
  return (
    <div className="admin-dashboard">
      <div className="admin-sidebar">
        <h2>Admin Panel</h2>
        <ul>
          <li>
            <NavLink to="/admin/homepage" className={({ isActive }) => isActive ? 'active' : ''}>
              Manage Homepage
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin/programs" className={({ isActive }) => isActive ? 'active' : ''}>
              Manage Programs
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin/about" className={({ isActive }) => isActive ? 'active' : ''}>
              Manage About Us
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin/instructors" className={({ isActive }) => isActive ? 'active' : ''}>
              Manage Instructors
            </NavLink>
          </li>
        </ul>
      </div>
      <div className="admin-content">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminDashboard;
