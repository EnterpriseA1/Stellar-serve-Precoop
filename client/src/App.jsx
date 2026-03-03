import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SignIn from './pages/SignIn';

function App() {
  return (
    <Router>
      <Routes>
        {/* หน้า Login */}
        <Route path="/" element={<SignIn />} />

        {/* หน้า Home ชั่วคราว เอาไว้ทดสอบตอนกดปุ่ม Sign In */}
        <Route
          path="/home"
          element={
            <div className="flex items-center justify-center min-h-screen text-2xl font-bold bg-yellow-50 text-[#1a113d]">
              หน้า Home (กำลังสร้าง...)
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;