import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";

export default function FindPassword() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleCheckUser = async () => {
    setError("");
    setMessage("");

    try {
      const res = await axios.post(
        "http://localhost:8080/api/auth/check-user",
        { name, email }
      );
      setMessage(res.data.message);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.error || "사용자 확인 실패");
    }
  };

  const handleResetPassword = async () => {
    setError("");
    setMessage("");

    try {
      const res = await axios.put(
        "http://localhost:8080/api/auth/reset-password",
        { name, email, newPassword }
      );
      setMessage(res.data.message);

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || "재설정 실패");
    }
  };

  return (
    <Container>
      <Card>
        <Title>비밀번호 찾기</Title>

        {step === 1 && (
          <>
            <Input
              type="text"
              placeholder="가입한 이름 입력"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              type="email"
              placeholder="가입한 이메일 입력"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button onClick={handleCheckUser}>사용자 확인</Button>
          </>
        )}

        {step === 2 && (
          <>
            <Input
              type="password"
              placeholder="새 비밀번호 입력"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <Button onClick={handleResetPassword}>
              비밀번호 재설정
            </Button>
          </>
        )}

        {message && <Message>{message}</Message>}
        {error && <Message error>{error}</Message>}

        <BackButton onClick={() => navigate("/login")}>
          로그인 페이지로 돌아가기
        </BackButton>
      </Card>
    </Container>
  );
}


/* ===============================
   💅 Styled Components (아래 정리)
================================= */

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
`;

const Card = styled.div`
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
`;

const Title = styled.h2`
  font-size: 24px;
  font-weight: 800;
  color: #1e293b;
  margin-bottom: 30px;
`;

const Input = styled.input`
  width: 100%;
  padding: 14px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  font-size: 14px;
  outline: none;
  transition: 0.2s;
  margin-bottom: 15px;

  &:focus {
    border-color: #a855f7;
    box-shadow: 0 0 0 3px rgba(168, 85, 247, 0.15);
  }
`;

const Button = styled.button`
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
  margin-top: 10px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(168, 85, 247, 0.4);
  }
`;

const Message = styled.p`
  font-size: 14px;
  text-align: center;
  margin-top: 15px;
  color: ${(props) => (props.error ? "#ef4444" : "#22c55e")};
`;

const BackButton = styled.span`
  font-size: 13px;
  color: #64748b;
  cursor: pointer;
  margin-top: 20px;
  text-align: center;

  &:hover {
    color: #a855f7;
    text-decoration: underline;
  }
`;