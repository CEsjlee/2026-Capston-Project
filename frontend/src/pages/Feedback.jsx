import styled from 'styled-components';

const Feedback = () => {

  // 1. 로드맵 달성 여부 데이터
  const achievements = [
    { category: "학업 성취", title: "전공 기초 과목 이수", desc: "자료구조, 알고리즘, 데이터베이스 과목 완료", status: "완료", color: "green" },
    { category: "프로젝트 경험", title: "팀 프로젝트 참여", desc: "현재 웹 개발 프로젝트 진행 중 (진행률 60%)", status: "진행 중", color: "blue" },
    { category: "대외활동", title: "공모전 참여", desc: "아직 공모전 참여 경험 없음", status: "미시작", color: "orange" },
    { category: "자격증", title: "정보처리기사 자격증", desc: "필기 합격, 실기 준비 중", status: "진행 중", color: "blue" },
  ];

  // 2. 미달성 원인 및 보완점 데이터
  const analysis = [
    {
      icon: "📊",
      title: "공모전 참여 부족",
      problem: "목표 기업들이 요구하는 실무 프로젝트 경험을 쌓기 위해 공모전 참여가 필요합니다.",
      solutionTitle: "💡 개선 방안",
      solutions: [
        "이번 학기 내 최소 1개 이상의 공모전 참여 목표 설정",
        "관심 분야의 공모전 일정을 미리 확인하고 팀 구성",
        "소규모 해커톤부터 시작하여 경험 축적"
      ],
      theme: "orange" // 스타일 테마
    },
    {
      icon: "☁️",
      title: "클라우드 기술 역량 부족",
      problem: "네이버, 카카오 등 목표 기업에서 AWS, Docker 등 클라우드 기술을 필수로 요구합니다.",
      solutionTitle: "⚡ 개선 방안",
      solutions: [
        "다음 학기 '클라우드 컴퓨팅' 과목 수강",
        "개인 프로젝트를 AWS EC2에 배포하며 실습",
        "Docker와 Kubernetes 기초 온라인 강의 수강"
      ],
      theme: "blue"
    }
  ];

  // 3. 부족 역량 강화 추천 데이터
  const skills = [
    {
      name: "Backend Development",
      progress: 60,
      materials: ["Spring Boot 심화 학습 (인프런 강의 추천)", "실전 프로젝트: REST API 설계 및 구현", "JPA/Hibernate ORM 학습"]
    },
    {
      name: "Database",
      progress: 70,
      materials: ["MySQL 쿼리 최적화 학습", "NoSQL(MongoDB) 기초 학습", "인덱싱 및 성능 튜닝 실습"]
    },
    {
      name: "Cloud & DevOps",
      progress: 30,
      materials: ["AWS Fundamentals 강의 수강", "Docker 컨테이너 기술 학습", "CI/CD 파이프라인 구축 실습"]
    }
  ];

  return (
    <Container>
      {/* 헤더 */}
      <PageHeader>
        <PageTitle>피드백</PageTitle>
        <PageSubtitle>진로 로드맵 피드백</PageSubtitle>
      </PageHeader>

      {/* 섹션 1: 로드맵 달성 여부 분석 */}
      <SectionTitle>🎯 로드맵 달성 여부 분석</SectionTitle>
      <AchievementGrid>
        {achievements.map((item, index) => (
          <AchievementCard key={index}>
            <CardTop>
              <CategoryIcon className={item.color}>
                {item.category === '학업 성취' && '✅'}
                {item.category === '프로젝트 경험' && '📈'}
                {item.category === '대외활동' && '🏆'}
                {item.category === '자격증' && '📜'}
              </CategoryIcon>
              <div>
                <CategoryName>{item.category}</CategoryName>
                <CardTitle>{item.title}</CardTitle>
              </div>
              <StatusBadge className={item.color}>{item.status}</StatusBadge>
            </CardTop>
            <CardDesc>{item.desc}</CardDesc>
          </AchievementCard>
        ))}
      </AchievementGrid>

      {/* 섹션 2: 미달성 원인 분석 및 보완점 */}
      <SectionTitle>① 미달성 원인 분석 및 보완점</SectionTitle>
      <AnalysisContainer>
        {analysis.map((item, index) => (
          <AnalysisCard key={index}>
            <AnalysisHeader>
              <AnalysisIcon>{item.icon}</AnalysisIcon>
              <AnalysisTitle>{item.title}</AnalysisTitle>
            </AnalysisHeader>
            <ProblemText>{item.problem}</ProblemText>
            
            <SolutionBox className={item.theme}>
              <SolutionTitle className={item.theme}>{item.solutionTitle}</SolutionTitle>
              <SolutionList>
                {item.solutions.map((sol, i) => (
                  <li key={i}>{sol}</li>
                ))}
              </SolutionList>
            </SolutionBox>
          </AnalysisCard>
        ))}
      </AnalysisContainer>

      {/* 섹션 3: 부족 역량 강화를 위한 추천 */}
      <SectionTitle>📈 부족 역량 강화를 위한 추천</SectionTitle>
      <SkillList>
        {skills.map((skill, index) => (
          <SkillCard key={index}>
            <SkillHeader>
              <SkillName>{skill.name}</SkillName>
              <ProgressInfo>현재 <ProgressBar><Progress width={skill.progress} /></ProgressBar> {skill.progress}%</ProgressInfo>
            </SkillHeader>
            <MaterialBox>
              <MaterialTitle>📖 추천 학습 자료</MaterialTitle>
              <MaterialList>
                {skill.materials.map((mat, i) => <li key={i}>{mat}</li>)}
              </MaterialList>
            </MaterialBox>
          </SkillCard>
        ))}
      </SkillList>

      {/* 섹션 4: 이번 학기 추천 활동 */}
      <SectionTitle style={{color: '#a855f7'}}>🏅 이번 학기 추천 활동</SectionTitle>
      <RecommendationCard>
        <RecGrid>
          <div>
            <RecCategory>공모전</RecCategory>
            <RecList>
              <li>공개SW 컨트리뷰톤 (마감: 2026-03-15)</li>
              <li>AI 해커톤 2026 (마감: 2026-03-30)</li>
            </RecList>
          </div>
          <Divider />
          <div>
            <RecCategory>자격증</RecCategory>
            <RecList>
              <li>AWS Solutions Architect (추천)</li>
              <li>정보처리기사 실기 (마감: 2026-04-30)</li>
            </RecList>
          </div>
        </RecGrid>
      </RecommendationCard>

      <FooterSpacer />
    </Container>
  );
};

export default Feedback;

// 스타일 컴포넌트

const Container = styled.div`
  flex: 1;
  padding: 40px;
  overflow-y: auto;
  height: 100vh;
  box-sizing: border-box;
  background-color: #f8f9fc;
`;

const PageHeader = styled.div` margin-bottom: 40px; `;
const PageTitle = styled.h2` font-size: 28px; color: #333; font-weight: bold; margin-bottom: 8px; `;
const PageSubtitle = styled.p` font-size: 16px; color: #666; `;

const SectionTitle = styled.h3`
  font-size: 18px;
  color: #333;
  margin: 40px 0 20px 0;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: bold;
`;

// 1. 성과표
const AchievementGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
`;
const AchievementCard = styled.div`
  background: white;
  padding: 25px;
  border-radius: 16px;
  border: 1px solid #eee;
  box-shadow: 0 2px 8px rgba(0,0,0,0.02);
`;
const CardTop = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 15px;
  position: relative;
`;
const CategoryIcon = styled.div`
  width: 40px; height: 40px; border-radius: 50%; display: flex; justify-content: center; align-items: center; font-size: 20px;
  &.green { background: #dcfce7; color: #166534; }
  &.blue { background: #dbeafe; color: #1e40af; }
  &.orange { background: #ffedd5; color: #c2410c; }
`;
const CategoryName = styled.div` font-size: 12px; color: #888; margin-bottom: 4px; `;
const CardTitle = styled.h4` font-size: 16px; font-weight: bold; color: #333; `;
const StatusBadge = styled.span`
  margin-left: auto; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: bold;
  &.green { background: #dcfce7; color: #166534; }
  &.blue { background: #dbeafe; color: #1e40af; }
  &.orange { background: #ffedd5; color: #c2410c; }
`;
const CardDesc = styled.p` font-size: 14px; color: #666; margin-left: 52px; `;

// 2. 분석
const AnalysisContainer = styled.div` display: flex; flex-direction: column; gap: 20px; `;
const AnalysisCard = styled.div` background: white; padding: 30px; border-radius: 16px; border: 1px solid #eee; `;
const AnalysisHeader = styled.div` display: flex; align-items: center; gap: 10px; margin-bottom: 10px; `;
const AnalysisIcon = styled.span` font-size: 20px; `;
const AnalysisTitle = styled.h4` font-size: 18px; font-weight: bold; color: #333; `;
const ProblemText = styled.p` font-size: 15px; color: #555; margin-bottom: 20px; line-height: 1.5; padding-left: 34px;`;
const SolutionBox = styled.div`
  padding: 20px; border-radius: 12px; margin-left: 34px;
  &.orange { background: #fff7ed; border: 1px solid #ffedd5; }
  &.blue { background: #eff6ff; border: 1px solid #dbeafe; }
`;
const SolutionTitle = styled.h5`
  font-size: 14px; font-weight: bold; margin-bottom: 10px;
  &.orange { color: #c2410c; }
  &.blue { color: #1e40af; }
`;
const SolutionList = styled.ul`
  padding-left: 20px; margin: 0;
  li { font-size: 14px; color: #444; margin-bottom: 6px; line-height: 1.5; }
  &.orange li::marker { color: #ea580c; }
  &.blue li::marker { color: #2563eb; }
`;

// 3. 역량
const SkillList = styled.div` display: flex; flex-direction: column; gap: 20px; `;
const SkillCard = styled.div` background: white; padding: 25px; border-radius: 16px; border: 1px solid #eee; `;
const SkillHeader = styled.div` display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid #f0f0f0; padding-bottom: 15px; `;
const SkillName = styled.h4` font-size: 18px; font-weight: bold; color: #333; `;
const ProgressInfo = styled.div` display: flex; align-items: center; gap: 10px; font-size: 14px; color: #666; font-weight: bold; `;
const ProgressBar = styled.div` width: 100px; height: 8px; background: #eee; border-radius: 4px; overflow: hidden; `;
const Progress = styled.div` height: 100%; width: ${props => props.width}%; background: linear-gradient(90deg, #a855f7, #d946ef); border-radius: 4px; `;
const MaterialBox = styled.div` padding-left: 10px; `;
const MaterialTitle = styled.div` font-size: 14px; font-weight: bold; color: #6b21a8; margin-bottom: 10px; `;
const MaterialList = styled.ul`
  padding-left: 20px; margin: 0;
  li { font-size: 14px; color: #555; margin-bottom: 6px; }
  li::marker { color: #a855f7; }
`;

// 4. 추천
const RecommendationCard = styled.div` background: white; padding: 30px; border-radius: 16px; border: 1px solid #f0abfc; background: #fdf4ff; `;
const RecGrid = styled.div` display: flex; align-items: flex-start; gap: 40px; `;
const RecCategory = styled.h5` font-size: 16px; font-weight: bold; color: #333; margin-bottom: 12px; `;
const RecList = styled.ul`
  padding-left: 20px; margin: 0;
  li { font-size: 14px; color: #555; margin-bottom: 8px; }
`;
const Divider = styled.div` width: 1px; height: 80px; background: #e5e7eb; `;
const FooterSpacer = styled.div` height: 50px; `;