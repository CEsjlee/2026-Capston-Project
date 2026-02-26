import { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import api from '../api/axios';
import html2canvas from 'html2canvas'; 
import jsPDF from 'jspdf';

const Portfolio = () => {
  const [showGuide, setShowGuide] = useState(true);
  const [loadingSection, setLoadingSection] = useState(null); 
  const [saveStatus, setSaveStatus] = useState('');

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const printRef = useRef(); 

  const [content, setContent] = useState({
    intro: '', stack: '', projects: '', activities: ''
  });

  const sections = [
    { id: 'intro', title: '자기소개', placeholder: '나를 표현하는 한 문장과 핵심 역량을 작성해보세요.' },
    { id: 'stack', title: '기술 스택', placeholder: '사용 가능한 언어, 프레임워크, 도구를 나열해보세요.' },
    { id: 'projects', title: '프로젝트 경험', placeholder: '진행했던 프로젝트의 목표, 역할, 성과를 구체적으로 적어주세요.' },
    { id: 'activities', title: '활동 및 수상', placeholder: '대외활동, 공모전 수상 내역 등을 작성해주세요.' },
  ];

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const res = await api.get('/api/portfolio');
        if (res.data) {
          setContent({
            intro: res.data.intro || '',
            stack: res.data.stack || '',
            projects: res.data.projects || '',
            activities: res.data.activities || ''
          });
        }
      } catch (err) { console.error(err); }
    };
    fetchPortfolio();
  }, []);

  const handleChange = (id, value) => {
    setContent(prev => ({ ...prev, [id]: value }));
  };

  const handleAutoSave = async () => {
    try {
      await api.post('/api/portfolio/save', content);
      console.log("자동 저장 완료");
    } catch (err) { console.error("저장 실패"); }
  };

  // ✅ [추가] 섹션 초기화 핸들러
  const handleClearSection = async (sectionId) => {
    if (!content[sectionId]) return; // 이미 비어있으면 무시
    
    if (!window.confirm('정말 이 섹션의 내용을 초기화하시겠습니까?\n삭제된 내용은 복구할 수 없습니다.')) return;

    // 해당 섹션만 빈 문자열로 변경
    const newContent = { ...content, [sectionId]: '' };
    setContent(newContent);
    
    // DB에도 즉시 반영 (빈 값으로 저장)
    try {
        await api.post('/api/portfolio/save', newContent);
    } catch(err) {
        console.error("초기화 저장 실패", err);
    }
  };

  const handleAiDraft = async (sectionId) => {
    if (content[sectionId] && content[sectionId].trim() !== '') {
        if (!window.confirm(`기존 내용 뒤에 AI 가이드라인을 추가하시겠습니까?`)) return;
    }

    setLoadingSection(sectionId);
    try {
      // 백엔드에서 섹션별(프로젝트=STAR, 기타=일반) 맞춤 프롬프트로 처리함
      const res = await api.post('/api/portfolio/ai-generate', { section: sectionId });
      
      const newContent = content[sectionId] 
        ? content[sectionId] + "\n\n------------------------\n\n" + res.data.content 
        : res.data.content;

      setContent(prev => ({ ...prev, [sectionId]: newContent }));
      await api.post('/api/portfolio/save', { ...content, [sectionId]: newContent });

    } catch (err) {
      alert("AI 생성 중 오류가 발생했습니다.");
    } finally {
      setLoadingSection(null);
    }
  };

  const handleDownloadPdf = async () => {
    const originalElement = printRef.current;
    if (!originalElement) return;

    try {
      const clone = originalElement.cloneNode(true);
      clone.style.width = '210mm';
      clone.style.height = 'auto';
      clone.style.minHeight = '297mm';
      clone.style.position = 'absolute';
      clone.style.top = '-9999px';
      clone.style.left = '-9999px';
      clone.style.zIndex = '-1';
      clone.style.background = 'white';
      
      document.body.appendChild(clone);

      const canvas = await html2canvas(clone, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      document.body.removeChild(clone);

      const imgWidth = 210; 
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 0;
      const pdf = new jsPDF('p', 'mm', 'a4');

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position -= pageHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      pdf.save('My_Portfolio.pdf');
    } catch (err) { alert("PDF 변환 중 오류가 발생했습니다."); }
  };

  return (
    <Container>
      <Header>
        <div>
          <PageTitle>📄 포트폴리오</PageTitle>
          <PageSubtitle>AI 가이드라인과 함께 완성하는 나만의 포트폴리오</PageSubtitle>
        </div>
        <HeaderButtons>
          <WhiteButton onClick={() => setIsPreviewOpen(true)}>👁️ 미리보기 & PDF</WhiteButton>
        </HeaderButtons>
      </Header>

      {showGuide && (
        <AiGuideBox>
          <GuideHeader>
            <GuideTitle>✨ AI 포트폴리오 도우미</GuideTitle>
            <CloseButton onClick={() => setShowGuide(false)}>✕</CloseButton>
          </GuideHeader>
          <GuideText>
            각 섹션 상단의 <strong>'✨ AI 가이드라인 생성'</strong> 버튼을 눌러보세요.<br/>
            로드맵 정보를 분석하여 내용을 쉽게 채울 수 있는 <strong>맞춤형 질문과 템플릿</strong>을 제공해 드립니다.
          </GuideText>
          
          <StarList>
            <p>💡 <strong>Tip:</strong> 포트폴리오는 <strong>STAR 기법</strong>으로 작성하면 좋습니다.</p>
            <li><strong>S (Situation):</strong> 어떤 상황이었나요?</li>
            <li><strong>T (Task):</strong> 어떤 문제가 있었나요?</li>
            <li><strong>A (Action):</strong> 어떻게 해결했나요?</li>
            <li><strong>R (Result):</strong> 어떤 성과를 냈나요?</li>
          </StarList>
        </AiGuideBox>
      )}

      <SectionList>
        {sections.map((section) => (
          <SectionCard key={section.id}>
            <SectionHeader>
              <SectionTitle>{section.title}</SectionTitle>
              <ButtonGroup>
                {/* ✅ [추가] 초기화 버튼 */}
                <ResetButton onClick={() => handleClearSection(section.id)}>
                   🔄 초기화
                </ResetButton>

                <AiButtonSmall 
                    onClick={() => handleAiDraft(section.id)}
                    disabled={loadingSection === section.id}
                >
                  {loadingSection === section.id ? '생성 중...' : '✨ AI 가이드라인 생성'}
                </AiButtonSmall>
              </ButtonGroup>
            </SectionHeader>
            
            {(!content[section.id] && loadingSection !== section.id) ? (
                <EmptyContentArea>
                    <EmptyIcon>📝</EmptyIcon>
                    <EmptyText>아직 작성된 내용이 없습니다</EmptyText>
                    <TextLink onClick={() => handleChange(section.id, ' ')}>직접 작성 시작하기 ✍️</TextLink>
                </EmptyContentArea>
            ) : (
                <StyledTextarea 
                    value={content[section.id]}
                    onChange={(e) => handleChange(section.id, e.target.value)}
                    onBlur={handleAutoSave} 
                    placeholder={section.placeholder}
                    disabled={loadingSection === section.id}
                />
            )}
            {loadingSection === section.id && <LoadingOverlay>AI가 맞춤형 가이드라인을 작성 중입니다... 🧠</LoadingOverlay>}
          </SectionCard>
        ))}
      </SectionList>

      <FooterSpacer />

      {isPreviewOpen && (
        <ModalOverlay onClick={() => setIsPreviewOpen(false)}>
            <PreviewContainer onClick={e => e.stopPropagation()}>
                <PreviewHeader>
                    <h3>📄 포트폴리오 미리보기</h3>
                    <div>
                        <PurpleButton onClick={handleDownloadPdf}>📥 PDF 다운로드</PurpleButton>
                        <CloseButton onClick={() => setIsPreviewOpen(false)} style={{marginLeft: '10px'}}>✕</CloseButton>
                    </div>
                </PreviewHeader>
                <ScrollArea>
                    <DocumentArea ref={printRef}>
                        <DocTitle>Portfolio</DocTitle>
                        <hr style={{borderColor: '#333', marginBottom: '30px'}} />
                        {sections.map(sec => (
                            <DocSection key={sec.id}>
                                <DocSectionTitle>{sec.title}</DocSectionTitle>
                                <DocContent>{content[sec.id] || '(내용 없음)'}</DocContent>
                            </DocSection>
                        ))}
                    </DocumentArea>
                </ScrollArea>
            </PreviewContainer>
        </ModalOverlay>
      )}

    </Container>
  );
};

export default Portfolio;

// --- 스타일 컴포넌트 ---
const Container = styled.div` flex: 1; padding: 40px; overflow-y: auto; height: 100vh; box-sizing: border-box; background-color: #f8f9fc; `;
const Header = styled.div` display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; `;
const PageTitle = styled.h2` font-size: 28px; color: #333; font-weight: bold; margin-bottom: 8px; `;
const PageSubtitle = styled.p` font-size: 16px; color: #666; `;
const HeaderButtons = styled.div` display: flex; gap: 10px; `;
const WhiteButton = styled.button` background: white; border: 1px solid #ddd; padding: 10px 16px; border-radius: 8px; font-weight: bold; color: #555; cursor: pointer; &:hover { background: #f9fafb; } `;
const PurpleButton = styled.button` background: #a855f7; border: none; padding: 10px 16px; border-radius: 8px; font-weight: bold; color: white; cursor: pointer; &:hover { background: #9333ea; } `;

const AiGuideBox = styled.div` background: #fdf4ff; border: 1px solid #f0abfc; border-radius: 16px; padding: 25px; margin-bottom: 40px; position: relative; `;
const GuideHeader = styled.div` display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; `;
const GuideTitle = styled.h3` font-size: 18px; font-weight: bold; color: #9333ea; `;
const CloseButton = styled.button` background: none; border: none; color: #a855f7; font-size: 20px; cursor: pointer; `;
const GuideText = styled.p` font-size: 14px; color: #6b21a8; line-height: 1.6; margin-bottom: 15px; `;

const StarList = styled.ul`
  background: rgba(255, 255, 255, 0.6);
  padding: 15px 15px 15px 20px;
  border-radius: 12px;
  margin: 0;
  list-style: none;
  p {
    margin: 0 0 10px 0;
    color: #555;
    font-size: 14px;
  }
  li {
    font-size: 13px;
    color: #666;
    margin-bottom: 4px;
    padding-left: 10px;
    position: relative;
  }
  li:before {
    content: "•";
    color: #a855f7;
    font-weight: bold;
    position: absolute;
    left: 0;
  }
  li strong {
    color: #7e22ce;
    margin-right: 4px;
  }
`;

const SectionList = styled.div` display: flex; flex-direction: column; gap: 30px; `;
const SectionCard = styled.div` background: white; border-radius: 16px; padding: 30px; border: 1px solid #eee; box-shadow: 0 2px 10px rgba(0,0,0,0.02); position: relative; overflow: hidden;`;
const SectionHeader = styled.div` display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; `;
const SectionTitle = styled.h3` font-size: 18px; font-weight: bold; color: #333; `;
const ButtonGroup = styled.div` display: flex; gap: 8px; `;

// ✅ [추가] 초기화 버튼 스타일
const ResetButton = styled.button`
  background: #f3f4f6;
  color: #666;
  border: 1px solid #ddd;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
  &:hover { background: #e5e7eb; color: #333; }
`;

const AiButtonSmall = styled.button` background: #a855f7; color: white; border: none; padding: 8px 14px; border-radius: 6px; font-size: 13px; font-weight: bold; cursor: pointer; &:hover { background: #9333ea; } &:disabled { background: #d8b4fe; cursor: not-allowed; }`;

const EmptyContentArea = styled.div` border: 2px dashed #e5e7eb; border-radius: 12px; padding: 50px 0; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #fafafa; `;
const EmptyIcon = styled.div` font-size: 40px; margin-bottom: 15px; opacity: 0.3; `;
const EmptyText = styled.p` color: #666; margin-bottom: 20px; font-size: 15px; `;
const TextLink = styled.span` font-size: 14px; color: #a855f7; font-weight: bold; cursor: pointer; text-decoration: underline; &:hover { color: #9333ea; } `;
const StyledTextarea = styled.textarea` width: 100%; height: 250px; padding: 15px; border: 1px solid #ddd; border-radius: 12px; font-size: 15px; line-height: 1.6; resize: vertical; outline: none; box-sizing: border-box; &:focus { border-color: #a855f7; } `;
const LoadingOverlay = styled.div` position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(255,255,255,0.8); display: flex; justify-content: center; align-items: center; font-weight: bold; color: #a855f7; font-size: 18px; `;
const FooterSpacer = styled.div` height: 50px; `;

const ModalOverlay = styled.div` position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; `;
const PreviewContainer = styled.div` background: #e5e5e5; width: 900px; height: 90vh; border-radius: 16px; display: flex; flex-direction: column; overflow: hidden; `;
const PreviewHeader = styled.div` background: white; padding: 20px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #ddd; h3 { margin: 0; font-size: 18px; color: #333; } `;
const ScrollArea = styled.div` flex: 1; overflow-y: auto; padding: 40px; display: block; `;
const DocumentArea = styled.div` width: 210mm; min-height: 297mm; height: auto; background: white; padding: 25mm; box-shadow: 0 5px 20px rgba(0,0,0,0.1); box-sizing: border-box; margin: 0 auto; `;
const DocTitle = styled.h1` font-size: 32px; text-align: center; margin-bottom: 20px; color: #333; `;
const DocSection = styled.div` margin-bottom: 30px; `;
const DocSectionTitle = styled.h2` font-size: 20px; color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 15px; `;
const DocContent = styled.p` font-size: 14px; line-height: 1.8; color: #444; white-space: pre-line; word-break: break-word; `;