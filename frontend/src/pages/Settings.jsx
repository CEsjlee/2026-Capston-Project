import { useState, useEffect } from 'react';
import styled from 'styled-components';

const Settings = () => {
  const [user, setUser] = useState({
    name: '',
    email: ''
  });

  const parseJwt = (token) => {
    try {
      if (!token) return null;
      
      const base64Url = token.startsWith('Bearer ') 
        ? token.split(' ')[1].split('.')[1] 
        : token.split('.')[1];

      if (!base64Url) return null;

      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));

      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error("토큰 디코딩 실패", e);
      return null;
    }
  };

  useEffect(() => {
    // 1. 이름은 로그인 시 저장한 로컬스토리지 정보 활용
    const savedName = localStorage.getItem('userName') || '사용자';
    
    // 2. 이메일(ID)은 토큰에서 직접 추출
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    let userId = '정보 없음';

    if (token) {
      const decoded = parseJwt(token);
      if (decoded) {
        // sub, email 등 가능한 모든 필드 확인
        userId = decoded.sub || decoded.email || decoded.username || '-';
      }
    }

    setUser({
      name: savedName,
      email: userId
    });
  }, []);

  // 로그아웃
  const handleLogout = () => {
    if(window.confirm("정말 로그아웃 하시겠습니까?")) {
      // 로드맵 정보 등은 DB에 저장되므로, 여기서는 브라우저 세션(토큰 등)만 정리
      localStorage.removeItem('accessToken');
      localStorage.removeItem('token');
      localStorage.removeItem('userName');
      
      alert("로그아웃 되었습니다.");
      window.location.href = '/login';
    }
  };

  return (
    <Container>
      <PageHeader>
        
        <PageTitle>⚙️ 설정</PageTitle>
        <PageSubtitle>개인 정보 확인 및 계정 보안 설정을 관리합니다.</PageSubtitle>
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

        <InputGroup>
          <Label>계정 정보 (이메일)</Label>
          <ReadOnlyInput value={user.email} readOnly />
        </InputGroup>

        <Divider />

        <SectionHeader>
          
          <TitleIcon>🔐</TitleIcon>
          <SectionTitle>로그아웃</SectionTitle>
        </SectionHeader>
        
        <Description>
          로그아웃 시에도 작성하신 로드맵 정보와 데이터는 안전하게 저장됩니다.
        </Description>

        <LogoutButton onClick={handleLogout}>
          로그아웃
        </LogoutButton>
      </ContentCard>
    </Container>
  );
};

export default Settings;

// --- 스타일 컴포넌트 (디자인 통합) ---
const Container = styled.div` flex: 1; padding: 40px; overflow-y: auto; height: 100vh; box-sizing: border-box; background-color: #f8f9fc; display: flex; flex-direction: column; align-items: center; `;
const PageHeader = styled.div` width: 100%; max-width: 600px; margin-bottom: 30px; border-left: 4px solid #a855f7; padding-left: 15px; `;
const PageTitle = styled.h2` font-size: 26px; color: #1e293b; font-weight: 800; margin: 0 0 5px 0; `;
const PageSubtitle = styled.p` font-size: 15px; color: #64748b; margin: 0; `;

const ContentCard = styled.div` width: 100%; max-width: 600px; background: white; border-radius: 20px; padding: 35px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; `;
const SectionHeader = styled.div` display: flex; align-items: center; gap: 10px; margin-bottom: 20px; `;
const TitleIcon = styled.span` font-size: 22px; `;
const SectionTitle = styled.h3` font-size: 17px; font-weight: 800; color: #1e293b; margin: 0; `;

const InputGroup = styled.div` display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px; `;
const Label = styled.label` font-size: 13px; color: #64748b; font-weight: 700; `;
const ReadOnlyInput = styled.input` padding: 14px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; color: #475569; font-size: 15px; outline: none; font-weight: 500; `;

const Divider = styled.hr` border: none; border-top: 1px solid #f1f5f9; margin: 25px 0; `;
const Description = styled.p` font-size: 13px; color: #94a3b8; margin-bottom: 20px; line-height: 1.5; `;

const LogoutButton = styled.button` 
  width: 100%; padding: 14px; border-radius: 10px; font-size: 15px; font-weight: 800; 
  border: 1px solid #fee2e2; background: #fff1f2; color: #ef4444; 
  cursor: pointer; transition: 0.2s; 
  &:hover { background: #fee2e2; transform: translateY(-2px); box-shadow: 0 4px 10px rgba(239, 68, 68, 0.1); } 
`;