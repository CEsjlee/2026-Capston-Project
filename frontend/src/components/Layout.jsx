import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [userName, setUserName] = useState('학생');

  useEffect(() => {
    const storedName = localStorage.getItem('userName');
    if (storedName) {
      setUserName(storedName);
    } else {
      const token = localStorage.getItem('accessToken');
      if (!token) {
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
          <div style={{ minWidth: 0, overflow: 'hidden' }}>
            <UserName>{userName}님</UserName>
            <UserRole>대학생</UserRole>
          </div>
        </UserInfo>
        
        <Menu>
          <MenuItem $active={isActive('/roadmap')} onClick={() => navigate('/roadmap')}>🗺️ 로드맵</MenuItem>
          <MenuItem $active={isActive('/activity')} onClick={() => navigate('/activity')}>✨ 활동 추천</MenuItem>
          <MenuItem $active={isActive('/collaboration')} onClick={() => navigate('/collaboration')}>👥 협업툴</MenuItem>
          <MenuItem $active={isActive('/portfolio')} onClick={() => navigate('/portfolio')}>📄 포트폴리오</MenuItem>
          <MenuItem $active={isActive('/notes')} onClick={() => navigate('/notes')}>📖 학습 노트</MenuItem>
          <MenuItem $active={isActive('/feedback')} onClick={() => navigate('/feedback')}>📊 피드백</MenuItem>
          <MenuItem $active={isActive('/settings')} onClick={() => navigate('/settings')}>⚙️ 설정</MenuItem>
        </Menu>
      </Sidebar>

      <MainWrapper>
        <Outlet />
      </MainWrapper>
    </Container>
  );
};

export default Layout;

// --- 스타일 컴포넌트 ---
const Container = styled.div` 
  display: flex; 
  width: 100%; /* 100vw 대신 안전한 100% 사용 */
  height: 100vh; 
  background-color: #f8f9fc; 
  overflow: hidden; 
`;

const Sidebar = styled.div` 
  width: 260px; 
  flex-shrink: 0; /* 메뉴바 찌그러짐 절대 방어 */
  background: white; 
  padding: 30px 20px; 
  display: flex; 
  flex-direction: column; 
  border-right: 1px solid #eee; 
  height: 100vh; 
  box-sizing: border-box;
  overflow-y: auto;
`;

const Logo = styled.h1` color: #a855f7; font-size: 18px; margin-bottom: 40px; font-weight: bold; word-break: keep-all; line-height: 1.4; `;
const UserInfo = styled.div` display: flex; align-items: center; gap: 12px; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 1px solid #f0f0f0;`;
const Avatar = styled.div` width: 40px; height: 40px; background: #f3e8ff; color: #a855f7; border-radius: 50%; display: flex; justify-content: center; align-items: center; font-weight: bold; font-size: 16px; flex-shrink: 0; `;
const UserName = styled.div` font-weight: bold; font-size: 15px; color: #333; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; `;
const UserRole = styled.div` font-size: 12px; color: #888; margin-top: 2px; `;
const Menu = styled.div` flex: 1; display: flex; flex-direction: column; gap: 5px; `;

const MenuItem = styled.div` 
  padding: 12px 15px; 
  border-radius: 10px; 
  cursor: pointer; 
  font-size: 14px; 
  font-weight: 600; 
  color: ${props => props.$active ? 'white' : '#666'}; 
  background: ${props => props.$active ? 'linear-gradient(90deg, #a855f7, #d946ef)' : 'transparent'}; 
  white-space: nowrap;
  &:hover { background: ${props => props.$active ? '' : '#f5f5f5'}; } 
`;

const MainWrapper = styled.div`
  flex: 1; /* 남은 화면을 모두 차지 */
  min-width: 0; /* 내부 화면이 폭주해서 메뉴바를 미는 것 방지 (가장 중요) */
  height: 100vh;
  display: flex;
  flex-direction: column;
`;