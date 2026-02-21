import { useState } from 'react';
import styled from 'styled-components';
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
        // 별도의 온보딩 페이지 없이, 모든 입력과 결과를 담당하는 로드맵 페이지로 바로 이동합니다.
        alert(`환영합니다, ${finalName}님!`);
        navigate('/roadmap');
        
      } else {
        alert("로그인 실패: 토큰이 없습니다.");
      }

    } catch (error) {
      console.error(error);
      const errorMsg = error.response?.data?.message || "로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.";
      alert(errorMsg);
    }
  };

  return (
    <Container>
      <LoginWrapper>
        <Logo>🎓 대학생 맞춤 진로 도우미</Logo>
        <Title>로그인</Title>
        <FormArea>
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
          <LoginButton onClick={handleLogin}>로그인</LoginButton>
        </FormArea>
        <Footer>
          계정이 없으신가요? 
          <LinkButton onClick={() => navigate('/signup')}>회원가입</LinkButton>
        </Footer>
      </LoginWrapper>
    </Container>
  );
};

export default Login;

// --- 스타일 컴포넌트 ---
const Container = styled.div`
  background-color: white;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const LoginWrapper = styled.div`
  width: 100%;
  max-width: 400px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Logo = styled.h1`
  color: #a855f7;
  font-size: 24px;
  margin-bottom: 40px;
  font-weight: bold;
`;

const Title = styled.h2`
  width: 100%;
  text-align: left;
  font-size: 20px;
  margin-bottom: 20px;
  color: #333;
`;

const FormArea = styled.div`
  width: 100%;
  margin-bottom: 30px;
`;

const LoginButton = styled.button`
  width: 100%;
  padding: 16px;
  background-color: #a855f7;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  margin-top: 10px;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #9333ea;
  }
`;

const Footer = styled.div`
  font-size: 14px;
  color: #888;
`;

const LinkButton = styled.span`
  color: #a855f7;
  font-weight: bold;
  cursor: pointer;
  margin-left: 8px;
  
  &:hover {
    text-decoration: underline;
  }
`;