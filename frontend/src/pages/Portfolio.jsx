import { useState } from 'react';
import styled from 'styled-components';

const Portfolio = () => {
  // AI 가이드 박스 표시 여부
  const [showGuide, setShowGuide] = useState(true);

  // 섹션 데이터
  const sections = [
    { id: 'intro', title: '자기소개' },
    { id: 'stack', title: '기술 스택' },
    { id: 'projects', title: '프로젝트 경험' },
    { id: 'activities', title: '활동 및 수상' },
  ];

  const handleAiSuggest = (section) => {
    alert(`🤖 AI가 '${section}' 내용을 작성 중입니다...\n(잠시 후 초안이 생성됩니다)`);
  };

  return (
    <Container>
      {/* 1. 헤더 영역 */}
      <Header>
        <div>
          <PageTitle>포트폴리오</PageTitle>
          <PageSubtitle>AI 가이드를 참고하여 나만의 포트폴리오를 작성하세요</PageSubtitle>
        </div>
        <HeaderButtons>
          <WhiteButton>👁️ 미리보기</WhiteButton>
          <PurpleButton>📥 PDF 다운로드</PurpleButton>
        </HeaderButtons>
      </Header>

      {/* 2. AI 가이드 박스 (닫기 가능) */}
      {showGuide && (
        <AiGuideBox>
          <GuideHeader>
            <GuideTitle>✨ 💡 AI 포트폴리오 가이드</GuideTitle>
            <CloseButton onClick={() => setShowGuide(false)}>✕</CloseButton>
          </GuideHeader>
          <GuideText>
            AI가 당신의 프로필 정보를 바탕으로 포트폴리오 구조와 예시를 제안했습니다. 각 섹션의 "AI 제안 적용" 버튼을 클릭하여 기본 내용을 불러온 후, 자유롭게 수정하여 나만의 포트폴리오를 완성하세요.
          </GuideText>
          <TipBox>
            <strong>📝 작성 팁:</strong>
            <ul>
              <li>구체적인 수치와 성과를 포함하세요</li>
              <li>사용한 기술 스택을 명확히 작성하세요</li>
              <li>프로젝트에서 맡은 역할과 기여도를 강조하세요</li>
              <li>문제 해결 과정과 결과를 함께 작성하세요</li>
            </ul>
          </TipBox>
        </AiGuideBox>
      )}

      {/* 3. 섹션 리스트 */}
      <SectionList>
        {sections.map((section) => (
          <SectionCard key={section.id}>
            <SectionHeader>
              <SectionTitle>{section.title}</SectionTitle>
              <ButtonGroup>
                <AiButtonSmall onClick={() => handleAiSuggest(section.title)}>✨ AI 제안 적용</AiButtonSmall>
                <EditButton>📝 수정</EditButton>
              </ButtonGroup>
            </SectionHeader>
            
            {/* 빈 상태 (Empty State) 표시 */}
            <EmptyContentArea>
              <EmptyIcon>📄</EmptyIcon>
              <EmptyText>아직 작성된 내용이 없습니다</EmptyText>
              <AiButtonLarge onClick={() => handleAiSuggest(section.title)}>
                ✨ AI 제안 적용하기
              </AiButtonLarge>
              <SubText>또는 직접 작성하려면 "수정" 버튼을 클릭하세요</SubText>
            </EmptyContentArea>
          </SectionCard>
        ))}
      </SectionList>

      {/* 4. 하단 버튼 및 저장 알림 */}
      <AddSectionButton>+ 새 섹션 추가</AddSectionButton>

      <AutoSaveBar>
        💾 작성한 내용은 자동으로 저장됩니다. 언제든 다시 돌아와서 수정할 수 있습니다.
      </AutoSaveBar>

      <FooterSpacer />
    </Container>
  );
};

export default Portfolio;

// 스타일 컴포넌트

const Container = styled.div`
  flex: 1;
  padding: 40px;
  overflow-y: auto;
  height: 100vh;
  box-sizing: border-box;
  background-color: #f8f9fc; /* 전체 배경색 */
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 30px;
`;
const PageTitle = styled.h2`
  font-size: 28px;
  color: #333;
  font-weight: bold;
  margin-bottom: 8px;
`;
const PageSubtitle = styled.p`
  font-size: 16px;
  color: #666;
`;
const HeaderButtons = styled.div`
  display: flex;
  gap: 10px;
`;
const WhiteButton = styled.button`
  background: white;
  border: 1px solid #ddd;
  padding: 10px 16px;
  border-radius: 8px;
  font-weight: bold;
  color: #555;
  cursor: pointer;
  &:hover { background: #f9fafb; }
`;
const PurpleButton = styled.button`
  background: #a855f7;
  border: none;
  padding: 10px 16px;
  border-radius: 8px;
  font-weight: bold;
  color: white;
  cursor: pointer;
  &:hover { background: #9333ea; }
`;

const AiGuideBox = styled.div`
  background: #fdf4ff;
  border: 1px solid #f0abfc;
  border-radius: 16px;
  padding: 25px;
  margin-bottom: 40px;
  position: relative;
`;
const GuideHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
`;
const GuideTitle = styled.h3`
  font-size: 18px;
  font-weight: bold;
  color: #9333ea;
`;
const CloseButton = styled.button`
  background: none;
  border: none;
  color: #a855f7;
  font-size: 20px;
  cursor: pointer;
`;
const GuideText = styled.p`
  font-size: 14px;
  color: #6b21a8;
  line-height: 1.6;
  margin-bottom: 20px;
`;
const TipBox = styled.div`
  background: rgba(255, 255, 255, 0.6);
  padding: 15px;
  border-radius: 12px;
  font-size: 14px;
  color: #555;
  
  strong {
    display: block;
    margin-bottom: 8px;
    color: #7e22ce;
  }
  ul {
    padding-left: 20px;
    margin: 0;
    li {
      margin-bottom: 4px;
      color: #666;
    }
  }
`;

const SectionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 30px;
`;
const SectionCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 30px;
  border: 1px solid #eee;
  box-shadow: 0 2px 10px rgba(0,0,0,0.02);
`;
const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;
const SectionTitle = styled.h3`
  font-size: 18px;
  font-weight: bold;
  color: #333;
`;
const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
`;
const AiButtonSmall = styled.button`
  background: #a855f7;
  color: white;
  border: none;
  padding: 8px 14px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: bold;
  cursor: pointer;
  &:hover { background: #9333ea; }
`;
const EditButton = styled.button`
  background: white;
  border: 1px solid #ddd;
  color: #555;
  padding: 8px 14px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: bold;
  cursor: pointer;
  &:hover { background: #f9fafb; }
`;

const EmptyContentArea = styled.div`
  border: 2px dashed #e5e7eb;
  border-radius: 12px;
  padding: 50px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #fafafa;
`;
const EmptyIcon = styled.div`
  font-size: 40px;
  margin-bottom: 15px;
  opacity: 0.3;
`;
const EmptyText = styled.p`
  color: #666;
  margin-bottom: 20px;
  font-size: 15px;
`;
const AiButtonLarge = styled.button`
  background: linear-gradient(90deg, #a855f7, #d946ef);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  margin-bottom: 15px;
  box-shadow: 0 4px 15px rgba(168, 85, 247, 0.2);
  transition: transform 0.2s;
  &:hover { transform: translateY(-2px); }
`;
const SubText = styled.span`
  font-size: 13px;
  color: #999;
`;

const AddSectionButton = styled.button`
  width: 100%;
  padding: 18px;
  background: white;
  border: 2px dashed #ddd;
  border-radius: 12px;
  color: #666;
  font-size: 16px;
  font-weight: bold;
  margin-top: 30px;
  cursor: pointer;
  transition: all 0.2s;
  &:hover { 
    border-color: #a855f7;
    color: #a855f7;
    background: #fdf4ff;
  }
`;

const AutoSaveBar = styled.div`
  margin-top: 40px;
  background: #eff6ff;
  color: #3b82f6;
  padding: 15px;
  border-radius: 8px;
  text-align: center;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
`;
const FooterSpacer = styled.div`
  height: 50px;
`;