import { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
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
            <SubjectBadge key={i} $completed={isCompleted} onClick={() => toggleItem(semesterIndex, 'courses', i)}>
               {isCompleted && '✓ '} {content}
            </SubjectBadge>
          );
      });
  };

  const finalGaps = resultData?.gaps || resultData?.analysis?.gaps;

  // 진행도 계산 로직
  const totalSemesters = resultData?.semesterPlans?.length || 0;
  const finishedSemesters = resultData?.semesterPlans?.filter(s => s.isFinished).length || 0;
  const progressPercent = totalSemesters === 0 ? 0 : Math.round((finishedSemesters / totalSemesters) * 100);

  return (
    <MainContent>
      <PageHeader><PageTitle>🗺️ 내 진로 로드맵</PageTitle></PageHeader>

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
        <DashboardWrapper>
          <GoalSection>
            <div className="info">
              <GoalTitle>🎯 목표 직군</GoalTitle>
              <GoalText>{resultData.interest || inputs.targetJob}</GoalText>
            </div>
            <TopButton onClick={handleRetry}>🔄 다시 설정</TopButton>
          </GoalSection>

          {/* 📊 진행도 UI 수정됨 */}
          <ProgressSection>
            <div className="progress-header">
              <SectionTitle style={{margin: 0, fontSize: '18px'}}>전체 로드맵 진행도</SectionTitle>
              <span className="percent">{progressPercent}% 달성</span>
            </div>
            <ProgressBar TrackColor="#f3e8ff" BarColor="#a855f7">
              <div className="bar" style={{ width: `${progressPercent}%` }} />
            </ProgressBar>
            <p className="status-text">총 {totalSemesters}개 학기 중 <strong>{finishedSemesters}개 학기</strong> 결산 완료!</p>
          </ProgressSection>

          <SectionTitle>🚀 나의 대학생활 마스터 플랜 (클릭해서 체크 ✅)</SectionTitle>
          
          <RoadmapGrid>
            {resultData.semesterPlans?.map((sem, idx) => (
              <RoadmapCard key={idx} $finished={sem.isFinished}>
                <CardHeader $finished={sem.isFinished}>
                  <div className="badge-area">
                    <CardHeaderBadge $finished={sem.isFinished}>{idx + 1}</CardHeaderBadge>
                    <CardTitle>{sem.grade}</CardTitle>
                  </div>
                  {sem.isFinished && <FinishedBadge>결산 완료</FinishedBadge>}
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
          </RoadmapGrid>

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
        </DashboardWrapper>
      )}
    </MainContent>
  );
};

export default Roadmap;

// --- Styled Components ---
const fadeInUp = keyframes` from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } `;

const MainContent = styled.div` flex: 1; padding: 40px; overflow-y: auto; height: 100vh; box-sizing: border-box; background-color: #f8f9fa; display: flex; flex-direction: column; align-items: center; `;
const PageHeader = styled.div` width: 100%; max-width: 1200px; margin-bottom: 20px; `;
const PageTitle = styled.h2` font-size: 26px; color: #1e293b; font-weight: 800; margin: 0; `;
const DashboardWrapper = styled.div` width: 100%; max-width: 1200px; animation: ${fadeInUp} 0.5s ease-out; `;

const SectionSubtitle = styled.h4` font-size: 15px; color: #a855f7; margin-bottom: 15px; text-align: left; width: 100%; `;
const Divider = styled.div` height: 1px; background: #eee; margin: 25px 0; width: 100%; `;

const FormContainer = styled.div` width: 100%; max-width: 650px; background: white; padding: 40px; border-radius: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); `;
const FormTitle = styled.h2` font-size: 20px; margin-bottom: 25px; border-bottom: 2px solid #f0f0f0; padding-bottom: 15px; text-align: left; `;
const InputGroup = styled.div` margin-bottom: 20px; text-align: left; width: 100%; `;
const InputRow = styled.div` display: flex; gap: 15px; width: 100%; `;
const Label = styled.label` display: block; font-size: 14px; font-weight: bold; color: #555; margin-bottom: 8px; `;
const Input = styled.input` width: 100%; padding: 14px; border: 1px solid #ddd; border-radius: 10px; box-sizing: border-box; outline: none; &:focus { border-color: #a855f7; } `;
const Select = styled.select` width: 100%; padding: 14px; border: 1px solid #ddd; border-radius: 10px; background: white; outline: none; &:focus { border-color: #a855f7; } `;
const TextArea = styled.textarea` width: 100%; padding: 14px; border: 1px solid #ddd; border-radius: 10px; height: ${props => props.$height || '100px'}; resize: none; box-sizing: border-box; outline: none; &:focus { border-color: #a855f7; } `;
const AnalyzeButton = styled.button` width: 100%; background: #a855f7; color: white; padding: 16px; border: none; border-radius: 12px; font-size: 18px; font-weight: bold; cursor: pointer; margin-top: 10px; transition: transform 0.2s; &:hover { background: #9333ea; transform: translateY(-2px); } `;

const GoalSection = styled.div` width: 100%; background: white; border: 1px solid #e2e8f0; padding: 25px 30px; border-radius: 16px; margin-bottom: 25px; display: flex; align-items: center; justify-content: space-between; box-sizing: border-box; box-shadow: 0 4px 15px rgba(0,0,0,0.02); .info { display: flex; align-items: center; } `;
const GoalTitle = styled.h4` color: #a855f7; margin: 0; font-size: 18px; `;
const GoalText = styled.div` font-size: 20px; font-weight: 800; color: #1e293b; margin-left: 20px; `;
const TopButton = styled.button` background: white; color: #64748b; border: 1px solid #cbd5e1; padding: 10px 20px; border-radius: 10px; font-weight: 700; cursor: pointer; transition: 0.2s; &:hover { background: #f8fafc; color: #1e293b; border-color: #94a3b8; } `;

// 🔥 진행도 UI 스타일 최적화
const ProgressSection = styled.div` 
  margin-bottom: 40px; 
  background: white; 
  padding: 25px 30px; 
  border-radius: 16px; 
  border: 1px solid #e2e8f0; 
  box-shadow: 0 4px 15px rgba(0,0,0,0.02); 
  
  .progress-header { 
    display: flex; 
    justify-content: space-between; 
    align-items: baseline; 
    margin-bottom: 15px; 
    gap: 10px;
  } 

  .percent { 
    font-size: 16px; 
    font-weight: 900; 
    color: #a855f7; 
    white-space: nowrap; 
  } 

  .status-text { 
    margin: 12px 0 0 0; 
    font-size: 13.5px; 
    color: #64748b; 
    strong { color: #1e293b; } 
  } 
`;
const ProgressBar = styled.div` width: 100%; height: 12px; background-color: ${props => props.TrackColor}; border-radius: 10px; overflow: hidden; .bar { height: 100%; background-color: ${props => props.BarColor}; border-radius: 10px; transition: width 0.8s ease-in-out; } `;

const SectionTitle = styled.h3` width: 100%; font-size: 20px; margin: 40px 0 20px 0; text-align: left; color: #1e293b; font-weight: 800; `;

const RoadmapGrid = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 25px;
  margin-bottom: 40px;
`;

const RoadmapCard = styled.div` 
  background: ${props => props.$finished ? '#f8fafc' : 'white'}; 
  padding: 25px; 
  border-radius: 16px; 
  box-shadow: ${props => props.$finished ? 'none' : '0 10px 25px rgba(0,0,0,0.04)'}; 
  border: 1px solid ${props => props.$finished ? '#e2e8f0' : '#d8b4fe'}; 
  display: flex; 
  flex-direction: column; 
  min-height: 380px; 
  transition: transform 0.2s;
  &:hover { transform: translateY(-4px); }
`;
const CardHeader = styled.div` display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; border-bottom: 1px solid ${props => props.$finished ? '#e2e8f0' : '#f3e8ff'}; padding-bottom: 15px; .badge-area { display: flex; align-items: center; gap: 10px; } `;
const CardHeaderBadge = styled.div` width: 28px; height: 28px; border-radius: 8px; background: ${props => props.$finished ? '#cbd5e1' : '#a855f7'}; color: white; display: flex; justify-content: center; align-items: center; font-size: 14px; font-weight: 900; `;
const CardTitle = styled.h4` margin: 0; font-size: 17px; color: #1e293b; font-weight: 800; `;
const FinishedBadge = styled.span` font-size: 12px; font-weight: 700; background: #e2e8f0; color: #475569; padding: 4px 10px; border-radius: 6px; `;

const CardInnerStack = styled.div` display: flex; flex-direction: column; gap: 20px; `;
const InfoBlock = styled.div``;
const SubHeader = styled.h5` font-size: 14px; color: #7e22ce; margin-bottom: 10px; font-weight: 800; `;
const List = styled.ul` padding-left: 0; margin: 0; list-style: none; li { font-size: 13.5px; color: #334155; margin-bottom: 6px; line-height: 1.5; } `;
const SubjectWrap = styled.div` display: flex; gap: 6px; flex-wrap: wrap; `;

const CheckableItem = styled.li` 
    display: flex; align-items: flex-start; gap: 10px; margin-bottom: 8px !important; 
    cursor: pointer; 
    font-size: 14px; 
    color: ${props => props.$completed ? '#15803d' : '#334155'} !important; 
    padding: 6px 8px; border-radius: 8px; 
    background: ${props => props.$completed ? '#f0fdf4' : 'transparent'}; 
    transition: background 0.2s;
    &:hover { background: #f8fafc; }
    .text { text-decoration: none; font-weight: ${props => props.$completed ? '700' : '500'}; line-height: 1.4; } 
    .icon { font-size: 15px; margin-top: 1px; } 
`;

const SubjectBadge = styled.span` 
    background: ${props => props.$completed ? '#f3e8ff' : '#f8fafc'}; 
    padding: 6px 12px; border-radius: 8px; font-size: 13px; font-weight: 600; color: ${props => props.$completed ? '#7e22ce' : '#475569'}; 
    border: 1px solid ${props => props.$completed ? '#d8b4fe' : '#e2e8f0'}; 
    cursor: pointer; 
    transition: 0.2s;
    &:hover { background: #f1f5f9; }
`;

const FinishButtonWrapper = styled.div` margin-top: auto; padding-top: 25px; `;
const FinishButton = styled.button` width: 100%; padding: 14px; background: white; border: 2px solid #a855f7; color: #a855f7; border-radius: 12px; font-size: 14px; font-weight: 800; cursor: pointer; transition: 0.2s; &:hover { background: #a855f7; color: white; } `;
const RevisitButton = styled(FinishButton)` background: #f8fafc; border: 1px solid #cbd5e1; color: #64748b; &:hover { background: #e2e8f0; border-color: #94a3b8; color: #334155; } `;

const GapCard = styled.div` width: 100%; background: white; padding: 35px; border-radius: 20px; border: 1px solid #e2e8f0; box-shadow: 0 4px 15px rgba(0,0,0,0.02); box-sizing: border-box; `;
const GapGrid = styled.div` display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 30px; @media (max-width: 768px) { grid-template-columns: 1fr; gap: 20px; } `;
const GapHeader = styled.h5` margin-bottom: 15px; font-size: 16px; font-weight: 800; &.green { color: #16a34a; } &.orange { color: #ea580c; } `;
const GapItem = styled.div` margin-bottom: 15px; background: #fff7ed; padding: 12px 15px; border-radius: 10px; strong { display: block; font-size: 14px; color: #9a3412; margin-bottom: 4px; } span { font-size: 13px; color: #ea580c; } `;
const AiFeedback = styled.div` background: #fdf4ff; padding: 25px; border-radius: 16px; text-align: left; border: 1px solid #fae8ff; strong { color: #9333ea; font-size: 16px; font-weight: 800; display: block; margin-bottom: 10px; } p { font-size: 15px; line-height: 1.8; margin: 0; color: #334155; white-space: pre-line; } `;

const NewsGrid = styled.div` width: 100%; display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; `;
const NewsCard = styled.a` display: flex; flex-direction: column; justify-content: space-between; background: white; padding: 20px; border-radius: 16px; border: 1px solid #e2e8f0; text-decoration: none; transition: 0.2s; box-shadow: 0 4px 15px rgba(0,0,0,0.02); &:hover { transform: translateY(-3px); box-shadow: 0 10px 25px rgba(0,0,0,0.06); border-color: #d8b4fe; } h4 { margin: 0 0 15px 0; font-size: 15px; color: #1e293b; line-height: 1.5; font-weight: 700; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; } span { font-size: 13px; color: #a855f7; font-weight: 800; } `;
const FooterSpacer = styled.div` height: 80px; `;
const LoadingContainer = styled.div` text-align: center; margin-top: 100px; `;
const Spinner = styled.div` border: 4px solid #f3f3f3; border-top: 4px solid #a855f7; border-radius: 50%; width: 50px; height: 50px; animation: spin 1s linear infinite; margin: 0 auto 20px; @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } } `;
const LoadingText = styled.p` font-size: 18px; color: #333; font-weight: 600; `;