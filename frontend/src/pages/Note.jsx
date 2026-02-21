import { useState } from 'react';
import styled from 'styled-components';

const Note = () => {
  const [activeSubject, setActiveSubject] = useState('전체 보기');
  const [searchTerm, setSearchTerm] = useState('');

  // 과목 목록
  const subjects = ['전체 보기', '자료구조', '알고리즘', '데이터베이스', '웹 프로그래밍'];

  // 노트 데이터 (스크린샷 내용 반영)
  const notes = [
    {
      id: 1,
      subject: '자료구조',
      date: '2026-01-08',
      title: '스택과 큐',
      content: `# 스택 (Stack)\n- LIFO (Last In First Out) 구조\n- push(), pop(), peek() 연산\n- 사용 예: 함수 호출 스택, 괄호 검사\n\n# 큐 (Queue)\n- FIFO (First In First Out) 구조\n- enqueue(), dequeue() 연산\n- 사용 예: BFS, 프린터 대기열`,
      tags: ['#스택', '#큐', '#자료구조']
    },
    {
      id: 2,
      subject: '알고리즘',
      date: '2026-01-05',
      title: '정렬 알고리즘',
      content: `# 버블 정렬\n- 시간복잡도: O(n^2)\n- 인접한 원소 비교 및 교환\n\n# 퀵 정렬\n- 시간복잡도: 평균 O(n log n), 최악 O(n^2)\n- 분할 정복 기법\n- pivot 선택이 중요`,
      tags: ['#정렬', '#알고리즘', '#시간복잡도']
    },
    {
      id: 3,
      subject: '데이터베이스',
      date: '2026-01-03',
      title: 'SQL JOIN',
      content: `# INNER JOIN\n- 두 테이블의 교집합\n- 매칭되는 레코드만 반환\n\n# LEFT JOIN\n- 왼쪽 테이블의 모든 레코드\n- 오른쪽 테이블에서 매칭되는 레코드\n\n실습 예제:\nSELECT * FROM users\nINNER JOIN orders ON users.id = orders.user_id;`,
      tags: ['#SQL', '#JOIN', '#데이터베이스']
    }
  ];

  // 필터링 로직
  const filteredNotes = notes.filter(note => {
    const subjectMatch = activeSubject === '전체 보기' || note.subject === activeSubject;
    const searchMatch = note.title.toLowerCase().includes(searchTerm.toLowerCase());
    return subjectMatch && searchMatch;
  });

  return (
    <Container>
      {/* 헤더 영역 */}
      <PageHeader>
        <div>
          <PageTitle>학습 노트</PageTitle>
          <PageSubtitle>과목별 학습 내용을 정리하고 복습하세요</PageSubtitle>
        </div>
        <CreateButton>+ 새 노트 작성</CreateButton>
      </PageHeader>

      <ContentGrid>
        {/* 왼쪽: 필터 및 통계 */}
        <LeftColumn>
          {/* 수강 과목 필터 */}
          <FilterCard>
            <CardHeader>📖 수강 과목</CardHeader>
            <SubjectList>
              {subjects.map((subject) => (
                <SubjectItem 
                  key={subject} 
                  active={activeSubject === subject}
                  onClick={() => setActiveSubject(subject)}
                >
                  {subject}
                </SubjectItem>
              ))}
            </SubjectList>
          </FilterCard>

          {/* 학습 통계 */}
          <StatsCard>
            <CardHeader>📊 학습 통계</CardHeader>
            <StatRow>
              <span>총 노트 수</span>
              <strong>{notes.length}개</strong>
            </StatRow>
            <StatRow>
              <span>과목 수</span>
              <strong>{subjects.length - 1}개</strong>
            </StatRow>
          </StatsCard>
        </LeftColumn>

        {/* 오른쪽: 노트 리스트 */}
        <RightColumn>
          <SearchBarWrapper>
            <SearchInput 
              placeholder="🔍 노트 검색..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchBarWrapper>

          <NoteList>
            {filteredNotes.length > 0 ? (
              filteredNotes.map((note) => (
                <NoteCard key={note.id}>
                  <NoteHeader>
                    <SubjectBadge type={note.subject}>{note.subject}</SubjectBadge>
                    <NoteDate>📅 {note.date}</NoteDate>
                    <ActionButtons>
                      <IconButton>📝</IconButton>
                      <IconButton>🗑️</IconButton>
                    </ActionButtons>
                  </NoteHeader>
                  
                  <NoteTitle>{note.title}</NoteTitle>
                  
                  {/* 코드 블록 느낌의 내용 미리보기 */}
                  <NoteContentPreview>
                    {note.content}
                  </NoteContentPreview>

                  <TagContainer>
                    {note.tags.map((tag, index) => (
                      <Tag key={index}>{tag}</Tag>
                    ))}
                  </TagContainer>
                </NoteCard>
              ))
            ) : (
              <EmptyMessage>작성된 노트가 없습니다.</EmptyMessage>
            )}
          </NoteList>
        </RightColumn>
      </ContentGrid>
    </Container>
  );
};

export default Note;

// 스타일 컴포넌트

const Container = styled.div`
  flex: 1;
  padding: 40px;
  overflow-y: auto;
  height: 100vh;
  box-sizing: border-box;
  background-color: #f8f9fc;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
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

const CreateButton = styled.button`
  background: #a855f7;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s;
  &:hover { background: #9333ea; }
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 30px;
`;

const LeftColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FilterCard = styled.div`
  background: white;
  padding: 20px;
  border-radius: 16px;
  border: 1px solid #eee;
`;

const StatsCard = styled.div`
  background: #fdf4ff;
  padding: 20px;
  border-radius: 16px;
  border: 1px solid #f0abfc;
`;

const CardHeader = styled.h4`
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SubjectList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const SubjectItem = styled.div`
  padding: 12px 15px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  color: ${props => props.active ? 'white' : '#666'};
  font-weight: ${props => props.active ? 'bold' : 'normal'};
  background: ${props => props.active ? 'linear-gradient(90deg, #a855f7, #d946ef)' : 'transparent'};
  transition: all 0.2s;
  
  &:hover {
    background: ${props => props.active ? '' : '#f3f4f6'};
  }
`;

const StatRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 14px;
  color: #666;
  strong {
    color: #a855f7;
  }
  &:last-child { margin-bottom: 0; }
`;


const RightColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const SearchBarWrapper = styled.div`
  width: 100%;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 14px 20px;
  border-radius: 12px;
  border: 1px solid #eee;
  outline: none;
  font-size: 14px;
  background: white;
  box-sizing: border-box;
  &:focus {
    border-color: #a855f7;
  }
`;

const NoteList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const NoteCard = styled.div`
  background: white;
  padding: 25px;
  border-radius: 16px;
  border: 1px solid #eee;
  box-shadow: 0 2px 8px rgba(0,0,0,0.03);
  transition: transform 0.2s;
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0,0,0,0.05);
  }
`;

const NoteHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 15px;
`;

const SubjectBadge = styled.span`
  background: #f3e8ff;
  color: #7e22ce;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: bold;
  margin-right: 10px;
`;

const NoteDate = styled.span`
  font-size: 13px;
  color: #888;
  flex: 1;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
`;

const IconButton = styled.button`
  background: white;
  border: 1px solid #eee;
  border-radius: 6px;
  padding: 6px;
  cursor: pointer;
  font-size: 14px;
  &:hover { background: #f9fafb; }
`;

const NoteTitle = styled.h3`
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: 15px;
`;

const NoteContentPreview = styled.div`
  background: #f9fafb;
  padding: 15px;
  border-radius: 8px;
  font-size: 14px;
  line-height: 1.6;
  color: #4b5563;
  white-space: pre-wrap; /* 줄바꿈 유지 */
  font-family: monospace; /* 코드 느낌 폰트 */
  margin-bottom: 15px;
  max-height: 150px;
  overflow: hidden;
  position: relative;
  border: 1px solid #f3f4f6;
`;

const TagContainer = styled.div`
  display: flex;
  gap: 8px;
`;

const Tag = styled.span`
  background: white;
  border: 1px solid #eee;
  color: #666;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
`;

const EmptyMessage = styled.div`
  text-align: center;
  color: #aaa;
  padding: 40px;
  font-size: 15px;
`;