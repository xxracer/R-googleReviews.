
const PrivateRoute = ({ children }) => {
  // Login is bypassed, always render the protected content.
  return children;
};

export default PrivateRoute;
