import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // 기본값을 '학생'으로 설정
  const [userName, setUserName] = useState('학생');

  useEffect(() => {
    const storedName = localStorage.getItem('userName');
    
    if (storedName) {
      setUserName(storedName);
    } else {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        // 토큰이 없으면 로그인 페이지로 이동시키는 로직을 추가해도 좋습니다.
        // navigate('/login'); 
      }
    }
  }, []);

  const handleLogout = () => {
    if(window.confirm("로그아웃 하시겠습니까?")) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('userName');
      localStorage.removeItem('hasSetup'); 
      localStorage.removeItem('authData');
      
      alert("로그아웃 되었습니다.");
      navigate('/login');
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <Container>
      <Sidebar>
        <Logo>🎓 대학생 맞춤 진로 도우미</Logo>
        <UserInfo>
          <Avatar>{userName.charAt(0)}</Avatar>
          <div>
            <UserName>{userName}님</UserName>
            <UserRole>대학생</UserRole>
          </div>
        </UserInfo>
        
        <Menu>
          {/* ✅ 수정 포인트 1: active -> $active 로 변경 */}
          <MenuItem $active={isActive('/roadmap')} onClick={() => navigate('/roadmap')}>🗺️ 로드맵</MenuItem>
          <MenuItem $active={isActive('/activity')} onClick={() => navigate('/activity')}>✨ 활동 추천</MenuItem>
          <MenuItem $active={isActive('/collaboration')} onClick={() => navigate('/collaboration')}>👥 협업툴</MenuItem>
          <MenuItem $active={isActive('/portfolio')} onClick={() => navigate('/portfolio')}>📄 포트폴리오</MenuItem>
          <MenuItem $active={isActive('/note')} onClick={() => navigate('/note')}>📖 학습 노트</MenuItem>
          <MenuItem $active={isActive('/feedback')} onClick={() => navigate('/feedback')}>💬 피드백</MenuItem>
        </Menu>
        
        <SettingItem onClick={() => navigate('/settings')}>⚙️ 설정</SettingItem>
        {/* 로그아웃 버튼이 필요하다면 아래에 추가 가능 */}
        {/* <SettingItem onClick={handleLogout}>로그아웃</SettingItem> */}
      </Sidebar>

      <Outlet />
    </Container>
  );
};

export default Layout;

// --- 스타일 컴포넌트 ---
const Container = styled.div` display: flex; min-height: 100vh; background-color: #f8f9fc; `;
const Sidebar = styled.div` width: 260px; background: white; padding: 30px 20px; display: flex; flex-direction: column; border-right: 1px solid #eee; height: 100vh; position: sticky; top: 0; `;
const Logo = styled.h1` color: #a855f7; font-size: 20px; margin-bottom: 40px; font-weight: bold; `;
const UserInfo = styled.div` display: flex; align-items: center; gap: 12px; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 1px solid #f0f0f0;`;
const Avatar = styled.div` width: 40px; height: 40px; background: #f3e8ff; color: #a855f7; border-radius: 50%; display: flex; justify-content: center; align-items: center; font-weight: bold; font-size: 16px; `;
const UserName = styled.div` font-weight: bold; font-size: 16px; color: #333; `;
const UserRole = styled.div` font-size: 12px; color: #888; margin-top: 2px; `;
const Menu = styled.div` flex: 1; display: flex; flex-direction: column; gap: 5px; `;

// ✅ 수정 포인트 2: props.active -> props.$active 로 변경
const MenuItem = styled.div` 
  padding: 12px 15px; 
  border-radius: 10px; 
  cursor: pointer; 
  font-size: 15px; 
  font-weight: 500; 
  color: ${props => props.$active ? 'white' : '#666'}; 
  background: ${props => props.$active ? 'linear-gradient(90deg, #a855f7, #d946ef)' : 'transparent'}; 
  &:hover { 
    background: ${props => props.$active ? '' : '#f5f5f5'}; 
  } 
`;

const SettingItem = styled(MenuItem)` color: #888; margin-top: auto; `;