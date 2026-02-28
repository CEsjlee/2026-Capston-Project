import { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import Input from '../components/Input';
import { signup } from '../api/auth'; // API 함수 불러오기

const Signup = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '' 
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

 
  const handleSignup = async () => {
    // 1. 유효성 검사
    if (!formData.name || !formData.email || !formData.password) {
      alert("모든 정보를 입력해주세요.");
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    // 2. 서버로 데이터 전송
    try {
      // 백엔드가 원하는 데이터만 골라서 보냄 (confirmPassword 제외)
      const requestData = {
        email: formData.email,
        password: formData.password,
        name: formData.name,
        // 추가로 다른 데이터 전송 가능 
      };

      // API 호출 (성공할 때까지 기다림)
      await signup(requestData);

      // 3. 성공 시 처리
      alert("회원가입이 완료되었습니다!\n로그인 해주세요.");
      navigate('/login');

    } catch (error) {
      // 4. 실패 시 에러 처리
      console.error("회원가입 실패:", error);
      
      // 백엔드가 보내준 에러 메시지가 있으면 그걸 보여주고, 없으면 기본 메시지
      const errorMessage = error.response?.data?.message || "회원가입 중 오류가 발생했습니다.";
      alert(`가입 실패: ${errorMessage}`);
    }
  };

  return (
    <Container>
      <SignupWrapper>
        <Logo>🎓 대학생 맞춤 진로 도우미</Logo>
        <Title>회원가입</Title>
        <SubText>회원정보를 입력하세요.</SubText>
        
        <FormArea>
          <Input label="이름" name="name" placeholder="이름을 입력하세요" value={formData.name} onChange={handleChange} />
          <Input label="이메일" name="email" type="email" placeholder="example@email.com" value={formData.email} onChange={handleChange} />
          <Input label="비밀번호" name="password" type="password" placeholder="최소 6자 이상" value={formData.password} onChange={handleChange} />
          <Input label="비밀번호 확인" name="confirmPassword" type="password" placeholder="비밀번호를 다시 입력하세요" value={formData.confirmPassword} onChange={handleChange} />
          
          <SignupButton onClick={handleSignup}>회원가입 완료</SignupButton>
        </FormArea>

        <Footer>
          이미 계정이 있으신가요? <LinkButton onClick={() => navigate('/login')}>로그인하기</LinkButton>
        </Footer>
      </SignupWrapper>
    </Container>
  );
};

export default Signup;

// 스타일 컴포넌트
const Container = styled.div` background-color: white; min-height: 100vh; display: flex; justify-content: center; align-items: center; `;
const SignupWrapper = styled.div` width: 100%; max-width: 400px; padding: 40px 20px; display: flex; flex-direction: column; align-items: center; `;
const Logo = styled.h1` color: #a855f7; font-size: 24px; margin-bottom: 20px; font-weight: bold; `;
const Title = styled.h2` width: 100%; text-align: left; font-size: 20px; margin-bottom: 5px; color: #333; `;
const SubText = styled.p` width: 100%; text-align: left; font-size: 14px; color: #666; margin-bottom: 30px; `;
const FormArea = styled.div` width: 100%; margin-bottom: 30px; `;
const SignupButton = styled.button` width: 100%; padding: 16px; background-color: #a855f7; color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: bold; cursor: pointer; margin-top: 10px; transition: background-color 0.2s; &:hover { background-color: #9333ea; } `;
const Footer = styled.div` font-size: 14px; color: #888; `;
const LinkButton = styled.span` color: #a855f7; font-weight: bold; cursor: pointer; margin-left: 8px; &:hover { text-decoration: underline; } `;