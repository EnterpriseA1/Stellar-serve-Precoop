import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Home from './pages/Home';

function App() {
  return (
    <Router>
      <Routes>
        {/* หน้า Login */}
        <Route path="/" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        {/*เรียกใช้ Component Home */}
        <Route path="/home" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;