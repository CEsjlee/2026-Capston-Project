import { useState, useEffect } from 'react';
import styled from 'styled-components';
import api from '../api/axios';

const Activity = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [activities, setActivities] = useState([]); 
  const [trends, setTrends] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('ALL');
  
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ✅ [수정됨] 데이터 로드 로직: 오직 DB만 바라봅니다.
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // 1. 내 로드맵 정보(목표 직무 등) DB에서 가져오기
        const userRes = await api.get('/api/major/my-roadmap');
        
        // 2. DB에 데이터가 확실히 있는 경우에만 실행
        if (userRes.data && userRes.data.targetJob) {
          setUserInfo(userRes.data);
          
          // 2-1. 산업 동향 뉴스 가져오기
          fetchTrends(userRes.data.targetJob);

          // 2-2. 추천 활동 목록 DB에서 가져오기
          const actRes = await api.get('/api/activity/my-list');
          if (actRes.data && actRes.data.length > 0) {
            const mappedData = actRes.data.map((item, index) => ({
              id: item.id || index,
              type: convertCategoryToType(item.category),
              title: item.title,
              organizer: '관련 기관',
              desc: item.description,
              tags: [],
              link: item.link
            }));
            setActivities(mappedData);
          } else {
            setActivities([]);
          }
        } else {
          // 3. DB에 데이터가 없으면(신규 유저) 화면을 깨끗하게 비움
          // 절대 로컬스토리지(이전 유저 흔적)를 확인하지 않음
          handleClearAll();
        }

      } catch (err) {
        // 4. 에러 발생(로그인 안됨 등) 시에도 깨끗하게 비움
        console.log("데이터 로드 실패 또는 신규 유저");
        handleClearAll();
      }
    };

    fetchInitialData();
  }, []);

  // 화면 초기화 함수
  const handleClearAll = () => {
    setUserInfo(null);
    setActivities([]);
    setTrends([]);
    // 혹시 남아있을 수 있는 이전 사용자의 로컬스토리지 흔적 삭제
    localStorage.removeItem('roadmapInputs');
    localStorage.removeItem('roadmapResult');
  };

  const convertCategoryToType = (category) => {
    switch(category) {
        case 'CONTEST': return '공모전';
        case 'INTERN': return '채용';
        case 'LICENSE': return '자격증';
        default: return '대외활동';
    }
  };

  const fetchTrends = async (job) => {
    try {
        if(!job) return;
        const keyword = encodeURIComponent(job + " 채용 동향");
        const newsRes = await api.get(`/api/news/search?keyword=${keyword}`);
        setTrends(newsRes.data);
    } catch(e) { console.error("뉴스 로딩 실패", e); }
  }

  const handleRecommend = async () => {
    // 추천 버튼을 누를 때도 화면에 로드된 userInfo(DB 데이터)를 기준으로 함
    if (!userInfo || !userInfo.targetJob) { 
        alert("먼저 '로드맵' 탭에서 정보를 입력하고 저장해주세요!"); 
        return; 
    }

    setLoading(true);
    try {
      const response = await api.post('/api/activity/recommend', userInfo);
      const mappedData = response.data.activities.map((item, index) => ({
        id: index,
        type: convertCategoryToType(item.category),
        title: item.title,
        organizer: item.category === 'INTERN' ? item.tags[0] || '기업' : '관련 기관',
        desc: item.description,
        tags: item.tags || [],
        link: item.link || `https://www.google.com/search?q=${item.title}`
      }));
      setActivities(mappedData);
      fetchTrends(userInfo.targetJob);
    } catch (error) {
      alert("추천 중 오류가 발생했습니다.");
    } finally { setLoading(false); }
  };

  const openDetail = (activity) => {
    setSelectedActivity(activity);
    setIsModalOpen(true);
  };

  const filtered = activeTab === 'ALL' ? activities : activities.filter(i => i.type === activeTab);

  return (
    <MainContent>
      <HeaderRow>
        <div>
          <PageTitle>✨ 맞춤 활동 추천</PageTitle>
          <PageSubtitle>목표: <strong>{userInfo?.targetJob || '미설정'}</strong></PageSubtitle>
        </div>
        <RefreshButton onClick={handleRecommend} disabled={loading}>
          {loading ? '검색 중...' : '🔄 새로 고침'}
        </RefreshButton>
      </HeaderRow>

      <FilterContainer>
        {['ALL', '공모전', '대외활동', '자격증', '채용'].map(tab => (
          <FilterButton key={tab} $active={activeTab === tab} onClick={() => setActiveTab(tab)}>{tab === 'ALL' ? '전체' : tab}</FilterButton>
        ))}
      </FilterContainer>
      
      <ContentGrid>
        <LeftColumn>
          {activities.length === 0 && !loading && (
             <EmptyStateBox>
                <p>아직 추천된 활동이 없습니다.</p>
                <p style={{fontSize: '14px', marginBottom: '20px'}}>내 로드맵 정보를 바탕으로 딱 맞는 활동을 찾아보세요!</p>
                <StartButton onClick={handleRecommend}>🚀 AI 활동 추천 시작하기</StartButton>
             </EmptyStateBox>
          )}

          {!loading && filtered.map((item) => (
            <ActivityCard key={item.id}>
              <CardHeader>
                <IconWrapper type={item.type}>{item.type === '공모전' ? '🏆' : item.type === '자격증' ? '📜' : '💼'}</IconWrapper>
                <CardInfo><CardTitle>{item.title}</CardTitle><CardOrganizer>{item.organizer}</CardOrganizer></CardInfo>
                <Badge type={item.type}>{item.type}</Badge>
              </CardHeader>
              <CardDesc>{item.desc.substring(0, 80)}...</CardDesc>
              <TagRow>
                <Tags>{item.tags && item.tags.map((t, i) => <Tag key={i}>#{t}</Tag>)}</Tags>
                <DetailButton onClick={() => openDetail(item)}>상세 코칭 ↗</DetailButton>
              </TagRow>
            </ActivityCard>
          ))}
          {loading && <LoadingBox><Spinner /><p>AI가 사용자 맞춤 활동을 검색 중입니다...</p></LoadingBox>}
        </LeftColumn>

        <RightColumn>
            <SectionHeader style={{color:'#7e22ce'}}>📈 실시간 동향</SectionHeader>
            {trends.length > 0 ? trends.map((t, i) => (
              <TrendCard key={i} href={t.link} target="_blank">
                <TrendTitle dangerouslySetInnerHTML={{ __html: t.title }} />
                <TrendFooter><span>{t.publishedAt?.substring(0, 10) || '최신'}</span></TrendFooter>
              </TrendCard>
            )) : (
              <TrendEmptyBox>
                  {userInfo?.targetJob ? '관련 뉴스를 불러오는 중입니다...' : '로드맵을 먼저 작성해주세요.'}
              </TrendEmptyBox>
            )}
        </RightColumn>
      </ContentGrid>
      
      {isModalOpen && selectedActivity && (
        <ModalOverlay onClick={() => setIsModalOpen(false)}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <CloseButton onClick={() => setIsModalOpen(false)}>&times;</CloseButton>
            <ModalHeader>
                <Badge type={selectedActivity.type}>{selectedActivity.type}</Badge>
                <ModalTitle>{selectedActivity.title}</ModalTitle>
                <ModalOrganizer>{selectedActivity.organizer}</ModalOrganizer>
            </ModalHeader>
            <ModalSection>
                <SectionLabel>💡 AI 추천 가이드</SectionLabel>
                <SectionText>{selectedActivity.desc}</SectionText>
            </ModalSection>
            <ModalSection>
                <SectionLabel>🚩 준비 전략</SectionLabel>
                <StrategyList>
                    <li>현재 <strong>{userInfo?.grade || '학년'}</strong>이신 점을 고려할 때, 이 활동은 포트폴리오의 핵심이 될 수 있습니다.</li>
                    <li><strong>{userInfo?.techStacks || '관심 기술'}</strong> 관련 역량을 강조하여 지원서를 작성해보세요.</li>
                    <li>이 활동은 사용자의 목표 직무인 <strong>{userInfo?.targetJob}</strong> 역량 강화에 최적화되어 있습니다.</li>
                </StrategyList>
            </ModalSection>
            <ModalFooter>
                <LinkButton href={selectedActivity.link} target="_blank">
                  🔍 구글에서 상세 정보 검색하기
                </LinkButton>
            </ModalFooter>
          </ModalContent>
        </ModalOverlay>
      )}
    </MainContent>
  );
};

export default Activity;

// --- 스타일 컴포넌트 ---
const MainContent = styled.div` flex: 1; padding: 40px; overflow-y: auto; height: 100vh; box-sizing: border-box; background-color: #f8f9fa; `;
const HeaderRow = styled.div` display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 30px; `;
const PageTitle = styled.h2` font-size: 28px; font-weight: bold; `;
const PageSubtitle = styled.div` font-size: 16px; color: #666; strong { color: #a855f7; } `;
const RefreshButton = styled.button` background: #a855f7; color: white; padding: 12px 24px; border: none; border-radius: 12px; font-weight: bold; cursor: pointer; transition: 0.2s; &:hover { background: #9333ea; } `;
const FilterContainer = styled.div` display: flex; gap: 10px; margin-bottom: 30px; `;
const FilterButton = styled.button` padding: 10px 20px; border-radius: 20px; border: 1px solid ${props => props.$active ? '#a855f7' : '#eee'}; background: ${props => props.$active ? '#a855f7' : 'white'}; color: ${props => props.$active ? 'white' : '#666'}; cursor: pointer; `;
const ContentGrid = styled.div` display: grid; grid-template-columns: 2fr 1fr; gap: 30px; `;
const LeftColumn = styled.div` display: flex; flex-direction: column; gap: 20px; `;
const RightColumn = styled.div` display: flex; flex-direction: column; gap: 20px; `;
const SectionHeader = styled.h3` font-size: 18px; color: #333; margin-bottom: 15px; font-weight: bold; `;
const ActivityCard = styled.div` background: white; border-radius: 16px; padding: 25px; border: 1px solid #eee; transition: 0.2s; &:hover { transform: translateY(-3px); box-shadow: 0 5px 15px rgba(0,0,0,0.05); } `;
const CardHeader = styled.div` display: flex; align-items: flex-start; gap: 15px; margin-bottom: 15px; `;
const IconWrapper = styled.div` width: 48px; height: 48px; border-radius: 12px; display: flex; justify-content: center; align-items: center; font-size: 24px; background: #f3e8ff; `;
const CardInfo = styled.div` flex: 1; `;
const CardTitle = styled.h4` font-size: 18px; font-weight: bold; margin-bottom: 5px; `;
const CardOrganizer = styled.div` font-size: 13px; color: #888; `;
const Badge = styled.span` padding: 4px 10px; border-radius: 8px; font-size: 12px; font-weight: bold; background: #f3e8ff; color: #7e22ce; `;
const CardDesc = styled.p` font-size: 15px; color: #555; margin-bottom: 25px; line-height: 1.6; `;
const TagRow = styled.div` display: flex; justify-content: space-between; align-items: center; `;
const Tags = styled.div` display: flex; gap: 6px; `;
const Tag = styled.span` background: #f3f4f6; color: #666; padding: 4px 10px; border-radius: 6px; font-size: 12px; `;
const DetailButton = styled.button` background: white; border: 1px solid #ddd; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-weight: bold; transition: 0.2s; &:hover { background: #f9fafb; border-color: #a855f7; color: #a855f7; } `;
const TrendCard = styled.a` display: block; background: white; border-radius: 16px; padding: 20px; border: 1px solid #eee; margin-bottom: 15px; text-decoration: none; &:hover { border-color: #a855f7; } `;
const TrendTitle = styled.h4` font-size: 15px; color: #333; font-weight: bold; `;
const TrendFooter = styled.div` font-size: 12px; color: #999; margin-top: 10px; `;
const TrendEmptyBox = styled.div` padding: 20px; text-align: center; color: #999; `;
const LoadingBox = styled.div` text-align: center; padding: 40px; `;
const Spinner = styled.div` width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #a855f7; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 20px; @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } } `;
const EmptyStateBox = styled.div` background: white; padding: 60px 40px; border-radius: 16px; text-align: center; border: 1px dashed #ccc; p { margin-bottom: 10px; font-size: 18px; color: #555; font-weight: bold; } `;
const StartButton = styled.button` background: #a855f7; color: white; padding: 14px 28px; font-size: 16px; font-weight: bold; border: none; border-radius: 12px; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 6px rgba(168, 85, 247, 0.3); &:hover { background: #9333ea; transform: translateY(-2px); box-shadow: 0 6px 12px rgba(168, 85, 247, 0.4); } `;
const ModalOverlay = styled.div` position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 1000; `;
const ModalContent = styled.div` background: white; width: 90%; max-width: 500px; padding: 40px; border-radius: 24px; position: relative; `;
const CloseButton = styled.button` position: absolute; top: 20px; right: 20px; background: none; border: none; font-size: 28px; cursor: pointer; color: #999; `;
const ModalHeader = styled.div` margin-bottom: 25px; border-bottom: 1px solid #eee; padding-bottom: 20px; `;
const ModalTitle = styled.h3` font-size: 22px; margin-top: 10px; color: #1a1a1a; `;
const ModalOrganizer = styled.p` color: #666; font-size: 14px; margin-top: 5px; `;
const ModalSection = styled.div` margin-bottom: 25px; `;
const SectionLabel = styled.h4` font-size: 15px; color: #a855f7; margin-bottom: 10px; font-weight: bold; `;
const SectionText = styled.p` font-size: 15px; line-height: 1.6; color: #444; background: #f9f9f9; padding: 15px; border-radius: 12px; `;
const StrategyList = styled.ul` padding-left: 20px; li { margin-bottom: 8px; font-size: 14px; color: #555; line-height: 1.5; } `;
const ModalFooter = styled.div` margin-top: 30px; `;
const LinkButton = styled.a` display: block; width: 100%; padding: 16px; background: #a855f7; color: white; border-radius: 12px; text-decoration: none; text-align: center; font-weight: bold; font-size: 16px; box-sizing: border-box; transition: 0.2s; &:hover { background: #9333ea; transform: translateY(-2px); } `;