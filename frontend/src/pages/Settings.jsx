import { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import api from '../api/axios'; 

const slideUp = keyframes` from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } `;

const Settings = () => {
  const [user, setUser] = useState({ name: '', email: '', initial: '' });
  
  // 비밀번호 변경 모달 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' });

  const parseJwt = (token) => {
    try {
      if (!token) return null;
      const base64Url = token.startsWith('Bearer ') ? token.split(' ')[1].split('.')[1] : token.split('.')[1];
      if (!base64Url) return null;
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (e) { return null; }
  };

  useEffect(() => {
    const savedName = localStorage.getItem('userName') || '사용자';
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    let userId = '정보 없음';

    if (token) {
      const decoded = parseJwt(token);
      if (decoded) userId = decoded.sub || decoded.email || decoded.username || '-';
    }

    setUser({ name: savedName, email: userId, initial: savedName.substring(0, 1) });
  }, []);

  // 💡 [수정] 비밀번호 변경 로직 (직접 입력)
  const handleChangePassword = async () => {
    if (!passwords.currentPassword || !passwords.newPassword) {
      return alert("비밀번호를 모두 입력해주세요.");
    }
    try {
      const response = await api.put('/api/auth/change-password', passwords);
      alert(response.data.message || "비밀번호가 성공적으로 변경되었습니다. 다시 로그인 해주세요.");
      setIsModalOpen(false);
      
      // 비밀번호가 바뀌었으므로 강제 로그아웃
      localStorage.clear();
      window.location.href = '/login';
    } catch (error) {
      alert(error.response?.data?.error || "비밀번호 변경 중 오류가 발생했습니다.");
    }
  };

  const handleLogout = () => {
    if(window.confirm("정말 로그아웃 하시겠습니까?")) {
      localStorage.clear();
      alert("로그아웃 되었습니다.");
      window.location.href = '/login';
    }
  };

  const handleWithdrawal = async () => {
    if(window.confirm("정말 탈퇴하시겠습니까?\n계정을 삭제하면 모든 정보가 영구적으로 삭제되며 복구할 수 없습니다.")) {
      try {
        await api.delete('/api/auth/withdrawal');
        localStorage.clear();
        alert("회원 탈퇴가 완료되었습니다. 그동안 이용해 주셔서 감사합니다.");
        window.location.href = '/login';
      } catch (error) {
        alert(error.response?.data?.error || "탈퇴 처리 중 오류가 발생했습니다.");
      }
    }
  };

  return (
    <Container>
      <InnerWrap>
        <PageHeader>
          <PageTitle>⚙️ 설정</PageTitle>
          <PageSubtitle>계정 정보 및 보안 관리</PageSubtitle>
        </PageHeader>

        <ContentCard>
          <SectionHeader><SectionTitle>내 프로필 정보</SectionTitle></SectionHeader>
          <ProfileWrap>
            <Avatar>{user.initial}</Avatar>
            <ProfileInfo>
              <InputGroup><Label>이름</Label><ReadOnlyInput value={user.name} readOnly /></InputGroup>
              <InputGroup><Label>계정 (이메일)</Label><ReadOnlyInput value={user.email} readOnly /></InputGroup>
            </ProfileInfo>
          </ProfileWrap>
        </ContentCard>

        <ContentCard className="account-zone">
          <SectionHeader><SectionTitle>계정 보안 관리</SectionTitle></SectionHeader>
          
          <ActionRow>
            <div className="text-area">
              <h4>비밀번호 변경</h4>
              <p>주기적으로 비밀번호를 변경하여 계정을 안전하게 보호하세요.</p>
            </div>
            <ActionButton onClick={() => setIsModalOpen(true)}>변경하기</ActionButton>
          </ActionRow>
          <Divider />
          <ActionRow>
            <div className="text-area">
              <h4>로그아웃</h4>
              <p>현재 기기에서 계정 로그아웃을 진행합니다.</p>
            </div>
            <ActionButton onClick={handleLogout}>로그아웃</ActionButton>
          </ActionRow>
          <Divider />
          <ActionRow>
            <div className="text-area">
              <h4 style={{color: '#ef4444'}}>회원 탈퇴</h4>
              <p>서비스를 더 이상 이용하지 않는 경우 계정을 영구 삭제합니다.</p>
            </div>
            <ActionButton className="delete" onClick={handleWithdrawal}>탈퇴하기</ActionButton>
          </ActionRow>
        </ContentCard>

        {/* 비밀번호 변경 모달 */}
        {isModalOpen && (
          <ModalOverlay onClick={() => setIsModalOpen(false)}>
            <ModalContent onClick={e => e.stopPropagation()}>
              <CloseButton onClick={() => setIsModalOpen(false)}>&times;</CloseButton>
              <ModalHeader><ModalTitle>비밀번호 변경</ModalTitle></ModalHeader>
              
              <InputGroup style={{marginBottom: '20px'}}>
                <Label>현재 비밀번호</Label>
                <ModalInput 
                  type="password" placeholder="현재 비밀번호를 입력하세요" 
                  value={passwords.currentPassword} 
                  onChange={e => setPasswords({...passwords, currentPassword: e.target.value})} 
                />
              </InputGroup>
              
              <InputGroup style={{marginBottom: '30px'}}>
                <Label>새 비밀번호</Label>
                <ModalInput 
                  type="password" placeholder="새로운 비밀번호를 입력하세요" 
                  value={passwords.newPassword} 
                  onChange={e => setPasswords({...passwords, newPassword: e.target.value})} 
                />
              </InputGroup>

              <ConfirmButton onClick={handleChangePassword}>비밀번호 변경 완료</ConfirmButton>
            </ModalContent>
          </ModalOverlay>
        )}

        <FooterSpacer />
      </InnerWrap>
    </Container>
  );
};

export default Settings;

// --- 스타일 컴포넌트 ---
const Container = styled.div` flex: 1; padding: 40px; overflow-y: auto; height: 100vh; box-sizing: border-box; background-color: #f8f9fc; display: flex; justify-content: center; `;
const InnerWrap = styled.div` width: 100%; max-width: 650px; display: flex; flex-direction: column; gap: 25px; `;
const PageHeader = styled.div` margin-bottom: 10px; border-left: 5px solid #a855f7; padding-left: 15px; `;
const PageTitle = styled.h2` font-size: 26px; color: #1e293b; font-weight: 800; margin: 0 0 8px 0; `;
const PageSubtitle = styled.p` font-size: 15px; color: #64748b; margin: 0; `;
const ContentCard = styled.div` background: white; border-radius: 20px; padding: 35px; box-shadow: 0 4px 20px rgba(0,0,0,0.03); border: 1px solid #e2e8f0; &.account-zone { border: 1px solid #f1f5f9; } `;
const SectionHeader = styled.div` margin-bottom: 25px; border-bottom: 2px solid #f1f5f9; padding-bottom: 15px; `;
const SectionTitle = styled.h3` font-size: 18px; font-weight: 800; color: #1e293b; margin: 0; `;
const ProfileWrap = styled.div` display: flex; gap: 30px; align-items: flex-start; @media (max-width: 500px) { flex-direction: column; align-items: center; } `;
const Avatar = styled.div` width: 90px; height: 90px; border-radius: 50%; background: linear-gradient(135deg, #a855f7 0%, #9333ea 100%); color: white; display: flex; justify-content: center; align-items: center; font-size: 36px; font-weight: 900; box-shadow: 0 10px 20px rgba(168, 85, 247, 0.2); flex-shrink: 0; `;
const ProfileInfo = styled.div` flex: 1; width: 100%; display: flex; flex-direction: column; gap: 15px; `;
const InputGroup = styled.div` display: flex; flex-direction: column; gap: 8px; `;
const Label = styled.label` font-size: 13px; color: #64748b; font-weight: 700; `;
const ReadOnlyInput = styled.input` width: 100%; padding: 14px 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; color: #334155; font-size: 15px; outline: none; font-weight: 600; box-sizing: border-box; cursor: default; `;
const Divider = styled.hr` border: none; border-top: 1px solid #f1f5f9; margin: 20px 0; `;
const ActionRow = styled.div` display: flex; justify-content: space-between; align-items: center; gap: 20px; .text-area { flex: 1; h4 { margin: 0 0 6px 0; font-size: 15px; color: #1e293b; font-weight: 700; } p { margin: 0; font-size: 13px; color: #64748b; line-height: 1.4; word-break: keep-all; } } `;
const ActionButton = styled.button` padding: 10px 18px; border-radius: 10px; font-size: 13px; font-weight: 800; cursor: pointer; transition: 0.2s; white-space: nowrap; flex-shrink: 0; background: white; border: 1px solid #cbd5e1; color: #475569; &:hover { background: #f8fafc; border-color: #94a3b8; } &.delete { background: #fff1f2; border: 1px solid #fecdd3; color: #ef4444; } &.delete:hover { background: #fee2e2; border-color: #fda4af; } `;
const FooterSpacer = styled.div` height: 60px; `;

/* 모달 스타일 */
const ModalOverlay = styled.div` position: fixed; inset: 0; background: rgba(15, 23, 42, 0.6); display: flex; align-items: center; justify-content: center; z-index: 9999; backdrop-filter: blur(4px); `;
const ModalContent = styled.div` background: white; width: 90%; max-width: 400px; padding: 30px; border-radius: 20px; position: relative; box-shadow: 0 20px 40px rgba(0,0,0,0.2); animation: ${slideUp} 0.3s ease-out; `;
const CloseButton = styled.button` position: absolute; top: 20px; right: 20px; background: none; border: none; font-size: 24px; cursor: pointer; color: #94a3b8; transition: 0.2s; &:hover { color: #0f172a; } `;
const ModalHeader = styled.div` margin-bottom: 25px; `;
const ModalTitle = styled.h3` font-size: 20px; margin: 0; color: #1e293b; font-weight: 800; `;
const ModalInput = styled.input` width: 100%; padding: 14px; border: 1px solid #cbd5e1; border-radius: 12px; font-size: 15px; outline: none; box-sizing: border-box; &:focus { border-color: #a855f7; box-shadow: 0 0 0 3px rgba(168,85,247,0.1); } `;
const ConfirmButton = styled.button` width: 100%; padding: 15px; background: #a855f7; color: white; border: none; border-radius: 12px; font-size: 15px; font-weight: 800; cursor: pointer; transition: 0.2s; &:hover { background: #9333ea; transform: translateY(-2px); } `;