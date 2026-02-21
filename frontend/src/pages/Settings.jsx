import { useState, useEffect } from 'react';
import styled from 'styled-components';

const Settings = () => {
  const [user, setUser] = useState({
    name: '',
    email: ''
  });

  // 페이지 로드 시 로컬스토리지에서 이름 가져오기
  useEffect(() => {
    const savedName = localStorage.getItem('userName') || '사용자';
    // 이메일은 토큰 안에 있어서 디코딩이 필요하지만, 
    // 편의상 현재는 로컬스토리지나 고정값을 사용하거나 UI에서 제외해도 됩니다.
    // 여기서는 이름만 연동하고 이메일은 placeholder로 둡니다.
    setUser({
      name: savedName,
      email: 'user@tukorea.ac.kr' // 필요 시 백엔드에서 받아온 정보로 대체 가능
    });
  }, []);

  const handleLogout = () => {
    if(window.confirm("정말 로그아웃 하시겠습니까?")) {
      // ★ 중요: 로그인 토큰, 로드맵 임시저장, 결과 등 모든 흔적 삭제
      localStorage.clear(); 
      alert("로그아웃 되었습니다.");
      window.location.href = '/login';
    }
  };

  return (
    <Container>
      <PageHeader>
        <PageTitle>설정</PageTitle>
        <PageSubtitle>내 정보를 확인하고 로그아웃 할 수 있습니다.</PageSubtitle>
      </PageHeader>

      <ContentCard>
        <SectionHeader>
            <TitleIcon>👤</TitleIcon>
            <SectionTitle>내 프로필 정보</SectionTitle>
        </SectionHeader>
        
        <InputGroup>
            <Label>이름</Label>
            <ReadOnlyInput value={user.name} readOnly />
        </InputGroup>

        {/* 이메일 정보가 없으면 이 부분은 주석 처리해도 됩니다 */}
        <InputGroup>
            <Label>학교/이메일</Label>
            <ReadOnlyInput value={user.email} readOnly />
        </InputGroup>

        <Divider />

        <SectionHeader>
            <TitleIcon>🚪</TitleIcon>
            <SectionTitle>계정 관리</SectionTitle>
        </SectionHeader>
        
        <LogoutButton onClick={handleLogout}>
            로그아웃
        </LogoutButton>

      </ContentCard>
    </Container>
  );
};

export default Settings;

// --- 스타일 컴포넌트 ---

const Container = styled.div`
  flex: 1; 
  padding: 40px; 
  overflow-y: auto; 
  height: 100vh; 
  box-sizing: border-box; 
  background-color: #f8f9fc;
  display: flex;
  flex-direction: column;
  align-items: center; 
`;

const PageHeader = styled.div` 
  width: 100%; 
  max-width: 600px; 
  margin-bottom: 30px; 
  text-align: left;
`;
const PageTitle = styled.h2` font-size: 28px; color: #333; font-weight: bold; margin-bottom: 8px; `;
const PageSubtitle = styled.p` font-size: 16px; color: #666; `;

const ContentCard = styled.div`
  width: 100%;
  max-width: 600px;
  background: white;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.05);
  border: 1px solid #eee;
`;

const SectionHeader = styled.div` display: flex; align-items: center; gap: 10px; margin-bottom: 20px; `;
const TitleIcon = styled.span` font-size: 24px; `;
const SectionTitle = styled.h3` font-size: 18px; font-weight: bold; color: #333; margin: 0; `;

const InputGroup = styled.div` display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px; `;
const Label = styled.label` font-size: 14px; color: #666; font-weight: bold; `;
const ReadOnlyInput = styled.input` 
  padding: 16px; 
  background: #f9fafb; 
  border: 1px solid #eee; 
  border-radius: 12px; 
  color: #555; 
  font-size: 15px; 
  outline: none; 
  font-weight: 500;
`;

const Divider = styled.hr` border: none; border-top: 1px solid #f0f0f0; margin: 30px 0; `;

const Description = styled.p` font-size: 14px; color: #888; margin-bottom: 20px; line-height: 1.5; `;

const LogoutButton = styled.button`
  width: 100%; 
  padding: 16px; 
  border-radius: 12px; 
  font-size: 16px; 
  font-weight: bold; 
  border: 1px solid #fee2e2; 
  background: #fef2f2; 
  color: #ef4444; 
  cursor: pointer; 
  transition: all 0.2s;
  
  &:hover { 
    background: #fee2e2; 
    transform: translateY(-2px);
  }
`;