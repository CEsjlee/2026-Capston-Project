import { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import Input from '../components/Input';
import { login } from '../api/auth';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // 토큰(JWT) 해독 함수
  const parseJwt = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (e) {
      return {};
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      alert("이메일과 비밀번호를 입력해주세요.");
      return;
    }

    try {
      const data = await login({ email, password });
      console.log("서버 응답:", data);

      const token = data.accessToken || data.token;

      if (token) {
        // 1. 토큰 저장
        localStorage.setItem('accessToken', token);

        // 2. 사용자 이름 결정 로직
        let finalName = data.userName || data.name;

        // 서버가 이름을 안 줬으면 토큰 해독
        if (!finalName) {
           const decoded = parseJwt(token);
           console.log("토큰 해독 결과:", decoded);
           finalName = decoded.name || decoded.userName || decoded.sub;
        }

        // 그래도 없으면 이메일 앞부분 사용
        if (!finalName) {
            finalName = email.split('@')[0];
        }

        // 이름 저장
        localStorage.setItem('userName', finalName);
        
        // 3. 이동 경로 수정
        alert(`환영합니다, ${finalName}님!`);
        navigate('/roadmap');
        
      } else {
        alert("로그인 실패: 토큰이 없습니다.");
      }

    } catch (error) {
      console.error(error);
      
      // 🔥 백엔드에서 보내준 진짜 에러 메시지 확인 (스프링부트 에러 응답 형태 고려)
      const backendMessage = error.response?.data?.message || error.response?.data || "";

      // 🔥 메시지 내용에 따라 UX에 맞는 커스텀 알림창 띄우기
      if (typeof backendMessage === 'string' && (backendMessage.includes("가입되지 않은") || backendMessage.includes("존재하지 않"))) {
        alert("회원 정보가 없습니다. 회원가입을 진행해주세요.");
      } else if (typeof backendMessage === 'string' && backendMessage.includes("비밀번호")) {
        alert("비밀번호가 일치하지 않습니다. 다시 확인해주세요.");
      } else {
        // 알 수 없는 서버 에러일 경우 기본 메시지
        alert("로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.");
      }
    }
  };

  return (
    <Container>
      <LoginCard>
        <LogoBox>
          <span className="icon">🎓</span>
          <LogoText>대학생 맞춤 진로 도우미</LogoText>
        </LogoBox>
        
        <Header>
          <Title>환영합니다! 👋</Title>
          <Subtitle>계정에 로그인하여 나만의 진로 로드맵을 만들어보세요!</Subtitle>
        </Header>

        <FormArea>
          <InputWrapper>
            <Input 
              label="이메일" 
              placeholder="이메일을 입력하세요" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
            />
            <Input 
              label="비밀번호" 
              type="password" 
              placeholder="비밀번호를 입력하세요" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
            />
          </InputWrapper>

          <LoginButton onClick={handleLogin}>로그인</LoginButton>

          {/* 🔥 추가: 비밀번호 찾기 링크 */}
          <FindPasswordArea>
            <FindPasswordButton onClick={() => navigate('/find-password')}>
              비밀번호를 잊으셨나요?
            </FindPasswordButton>
          </FindPasswordArea>
        </FormArea>

        <Footer>
          계정이 없으신가요? 
          <LinkButton onClick={() => navigate('/signup')}>회원가입</LinkButton>
        </Footer>
      </LoginCard>
    </Container>
  );
};

export default Login;


// --- 💅 스타일 컴포넌트 ---

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Container = styled.div`
  background-color: #f8f9fc;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  box-sizing: border-box;
`;

const LoginCard = styled.div`
  background: white;
  width: 100%;
  max-width: 420px;
  padding: 50px 40px;
  border-radius: 24px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.04);
  border: 1px solid #f1f5f9;
  display: flex;
  flex-direction: column;
  animation: ${fadeInUp} 0.6s ease-out;
  box-sizing: border-box;
`;

const LogoBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 40px;
  .icon { font-size: 28px; }
`;

const LogoText = styled.h1`
  color: #a855f7;
  font-size: 22px;
  font-weight: 900;
  margin: 0;
  letter-spacing: -0.5px;
`;

const Header = styled.div`
  margin-bottom: 30px;
  text-align: left;
`;

const Title = styled.h2`
  font-size: 24px;
  font-weight: 800;
  color: #1e293b;
  margin: 0 0 8px 0;
`;

const Subtitle = styled.p`
  font-size: 14px;
  color: #64748b;
  margin: 0;
`;

const FormArea = styled.div`
  width: 100%;
  margin-bottom: 35px;
`;

const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 25px;
`;

const LoginButton = styled.button`
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #a855f7 0%, #9333ea 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  box-shadow: 0 4px 15px rgba(168, 85, 247, 0.3);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(168, 85, 247, 0.4);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

/* 🔥 추가 스타일 */
const FindPasswordArea = styled.div`
  margin-top: 15px;
  text-align: right;
`;

const FindPasswordButton = styled.span`
  font-size: 13px;
  color: #64748b;
  cursor: pointer;
  transition: 0.2s;

  &:hover {
    color: #a855f7;
    text-decoration: underline;
  }
`;

const Footer = styled.div`
  font-size: 14px;
  color: #64748b;
  text-align: center;
`;

const LinkButton = styled.span`
  color: #a855f7;
  font-weight: 800;
  cursor: pointer;
  margin-left: 8px;
  transition: 0.2s;
  
  &:hover {
    color: #9333ea;
    text-decoration: underline;
  }
`;