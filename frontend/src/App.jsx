import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Layout from './components/Layout'; 
import Roadmap from './pages/Roadmap';
import Activity from './pages/Activity';
import Collaboration from './pages/Collaboration';
import Portfolio from './pages/Portfolio';
import StudyNote from './pages/StudyNote';
import Feedback from './pages/Feedback';
import Settings from './pages/Settings';
import FindPassword from "./pages/FindPassword";

// [주의] 이제 Onboarding은 Roadmap 페이지 안으로 통합되었으므로 여기서 부를 필요가 없습니다.

function App() {
  return (
    <Routes>
      {/* 초기 접속 시 로그인 페이지로 이동 */}
      <Route path="/" element={<Navigate to="/login" />} />
      
      {/* 독립 페이지 (로그인, 회원가입) */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/find-password" element={<FindPassword />} />
      
      {/* 레이아웃이 적용되는 내부 페이지들 */}
      <Route element={<Layout />}>
        {/* 이제 로그인 성공 후 바로 여기로 옵니다. */}
        <Route path="/roadmap" element={<Roadmap />} />
        
        <Route path="/activity" element={<Activity />} />
        <Route path="/collaboration" element={<Collaboration />} />
        <Route path="/portfolio" element={<Portfolio />} />
        <Route path="/notes" element={<StudyNote />} />
        <Route path="/feedback" element={<Feedback />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      {/* 정의되지 않은 주소로 들어오면 로그인으로 튕겨내기 (선택사항) */}
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default App;