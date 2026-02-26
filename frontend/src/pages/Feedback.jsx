import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/axios';

const Feedback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const targetGrade = searchParams.get('grade'); 

  const [loading, setLoading] = useState(true);
  const [roadmapInfo, setRoadmapInfo] = useState(null);
  const [analysisData, setAnalysisData] = useState(null);
  
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [missedItems, setMissedItems] = useState([]); 
  const [completedItems, setCompletedItems] = useState([]);

  const categoryMap = { goal: "🎯 목표", courses: "📚 강의", activities: "🏃 활동" };

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const res = await api.get('/api/major/my-roadmap');
        if (res.data) {
          setRoadmapInfo(res.data);

          if (res.data.analysisResult) {
            try {
              const parsedAnalysis = JSON.parse(res.data.analysisResult);
              setAnalysisData(parsedAnalysis.analysis || parsedAnalysis);
            } catch(e) { }
          }

          if (res.data.roadmapJson) {
            let semesterPlans = JSON.parse(res.data.roadmapJson);
            if (!Array.isArray(semesterPlans)) semesterPlans = semesterPlans.semesterPlans || [];
            
            const finished = semesterPlans.filter(s => s.isFinished);
            
            // ✅ 복잡한 선택 로직 제거: URL로 넘어온 학기가 있으면 띄워주고, 아니면 무조건 '가장 최근에 결산한 학기'를 띄움
            let targetSem = targetGrade 
              ? finished.find(s => s.grade === targetGrade) || finished.pop()
              : finished.pop(); 

            if (targetSem) {
              setSelectedSemester(targetSem);
              const missed = []; const completed = [];
              ['goal', 'courses', 'activities'].forEach(cat => {
                if (targetSem[cat]) {
                  targetSem[cat].forEach(item => {
                    const isDone = typeof item === 'object' ? item.isCompleted : false;
                    const text = typeof item === 'object' ? item.content : item;
                    if (isDone) completed.push({ category: cat, content: text });
                    else missed.push({ category: cat, content: text });
                  });
                }
              });
              setMissedItems(missed);
              setCompletedItems(completed);
            }
          }
        }
      } catch (err) { } finally { setLoading(false); }
    };
    fetchFeedback();
  }, [targetGrade]);

  if (loading) return <Container><ContentWrap><LoadingMsg><Spinner />AI가 리포트를 불러오는 중입니다... 🧠</LoadingMsg></ContentWrap></Container>;
  if (!roadmapInfo || !selectedSemester) return <Container><ContentWrap><EmptyMsg>아직 결산이 완료된 학기가 없습니다.<br/>로드맵 탭에서 학기를 결산해 보세요!</EmptyMsg></ContentWrap></Container>;

  return (
    <Container>
      <ContentWrap>
        <PageHeader>
          <PageTitle>📊 피드백</PageTitle>
          <PageSubtitle><strong>{roadmapInfo.name || '사용자'}</strong>님의 전문 역량 진단 결과</PageSubtitle>
        </PageHeader>

        <SectionTitle>🎯 {selectedSemester.grade} 달성도 분석</SectionTitle>
        
        <ReportCard>
          <ReportHeader>
            {/* ✅ Performance Summary -> 핵심 성과 요약 변경 */}
            <TitleBadge>핵심 성과 요약</TitleBadge>
            <ScoreBadge>이행률 {Math.round((completedItems.length / ((completedItems.length + missedItems.length) || 1)) * 100)}%</ScoreBadge>
          </ReportHeader>
          
          <AchievementGrid>
            <AchievementBox className="missed">
              <BoxHeader>🚨 보완이 필요한 항목 ({missedItems.length})</BoxHeader>
              {missedItems.length > 0 ? (
                <List>
                  {missedItems.map((item, i) => (
                    <li key={i}><span className="tag">{categoryMap[item.category]}</span> {item.content}</li>
                  ))}
                </List>
              ) : <p className="empty">모든 계획을 완수했습니다! 🎉</p>}
            </AchievementBox>

            <AchievementBox className="completed">
              <BoxHeader>✅ 완료한 핵심 성과 ({completedItems.length})</BoxHeader>
              <TagList>
                {completedItems.map((item, i) => <Tag key={i}>{item.content}</Tag>)}
              </TagList>
            </AchievementBox>
          </AchievementGrid>
        </ReportCard>

        <SectionTitle>📈 AI 멘토의 종합 진단</SectionTitle>
        <AiConsultingCard>
          <ConsultingHeader>
            <BotIcon>🤖</BotIcon>
            {/* ✅ Expert Review -> AI 멘토 총평 변경 */}
            <ConsultingTitle>AI 멘토 총평</ConsultingTitle>
          </ConsultingHeader>
          <ConsultingText>"{analysisData?.overallReview || "결산 정보를 토대로 피드백을 준비 중입니다!"}"</ConsultingText>
          
          <Divider style={{margin: '25px 0'}} />
          
          <GapGrid>
            <div>
              <GapHeader className="green">● 보유 중인 강점</GapHeader>
              <List style={{paddingLeft: '15px', listStyle: 'disc'}}>{analysisData?.strengths?.map((s, i) => <li key={i} style={{color: '#444', marginBottom: '8px'}}>{s}</li>)}</List>
            </div>
            <div>
              <GapHeader className="orange">● 보완이 필요한 역량</GapHeader>
              {analysisData?.gaps?.missing?.map((m, i) => (
                <GapItem key={i}><strong>{m.name}</strong><span>{m.method}</span></GapItem>
              ))}
            </div>
          </GapGrid>
        </AiConsultingCard>

        {analysisData?.topMissions && (
          <MissionSection>
            <SectionHeader><TitleIcon>🔥</TitleIcon><h3 style={{margin:0}}>당장 시작해야 할 핵심 미션 Top 3</h3></SectionHeader>
            <MissionList>
              {analysisData.topMissions.map((m, i) => (
                <MissionItem key={i}><MissionNumber>{i+1}</MissionNumber><MissionText>{m}</MissionText></MissionItem>
              ))}
            </MissionList>
          </MissionSection>
        )}

        {analysisData?.recommendedResources && (
          <ResourceSection>
            <SectionHeader><TitleIcon>📚</TitleIcon><h3 style={{margin:0}}>맞춤형 추천 학습 리소스</h3></SectionHeader>
            <ResourceGrid>
              {analysisData.recommendedResources.map((r, i) => (
                <ResourceCard key={i}>
                  <ResourceType>{r.type}</ResourceType>
                  <ResourceTitle>{r.title}</ResourceTitle>
                  <ResourceReason>💡 {r.reason}</ResourceReason>
                </ResourceCard>
              ))}
            </ResourceGrid>
          </ResourceSection>
        )}

        <FooterSpacer />
      </ContentWrap>
    </Container>
  );
};

export default Feedback;

// --- Styled Components ---
const Container = styled.div` flex: 1; padding: 40px; overflow-y: auto; background: #f8f9fa; height: 100vh; box-sizing: border-box; display: flex; flex-direction: column; align-items: center; `;
const ContentWrap = styled.div` width: 100%; max-width: 1000px; display: flex; flex-direction: column; `;

const PageHeader = styled.div` margin-bottom: 35px; border-left: 5px solid #a855f7; padding-left: 20px; `;
const PageTitle = styled.h2` font-size: 26px; color: #1e293b; font-weight: 800; margin: 0 0 8px 0; `;
const PageSubtitle = styled.p` font-size: 15px; color: #64748b; margin: 0; strong { color: #a855f7; } `;

const SectionTitle = styled.h3` font-size: 19px; margin: 40px 0 20px; font-weight: 800; color: #1e293b; display: flex; align-items: center; gap: 10px; `;

const ReportCard = styled.div` background: white; padding: 30px; border-radius: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.03); border: 1px solid #e2e8f0; `;
const ReportHeader = styled.div` display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; border-bottom: 1px solid #f1f5f9; padding-bottom: 20px; `;
const TitleBadge = styled.span` background: #f1f5f9; color: #475569; padding: 6px 12px; border-radius: 6px; font-size: 13px; font-weight: 800; `;
const ScoreBadge = styled.span` background: linear-gradient(135deg, #a855f7, #9333ea); color: white; padding: 8px 18px; border-radius: 30px; font-weight: 800; font-size: 15px; box-shadow: 0 4px 10px rgba(168,85,247,0.2); `;

const AchievementGrid = styled.div` display: grid; grid-template-columns: 1fr 1fr; gap: 20px; `;
const AchievementBox = styled.div` 
  padding: 25px; border-radius: 16px; border: 1px solid; 
  &.missed { background: #fff1f2; border-color: #fecdd3; }
  &.completed { background: #f0fdf4; border-color: #bbf7d0; }
  .empty { font-size: 14px; color: #94a3b8; text-align: center; margin-top: 20px; font-weight: bold; }
`;
const BoxHeader = styled.h4` font-size: 15px; font-weight: 800; margin: 0 0 15px 0; color: #1e293b; `;

const List = styled.ul` 
  margin: 0; padding: 0; list-style: none; 
  li { font-size: 14px; color: #334155; margin-bottom: 10px; display: flex; align-items: flex-start; gap: 10px; line-height: 1.5; font-weight: 500; }
  .tag { font-size: 11px; padding: 2px 8px; border-radius: 6px; background: white; border: 1px solid #e2e8f0; white-space: nowrap; font-weight: 800; color: #a855f7; }
`;

const TagList = styled.div` display: flex; flex-wrap: wrap; gap: 8px; `;
const Tag = styled.span` background: white; border: 1px solid #bbf7d0; color: #166534; padding: 8px 14px; border-radius: 8px; font-size: 13px; font-weight: 700; box-shadow: 0 2px 5px rgba(0,0,0,0.02); `;

const AiConsultingCard = styled.div` background: white; border: 1px solid #e9d5ff; border-radius: 20px; padding: 35px; box-shadow: 0 10px 30px rgba(168, 85, 247, 0.05); `;
const ConsultingHeader = styled.div` display: flex; align-items: center; gap: 15px; margin-bottom: 20px; `;
const BotIcon = styled.div` width: 45px; height: 45px; background: #fdf4ff; border-radius: 12px; display: flex; justify-content: center; align-items: center; font-size: 24px; border: 1px solid #f0abfc; `;
const ConsultingTitle = styled.h4` font-size: 18px; font-weight: 800; color: #9333ea; margin: 0; `;
const ConsultingText = styled.p` font-size: 16px; color: #334155; line-height: 1.7; font-weight: 600; font-style: italic; background: #fdfaff; padding: 20px; border-radius: 12px; border-left: 4px solid #a855f7; margin: 0; `;

const GapGrid = styled.div` display: grid; grid-template-columns: 1fr 1fr; gap: 30px; `;
const GapHeader = styled.h5` font-weight: 800; margin: 0 0 15px 0; font-size: 15px; &.green { color: #10b981; } &.orange { color: #f59e0b; } `;
const GapItem = styled.div` margin-bottom: 15px; strong { display: block; font-size: 14px; color: #1e293b; margin-bottom: 4px; } span { font-size: 13px; color: #64748b; line-height: 1.4; } `;

const MissionSection = styled.div` background: white; padding: 35px; border-radius: 20px; border: 1px solid #e2e8f0; margin-top: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.02); `;
const SectionHeader = styled.div` display: flex; align-items: center; gap: 12px; margin-bottom: 25px; h3 { color: #1e293b; } `;
const TitleIcon = styled.span` font-size: 24px; `;
const MissionList = styled.div` display: flex; flex-direction: column; gap: 15px; `;
const MissionItem = styled.div` display: flex; align-items: center; gap: 20px; background: #f8fafc; padding: 20px 25px; border-radius: 15px; border: 1px solid #f1f5f9; transition: 0.2s; &:hover { transform: translateY(-2px); border-color: #a855f7; box-shadow: 0 4px 10px rgba(168,85,247,0.1); } `;
const MissionNumber = styled.div` width: 32px; height: 32px; background: #a855f7; color: white; border-radius: 50%; display: flex; justify-content: center; align-items: center; font-weight: 800; font-size: 14px; flex-shrink: 0; `;
const MissionText = styled.div` font-size: 15px; color: #1e293b; font-weight: 700; line-height: 1.5; `;

const ResourceSection = styled.div` margin-top: 30px; `;
const ResourceGrid = styled.div` display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; `;
const ResourceCard = styled.div` background: white; padding: 25px; border-radius: 18px; border: 1px solid #e2e8f0; display: flex; flex-direction: column; transition: 0.2s; box-shadow: 0 4px 10px rgba(0,0,0,0.02); &:hover { border-color: #a855f7; transform: translateY(-3px); box-shadow: 0 10px 20px rgba(168,85,247,0.1); } `;
const ResourceType = styled.span` font-size: 11px; font-weight: 800; background: #e0f2fe; color: #0369a1; padding: 6px 12px; border-radius: 6px; align-self: flex-start; margin-bottom: 15px; `;
const ResourceTitle = styled.h4` font-size: 16px; font-weight: 800; color: #1e293b; margin: 0 0 12px 0; line-height: 1.4; `;
const ResourceReason = styled.p` font-size: 13.5px; color: #475569; background: #f8fafc; padding: 15px; border-radius: 12px; line-height: 1.6; margin: auto 0 0 0; border: 1px solid #f1f5f9; `;

const Divider = styled.div` height: 1px; background: #f1f5f9; width: 100%; `;
const InfoBox = styled.div` padding: 50px; background: #f1f5f9; border-radius: 20px; color: #64748b; text-align: center; font-weight: 700; border: 1px dashed #cbd5e1; `;
const FooterSpacer = styled.div` height: 80px; `;

const LoadingMsg = styled.div` display: flex; flex-direction: column; align-items: center; margin-top: 150px; font-size: 18px; font-weight: 800; color: #333; `;
const Spinner = styled.div` border: 4px solid #f1f5f9; border-top: 4px solid #a855f7; border-radius: 50%; width: 50px; height: 50px; animation: spin 1s linear infinite; margin-bottom: 20px; @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } } `;
const EmptyMsg = styled.div` margin-top: 150px; text-align: center; font-size: 18px; color: #64748b; font-weight: bold; line-height: 1.6; `;