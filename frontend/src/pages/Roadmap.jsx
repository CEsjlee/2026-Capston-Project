import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios'; 

const Roadmap = () => {
  const navigate = useNavigate();

  const [inputs, setInputs] = useState({ 
    major: '', grade: '', semester: '1학기', targetJob: '', 
    currentSpecs: '', courses: '', projects: '', gpa: '', 
    language: '', targetCompany: '', techStacks: ''      
  });
  
  const [resultData, setResultData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState(""); 
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const response = await api.get('/api/major/my-roadmap');
        
        if (response.data) {
          setInputs(prev => ({ ...prev, ...response.data, semester: response.data.semester || '1학기' }));
          
          let parsedResult = {};
          
          if (response.data.roadmapJson) {
             const plans = JSON.parse(response.data.roadmapJson);
             parsedResult.semesterPlans = Array.isArray(plans) ? plans : plans.semesterPlans;
          }

          if (response.data.analysisResult) {
            try {
                const analysis = JSON.parse(response.data.analysisResult);
                parsedResult = { ...parsedResult, ...analysis };
            } catch(e) {}
          }
          
          if (response.data.targetJob) {
             try {
                 const keyword = encodeURIComponent(response.data.targetJob + " 채용");
                 const newsRes = await api.get(`/api/major/news?keyword=${keyword}`);
                 parsedResult.newsList = newsRes.data; 
             } catch (newsErr) { parsedResult.newsList = []; }
          }
           
          if(parsedResult.semesterPlans) {
             setResultData(parsedResult);
          }
        }
      } catch (err) { }
    };
    loadInitialData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs(prev => ({ ...prev, [name]: value }));
  };

  const handleAnalyze = async () => {
    if (!inputs.major || !inputs.grade || !inputs.targetJob) {
      alert("전공, 학년, 목표 직무는 필수입니다!");
      return;
    }
    
    setLoadingText("로드맵 생성 중... 🧠");
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post('/api/major/analyze', inputs);
      let finalData = response.data;
      if (finalData.analysis) {
          finalData = { ...finalData, ...finalData.analysis };
      }
      setResultData(finalData);
    } catch (err) {
      setError("분석 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => { setResultData(null); setError(null); };

  const toggleItem = async (semesterIndex, category, itemIndex) => {
    if (!resultData?.semesterPlans) return;

    const newResult = { ...resultData };
    const semester = newResult.semesterPlans[semesterIndex];
    
    // 🔥 결산된 학기도 수정 가능하도록 방어 로직 삭제 완료
    if (!semester[category]) return;

    const item = semester[category][itemIndex];
    if (typeof item === 'string') {
        semester[category][itemIndex] = { content: item, isCompleted: true };
    } else {
        semester[category][itemIndex] = { ...item, isCompleted: !item.isCompleted };
    }

    setResultData(newResult); 
    try {
        await api.post('/api/major/update-progress', { 
            roadmapJson: JSON.stringify(newResult.semesterPlans) 
        });
    } catch (err) { }
  };

  const handleFinishSemester = async (index) => {
    if (!window.confirm("이번 학기를 결산하시겠습니까?\nAI가 결과를 분석하여 새로운 미션을 갱신합니다.")) return;

    const newResult = { ...resultData };
    newResult.semesterPlans[index].isFinished = true;
    setResultData(newResult);

    setLoadingText("결산 데이터를 안전하게 저장하는 중... 💾");
    setLoading(true);

    try {
        await api.post('/api/major/update-progress', { 
            roadmapJson: JSON.stringify(newResult.semesterPlans) 
        });

        setLoadingText("AI 멘토가 새로운 피드백을 생성하고 있습니다... 🧠");
        
        await api.post('/api/major/finish-semester', { 
            roadmapJson: JSON.stringify(newResult.semesterPlans),
            finishedGrade: newResult.semesterPlans[index].grade
        });
        
        navigate(`/feedback?grade=${encodeURIComponent(newResult.semesterPlans[index].grade)}`);
    } catch (err) {
        alert("AI 피드백 갱신이 지연되었습니다. 결산 내역은 정상적으로 저장되었습니다!");
        navigate(`/feedback?grade=${encodeURIComponent(newResult.semesterPlans[index].grade)}`);
    } finally {
        setLoading(false);
    }
  };

  const renderListItems = (items, semesterIndex, category) => {
      if (!items || !Array.isArray(items)) return <li style={{color:'#ccc'}}>내용 없음</li>;
      return items.map((t, i) => {
          const content = typeof t === 'string' ? t : t.content;
          const isCompleted = typeof t === 'string' ? false : t.isCompleted;
          return (
            // 🔥 자물쇠 이미지 렌더링 삭제 및 클릭 가능 상태로 통일
            <CheckableItem key={i} $completed={isCompleted} onClick={() => toggleItem(semesterIndex, category, i)}>
                <span className="icon">{isCompleted ? '✅' : '⬜'}</span>
                <span className="text">{content}</span>
            </CheckableItem>
          );
      });
  };

  const renderCourses = (items, semesterIndex) => {
      if (!items || !Array.isArray(items)) return <SubjectBadge>추천 과목 없음</SubjectBadge>;
      return items.map((t, i) => {
          const content = typeof t === 'string' ? t : t.content;
          const isCompleted = typeof t === 'string' ? false : t.isCompleted;
          return (
            // 🔥 과목 태그도 항상 클릭 가능하도록 통일
            <SubjectBadge key={i} $completed={isCompleted} onClick={() => toggleItem(semesterIndex, 'courses', i)}>
               {isCompleted && '✓ '} {content}
            </SubjectBadge>
          );
      });
  };

  const finalGaps = resultData?.gaps || resultData?.analysis?.gaps;

  return (
    <MainContent>
      <PageHeader><PageTitle>🗺️ 로드맵</PageTitle></PageHeader>

      {loading && !error && (
        <LoadingContainer>
          <Spinner /><LoadingText><strong>{inputs.targetJob}</strong> {loadingText}</LoadingText>
        </LoadingContainer>
      )}

      {!resultData && !loading && !error && (
        <FormContainer>
          <FormTitle>맞춤 로드맵 설정을 위한 정보 입력</FormTitle>
          <SectionSubtitle>📍 기본 정보 (필수)</SectionSubtitle>
          <InputRow>
            <InputGroup style={{flex: 2}}><Label>전공</Label><Input name="major" placeholder="예: 컴퓨터공학과" value={inputs.major} onChange={handleChange}/></InputGroup>
            <InputGroup style={{flex: 1}}><Label>학년</Label>
              <Select name="grade" value={inputs.grade} onChange={handleChange}>
                <option value="">선택</option><option value="1학년">1학년</option><option value="2학년">2학년</option><option value="3학년">3학년</option><option value="4학년">4학년</option>
              </Select>
            </InputGroup>
            <InputGroup style={{flex: 1}}><Label>학기</Label>
              <Select name="semester" value={inputs.semester} onChange={handleChange}>
                <option value="1학기">1학기</option><option value="2학기">2학기</option>
              </Select>
            </InputGroup>
          </InputRow>

          <InputGroup><Label>목표 직무</Label><Input name="targetJob" placeholder="예: 백엔드 개발자" value={inputs.targetJob} onChange={handleChange}/></InputGroup>
          
          <Divider />
          <SectionSubtitle>🎯 상세 목표 및 선호도</SectionSubtitle>
          <InputRow>
            <InputGroup><Label>희망 기업 형태</Label><Input name="targetCompany" placeholder="예: 네카라쿠배" value={inputs.targetCompany} onChange={handleChange}/></InputGroup>
            <InputGroup><Label>핵심 기술 스택</Label><Input name="techStacks" placeholder="예: Java, Spring" value={inputs.techStacks} onChange={handleChange}/></InputGroup>
          </InputRow>

          <Divider />
          <SectionSubtitle>🎓 상세 스펙</SectionSubtitle>
          <InputGroup><Label>기수강 핵심 과목</Label><TextArea name="courses" placeholder="수강 완료한 전공 과목" value={inputs.courses} onChange={handleChange} $height="60px"/></InputGroup>
          <InputRow>
            <InputGroup style={{flex: 1}}><Label>현재 학점</Label><Input name="gpa" value={inputs.gpa} onChange={handleChange}/></InputGroup>
            <InputGroup style={{flex: 1}}><Label>어학 성적</Label><Input name="language" value={inputs.language} onChange={handleChange}/></InputGroup>
          </InputRow>
          <InputGroup><Label>프로젝트 및 대외활동</Label><TextArea name="projects" placeholder="경험하신 프로젝트나 활동" value={inputs.projects} onChange={handleChange} $height="80px"/></InputGroup>
          <InputGroup><Label>보유 자격증 및 기타</Label><Input name="currentSpecs" placeholder="예: 정보처리기사" value={inputs.currentSpecs} onChange={handleChange}/></InputGroup>
          
          <AnalyzeButton onClick={handleAnalyze}>🚀 AI 로드맵 생성하기</AnalyzeButton>
        </FormContainer>
      )}

      {resultData && (
        <>
          <GoalSection>
            <GoalTitle>🎯 목표 직군</GoalTitle><GoalText>{resultData.interest || inputs.targetJob}</GoalText>
            <TopButton onClick={handleRetry}>🔄 다시 설정</TopButton>
          </GoalSection>

          <SectionTitle>🚀 남은 대학생활 로드맵 (클릭해서 체크 ✅)</SectionTitle>
          <ScrollContainer>
            {resultData.semesterPlans?.map((sem, idx) => (
              <RoadmapCard key={idx} $finished={sem.isFinished}>
                <CardHeader>
                  <CardHeaderBadge>{idx + 1}</CardHeaderBadge>
                  {/* 🔥 제목에서도 자물쇠 아이콘 삭제 */}
                  <CardTitle>{sem.grade} {sem.isFinished && <FinishedBadge>결산 완료</FinishedBadge>}</CardTitle>
                </CardHeader>
                <CardInnerStack>
                  <InfoBlock><SubHeader>🔥 핵심 목표</SubHeader><List>{renderListItems(sem.goal, idx, 'goal')}</List></InfoBlock>
                  <InfoBlock><SubHeader>📚 추천 과목</SubHeader><SubjectWrap>{renderCourses(sem.courses, idx)}</SubjectWrap></InfoBlock>
                  <InfoBlock><SubHeader>🏃 추천 활동</SubHeader><List $check>{renderListItems(sem.activities, idx, 'activities')}</List></InfoBlock>
                </CardInnerStack>
                <FinishButtonWrapper>
                   {!sem.isFinished ? (
                       <FinishButton onClick={() => handleFinishSemester(idx)}>🏆 이번 학기 결산하기</FinishButton>
                   ) : (
                       <RevisitButton onClick={() => navigate(`/feedback?grade=${encodeURIComponent(sem.grade)}`)}>📊 피드백 보러가기</RevisitButton>
                   )}
                </FinishButtonWrapper>
              </RoadmapCard>
            ))}
          </ScrollContainer>

          <SectionTitle>📈 역량 분석 및 AI 조언</SectionTitle>
          <GapCard>
            <GapGrid>
              <div><GapHeader className="green">● 현재 보유 역량</GapHeader><p style={{color: '#555', fontSize: '15px'}}>{finalGaps?.owned?.join(', ') || "정보 없음"}</p></div>
              <div><GapHeader className="orange">● 보완 필요 역량</GapHeader>
                {finalGaps?.missing?.map((item, i) => <GapItem key={i}><strong>{item.name}</strong><span>{item.method}</span></GapItem>)}
              </div>
            </GapGrid>
            <AiFeedback><strong>💡 AI 상세 컨설팅</strong><p>{finalGaps?.aiFeedback}</p></AiFeedback>
          </GapCard>

          <SectionTitle>📰 관련 채용 뉴스</SectionTitle>
          <NewsGrid>
            {resultData.newsList?.length > 0 ? resultData.newsList.map((news, i) => (
              <NewsCard key={i} href={news.link} target="_blank"><h4>{news.title}</h4><span>기사 보기 ↗</span></NewsCard>
            )) : <div style={{padding: '20px', color: '#999'}}>관련 뉴스를 찾을 수 없습니다.</div>}
          </NewsGrid>
          <FooterSpacer />
        </>
      )}
    </MainContent>
  );
};

export default Roadmap;

// --- Styled Components ---
const MainContent = styled.div` flex: 1; padding: 40px; overflow-y: auto; height: 100vh; box-sizing: border-box; background-color: #f8f9fa; display: flex; flex-direction: column; align-items: center; `;
const PageHeader = styled.div` width: 100%; max-width: 1000px; margin-bottom: 30px; `;
const PageTitle = styled.h2` font-size: 24px; color: #333; font-weight: bold; `;
const SectionSubtitle = styled.h4` font-size: 15px; color: #a855f7; margin-bottom: 15px; text-align: left; width: 100%; `;
const Divider = styled.div` height: 1px; background: #eee; margin: 25px 0; width: 100%; `;

const FormContainer = styled.div` width: 100%; max-width: 600px; background: white; padding: 40px; border-radius: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); `;
const FormTitle = styled.h2` font-size: 20px; margin-bottom: 25px; border-bottom: 2px solid #f0f0f0; padding-bottom: 15px; text-align: left; `;
const InputGroup = styled.div` margin-bottom: 20px; text-align: left; width: 100%; `;
const InputRow = styled.div` display: flex; gap: 15px; width: 100%; `;
const Label = styled.label` display: block; font-size: 14px; font-weight: bold; color: #555; margin-bottom: 8px; `;
const Input = styled.input` width: 100%; padding: 14px; border: 1px solid #ddd; border-radius: 10px; box-sizing: border-box; outline: none; &:focus { border-color: #a855f7; } `;
const Select = styled.select` width: 100%; padding: 14px; border: 1px solid #ddd; border-radius: 10px; background: white; outline: none; &:focus { border-color: #a855f7; } `;
const TextArea = styled.textarea` width: 100%; padding: 14px; border: 1px solid #ddd; border-radius: 10px; height: ${props => props.$height || '100px'}; resize: none; box-sizing: border-box; outline: none; &:focus { border-color: #a855f7; } `;
const AnalyzeButton = styled.button` width: 100%; background: #a855f7; color: white; padding: 16px; border: none; border-radius: 12px; font-size: 18px; font-weight: bold; cursor: pointer; margin-top: 10px; transition: transform 0.2s; &:hover { background: #9333ea; transform: translateY(-2px); } `;

const GoalSection = styled.div` width: 100%; max-width: 1000px; background: #fdf4ff; border: 1px solid #f0abfc; padding: 20px; border-radius: 12px; margin-bottom: 40px; display: flex; align-items: center; box-sizing: border-box; `;
const GoalTitle = styled.h4` color: #a855f7; margin: 0; min-width: 80px; `;
const GoalText = styled.div` font-size: 18px; font-weight: bold; color: #333; flex: 1; margin-left: 20px; `;
const TopButton = styled.button` background: white; color: #a855f7; border: 1px solid #a855f7; padding: 8px 16px; border-radius: 8px; cursor: pointer; `;
const SectionTitle = styled.h3` width: 100%; max-width: 1000px; font-size: 18px; margin: 30px 0 20px 0; text-align: left; color: #333; `;

const ScrollContainer = styled.div` width: 100%; max-width: 1000px; display: flex; gap: 20px; overflow-x: auto; padding: 20px 10px 40px 10px; margin-bottom: 20px; min-height: 450px; align-items: flex-start; &::-webkit-scrollbar { height: 10px; } &::-webkit-scrollbar-thumb { background: #d8b4fe; border-radius: 10px; } &::-webkit-scrollbar-track { background: #f3e8ff; border-radius: 10px; } `;
const RoadmapCard = styled.div` min-width: 320px; flex-shrink: 0; background: ${props => props.$finished ? '#fdfaff' : 'white'}; padding: 25px; border-radius: 16px; box-shadow: 0 10px 20px rgba(0,0,0,0.05); border: 1px solid ${props => props.$finished ? '#d8b4fe' : '#e9d5ff'}; display: flex; flex-direction: column; min-height: 400px; position: relative; `;
const CardHeader = styled.div` display: flex; align-items: center; gap: 10px; margin-bottom: 15px; border-bottom: 1px solid #f0f0f0; padding-bottom: 10px; `;
const CardHeaderBadge = styled.div` width: 25px; height: 25px; border-radius: 50%; background: #a855f7; color: white; display: flex; justify-content: center; align-items: center; font-size: 12px; font-weight: bold; flex-shrink: 0; `;
const CardTitle = styled.h4` margin: 0; font-size: 16px; color: #333; `;
const FinishedBadge = styled.span` font-size: 11px; background: #a855f7; color: white; padding: 2px 6px; border-radius: 4px; margin-left: 8px; vertical-align: middle;`;
const CardInnerStack = styled.div` display: flex; flex-direction: column; gap: 20px; `;
const InfoBlock = styled.div``;
const SubHeader = styled.h5` font-size: 13px; color: #7e22ce; margin-bottom: 8px; font-weight: bold; `;
const List = styled.ul` padding-left: 18px; margin: 0; li { font-size: 13px; color: #444; margin-bottom: 5px; line-height: 1.4; } ${props => props.$check && `list-style: none; padding-left: 0; li:before { content: ''; margin-right: 0px; }`} `;
const SubjectWrap = styled.div` display: flex; gap: 5px; flex-wrap: wrap; `;

// 🔥 비활성화(흐림 효과) 제거 및 항상 커서가 활성화되도록 수정
const CheckableItem = styled.li` 
    display: flex; align-items: flex-start; gap: 8px; margin-bottom: 6px; 
    cursor: pointer; 
    font-size: 13px; 
    color: ${props => props.$completed ? '#166534' : '#444'}; 
    padding: 4px; border-radius: 4px; 
    background: ${props => props.$completed ? '#f0fdf4' : 'transparent'}; 
    .text { text-decoration: none; font-weight: ${props => props.$completed ? '600' : 'normal'}; } 
    .icon { font-size: 14px; } 
`;

// 🔥 항상 커서가 활성화되도록 수정
const SubjectBadge = styled.span` 
    background: ${props => props.$completed ? '#f3e8ff' : '#f3f4f6'}; 
    padding: 4px 10px; border-radius: 6px; font-size: 12px; color: #555; 
    border: 1px solid ${props => props.$completed ? '#a855f7' : '#eee'}; 
    cursor: pointer; 
`;

const FinishButtonWrapper = styled.div` margin-top: auto; padding-top: 20px; `;
const FinishButton = styled.button` width: 100%; padding: 10px; background: white; border: 1px solid #a855f7; color: #a855f7; border-radius: 8px; font-weight: bold; cursor: pointer; &:hover { background: #f3e8ff; } `;
const RevisitButton = styled(FinishButton)` background: #f3e8ff; border: none; color: #7e22ce; `;

const GapCard = styled.div` width: 100%; max-width: 1000px; background: white; padding: 30px; border-radius: 16px; border: 1px solid #eee; box-sizing: border-box; `;
const GapGrid = styled.div` display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 25px; `;
const GapHeader = styled.h5` margin-bottom: 12px; font-weight: bold; &.green { color: #22c55e; } &.orange { color: #f97316; } `;
const GapItem = styled.div` margin-bottom: 12px; strong { display: block; font-size: 14px; color: #333; } span { font-size: 12px; color: #888; } `;
const AiFeedback = styled.div` background: #fdf4ff; padding: 20px; border-radius: 12px; text-align: left; border-left: 4px solid #a855f7; strong { color: #a855f7; font-size: 15px; } p { font-size: 14px; line-height: 1.7; margin-top: 8px; color: #444; white-space: pre-line; } `;
const NewsGrid = styled.div` width: 100%; max-width: 1000px; display: grid; grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)); gap: 15px; `;
const NewsCard = styled.a` display: block; background: white; padding: 18px; border-radius: 12px; border: 1px solid #eee; text-decoration: none; h4 { margin: 0 0 10px 0; font-size: 14px; color: #333; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; } span { font-size: 12px; color: #a855f7; font-weight: bold; } `;
const FooterSpacer = styled.div` height: 60px; `;
const LoadingContainer = styled.div` text-align: center; margin-top: 80px; `;
const Spinner = styled.div` border: 4px solid #f3f3f3; border-top: 4px solid #a855f7; border-radius: 50%; width: 50px; height: 50px; animation: spin 1s linear infinite; margin: 0 auto 20px; @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } } `;
const LoadingText = styled.p` font-size: 18px; color: #333; `;