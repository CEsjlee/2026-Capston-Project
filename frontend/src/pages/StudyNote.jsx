import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import ReactMarkdown from 'react-markdown';
import styled, { createGlobalStyle, keyframes } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  ::-webkit-scrollbar { width: 8px; height: 8px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #d8b4fe; border-radius: 10px; }
`;

const fadeIn = keyframes` from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } `;
const slideUp = keyframes` from { transform: translate(-50%, 20px); opacity: 0; } to { transform: translate(-50%, 0); opacity: 1; } `;

const StudyNote = () => {
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [sortOrder, setSortOrder] = useState('DESC'); 
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('CREATE');
  const [noteForm, setNoteForm] = useState({ id: null, title: '', category: '', content: '' });

  const [isAiOpen, setIsAiOpen] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const fetchNotes = async () => {
    try {
      const response = await axios.get('/api/notes');
      const mappedNotes = response.data.map(note => ({
        ...note,
        realId: note.id || note.noteId || note.note_id || note.no
      }));
      setNotes(mappedNotes);
      if (selectedNote) {
        const updated = mappedNotes.find(n => n.realId === selectedNote.realId);
        if (updated) setSelectedNote(updated);
      }
    } catch (error) {
      console.error("로드 실패:", error);
    }
  };

  useEffect(() => { fetchNotes(); }, []);

  const handleSave = async () => {
    if (!noteForm.title || !noteForm.content || !noteForm.category) {
      showToast("모든 항목을 입력해주세요!", "error");
      return;
    }
    try {
      const payload = { title: noteForm.title, category: noteForm.category, content: noteForm.content };
      if (modalMode === 'CREATE') {
        await axios.post('/api/notes', payload);
        showToast("노트가 저장되었습니다! 📝");
        setSelectedNote(null); 
      } else {
        await axios.put(`/api/notes/${noteForm.id}`, payload);
        showToast("노트가 수정되었습니다! ✨");
      }
      setIsModalOpen(false);
      fetchNotes();
    } catch (error) { showToast("저장 실패", "error"); }
  };

  const handleDelete = async (e, noteId) => {
    e.stopPropagation();
    if (!window.confirm("이 노트를 정말 삭제하시겠습니까?")) return;
    try {
      await axios.delete(`/api/notes/${noteId}`);
      showToast("노트가 삭제되었습니다.", "error");
      if (selectedNote?.realId === noteId) setSelectedNote(null);
      fetchNotes();
    } catch (error) { showToast("삭제 실패", "error"); }
  };

  const openModal = (mode, note = null) => {
    setModalMode(mode);
    setNoteForm(note 
      ? { id: note.realId, title: note.title, category: note.category, content: note.content } 
      : { id: null, title: '', category: '', content: '' }
    );
    setIsModalOpen(true);
  };

  const handleAskAi = async () => {
    if (!aiQuery.trim() || !selectedNote) return;
    setIsAiLoading(true);
    setAiResponse("🧠 AI가 답변을 작성 중입니다...");
    try {
      const response = await axios.post('/api/ai/ask', { noteContent: selectedNote.content, question: aiQuery });
      setAiResponse(response.data.answer || response.data);
    } catch (error) { setAiResponse("AI 연결 실패"); }
    finally { setIsAiLoading(false); setAiQuery(''); }
  };

  const dynamicCategories = ['ALL', ...new Set(notes.map(n => n.category))];
  const processedNotes = notes
    .filter(n => categoryFilter === 'ALL' || n.category === categoryFilter)
    .sort((a, b) => {
      if (sortOrder === 'DESC') return b.realId - a.realId;
      if (sortOrder === 'ASC') return a.realId - b.realId;
      if (sortOrder === 'NAME') return a.title.localeCompare(b.title);
      return 0;
    });

  return (
    <>
      <GlobalStyle />
      <Container>
        <InnerWrap>
          {/* 사이드바 */}
          <Sidebar>
            <LogoArea> 📖 학습 노트</LogoArea>
            
            <SidebarControls>
              <select value={sortOrder} onChange={e => setSortOrder(e.target.value)}>
                <option value="DESC">최신순</option>
                <option value="ASC">오래된순</option>
                <option value="NAME">이름순</option>
              </select>
            </SidebarControls>

            <CategoryArea>
              {dynamicCategories.map(cat => (
                <CategoryBtn key={cat} $active={categoryFilter === cat} onClick={() => setCategoryFilter(cat)}>
                  {cat === 'ALL' ? '전체 보기' : cat}
                </CategoryBtn>
              ))}
            </CategoryArea>

            <Divider />

            <SidebarHeaderRow>
              <div className="title">MY NOTES</div>
              <button className="add-btn" onClick={() => openModal('CREATE')} title="새 노트">+</button>
            </SidebarHeaderRow>

            <NoteList>
              {processedNotes.length > 0 ? processedNotes.map(note => (
                <NoteItem 
                  key={note.realId} 
                  $active={selectedNote?.realId === note.realId}
                  onClick={() => { setSelectedNote(note); setIsAiOpen(false); setAiResponse(''); }}
                >
                  <div className="note-info">
                    <div className="note-title">{note.title}</div>
                    <div className="note-meta">
                      <Badge>{note.category}</Badge>
                      <span>{note.createdDate?.split('T')[0]}</span>
                    </div>
                  </div>
                </NoteItem>
              )) : <EmptyMsg>조건에 맞는 노트가 없습니다.</EmptyMsg>}
            </NoteList>
          </Sidebar>

          {/* 메인 컨텐츠 영역 */}
          <MainContent>
            {selectedNote ? (
              <PaperWrapper>
                <BackBtn onClick={() => setSelectedNote(null)}>← 대시보드로 돌아가기</BackBtn>
                <Paper>
                  <PaperHeader>
                    <div className="title-area">
                      <Badge className="big-badge">{selectedNote.category}</Badge>
                      <PaperTitle>{selectedNote.title}</PaperTitle>
                      <NoteDate>작성일: {selectedNote.createdDate?.split('T')[0]}</NoteDate>
                    </div>
                    <ActionGroup>
                      <ActionBtn onClick={() => openModal('EDIT', selectedNote)}>✏️ 수정</ActionBtn>
                      <ActionBtn $danger onClick={(e) => handleDelete(e, selectedNote.realId)}>🗑️ 삭제</ActionBtn>
                    </ActionGroup>
                  </PaperHeader>
                  <PaperBody>
                    <ReactMarkdown>{selectedNote.content}</ReactMarkdown>
                  </PaperBody>
                </Paper>
              </PaperWrapper>
            ) : notes.length > 0 ? (
              <DashboardWrapper>
                <DashHeader>
                  <div>
                    <h1>나만의 지식 저장소</h1>
                    <p>지금까지 배운 내용들을 한눈에 확인하세요.</p>
                  </div>
                  <button className="create-btn" onClick={() => openModal('CREATE')}>+ 새 노트 작성</button>
                </DashHeader>
                
                {/* ✅ 수정 포인트: 통계 카드 영역 비율 및 글씨 크기 재조정 */}
                <StatsRow>
                  <StatCard>
                    <div className="icon">📚</div>
                    <div className="info">
                      <div className="label">총 기록한 노트</div>
                      <div className="value">{notes.length}<span>개</span></div>
                    </div>
                  </StatCard>
                  <StatCard>
                    <div className="icon">🏷️</div>
                    <div className="info">
                      <div className="label">학습 카테고리</div>
                      <div className="value">{dynamicCategories.length - 1}<span>개</span></div>
                    </div>
                  </StatCard>
                  <StatCard>
                    <div className="icon">🔥</div>
                    <div className="info">
                      <div className="label">최근 학습일</div>
                      <div className="date-value">{notes.length > 0 ? notes[notes.length-1].createdDate?.split('T')[0] : '없음'}</div>
                    </div>
                  </StatCard>
                </StatsRow>

                <GridTitle>
                  <h3>최근 작성한 노트</h3>
                  <span>{categoryFilter === 'ALL' ? '전체' : categoryFilter} 카테고리</span>
                </GridTitle>

                <NoteGrid>
                  {processedNotes.map(note => (
                    <GridCard key={note.realId} onClick={() => setSelectedNote(note)}>
                      <div className="card-top">
                        <Badge>{note.category}</Badge>
                        <button className="del-btn" onClick={(e) => handleDelete(e, note.realId)}>✖</button>
                      </div>
                      <h4>{note.title}</h4>
                      <p className="preview">{note.content.substring(0, 80).replace(/[#*`]/g, '')}...</p>
                      <div className="card-bottom">
                        <span>{note.createdDate?.split('T')[0]}</span>
                        <span className="read-more">읽어보기 →</span>
                      </div>
                    </GridCard>
                  ))}
                </NoteGrid>
              </DashboardWrapper>
            ) : (
              <WelcomeScreen>
                <div className="hero">
                  <div className="emoji">✍️</div>
                  <h2>첫 노트를 작성해보세요</h2>
                  <p>배운 내용을 기록하고, AI 튜터에게 질문하며 학습 효율을 높이세요.</p>
                  <div className="action-btn" onClick={() => openModal('CREATE')}>
                    새 노트 작성하기
                  </div>
                </div>
              </WelcomeScreen>
            )}

            {/* AI 튜터 */}
            {selectedNote && (
              <AiFab onClick={() => setIsAiOpen(!isAiOpen)} $isOpen={isAiOpen}>
                {isAiOpen ? '✖ 닫기' : '🤖 AI 전공 튜터 질문하기'}
              </AiFab>
            )}
            {isAiOpen && selectedNote && (
              <AiPanel>
                <AiHeader>
                  <div className="title">🤖 AI 튜터</div>
                  <div className="sub">현재 노트 내용을 기반으로 답변합니다.</div>
                </AiHeader>
                <AiContent>
                  {isAiLoading ? (
                    <div className="loading">AI가 분석 중입니다...</div>
                  ) : (
                    <ReactMarkdown>{aiResponse || "이 노트 내용과 관련하여 무엇이든 물어보세요!"}</ReactMarkdown>
                  )}
                </AiContent>
                <AiInputArea>
                  <input value={aiQuery} onChange={e => setAiQuery(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleAskAi()} placeholder="질문을 입력하세요..." />
                  <button onClick={handleAskAi}>전송</button>
                </AiInputArea>
              </AiPanel>
            )}
          </MainContent>
        </InnerWrap>

        {isModalOpen && (
          <ModalOverlay onClick={() => setIsModalOpen(false)}>
            <ModalCard onClick={e => e.stopPropagation()}>
              <h2>{modalMode === 'CREATE' ? '✨ 새 노트 작성' : '✏️ 노트 수정'}</h2>
              <InputGroup>
                <label>카테고리</label>
                <input value={noteForm.category} onChange={e => setNoteForm({...noteForm, category: e.target.value})} placeholder="예: 알고리즘, 캡스톤" />
              </InputGroup>
              <InputGroup>
                <label>노트 제목</label>
                <input value={noteForm.title} onChange={e => setNoteForm({...noteForm, title: e.target.value})} placeholder="오늘 배운 핵심 주제는?" />
              </InputGroup>
              <InputGroup>
                <label>노트 내용 (Markdown 지원)</label>
                <textarea value={noteForm.content} onChange={e => setNoteForm({...noteForm, content: e.target.value})} placeholder="# 큰 제목\n\n- 핵심 내용 1\n- 핵심 내용 2" />
              </InputGroup>
              <BtnGroup>
                <button className="cancel" onClick={() => setIsModalOpen(false)}>취소</button>
                <button className="confirm" onClick={handleSave}>저장하기</button>
              </BtnGroup>
            </ModalCard>
          </ModalOverlay>
        )}

        <ToastContainer $show={toast.show} $type={toast.type}>{toast.message}</ToastContainer>
      </Container>
    </>
  );
};

export default StudyNote;

// --- 💅 Styled Components ---

const Container = styled.div` flex: 1; padding: 40px; overflow-y: hidden; height: 100vh; box-sizing: border-box; background-color: #f8f9fc; display: flex; justify-content: center; `;
const InnerWrap = styled.div` display: flex; width: 100%; max-width: 1200px; gap: 30px; height: 100%; `;

const Sidebar = styled.div` width: 320px; background: white; border-radius: 20px; padding: 25px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); border: 1px solid #eee; display: flex; flex-direction: column; flex-shrink: 0; `;
const LogoArea = styled.div` font-size: 18px; font-weight: 800; margin-bottom: 25px; color: #333; `;

const SidebarControls = styled.div`
  margin-bottom: 20px;
  select { width: 100%; padding: 10px 14px; background: #f8f9fa; color: #555; border: 1px solid #eee; border-radius: 10px; font-size: 13px; font-weight: bold; outline: none; cursor: pointer; transition: border-color 0.2s; &:focus { border-color: #a855f7; } }
`;

const CategoryArea = styled.div` display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 20px; `;
const CategoryBtn = styled.button`
  padding: 6px 12px; border-radius: 20px; border: 1px solid ${props => props.$active ? '#a855f7' : '#eee'}; background: ${props => props.$active ? '#fdf4ff' : '#f9fafb'};
  color: ${props => props.$active ? '#a855f7' : '#666'}; cursor: pointer; font-size: 12px; font-weight: bold; transition: 0.2s; &:hover { border-color: #a855f7; color: #a855f7; }
`;

const Divider = styled.hr` border: 0; height: 1px; background: #f0f0f0; margin: 10px 0 20px 0; width: 100%; `;

const SidebarHeaderRow = styled.div`
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; padding: 0 5px;
  .title { font-size: 13px; font-weight: 800; color: #888; }
  .add-btn { background: #fdf4ff; color: #a855f7; border: 1px solid #f0abfc; width: 28px; height: 28px; border-radius: 8px; display: flex; justify-content: center; align-items: center; cursor: pointer; font-size: 18px; font-weight: bold; transition: 0.2s; &:hover { background: #a855f7; color: white; } }
`;

const NoteList = styled.div` flex: 1; overflow-y: auto; padding-right: 5px; &::-webkit-scrollbar { width: 6px; } &::-webkit-scrollbar-thumb { background: #e9d5ff; border-radius: 4px; } `;
const NoteItem = styled.div`
  display: flex; gap: 12px; padding: 15px; border-radius: 12px; cursor: pointer; margin-bottom: 10px; transition: transform 0.2s;
  background: ${props => props.$active ? '#fdf4ff' : 'white'}; border: 1px solid ${props => props.$active ? '#f0abfc' : '#eee'};
  &:hover { transform: translateY(-2px); box-shadow: 0 2px 10px rgba(168,85,247,0.1); }
  .note-info { display: flex; flex-direction: column; flex: 1; overflow: hidden; }
  .note-title { font-weight: bold; font-size: 14px; color: #333; margin-bottom: 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .note-meta { display: flex; align-items: center; gap: 8px; font-size: 11px; color: #888; }
`;
const Badge = styled.span` font-size: 11px; color: #9333ea; background: #f3e8ff; padding: 4px 8px; border-radius: 6px; font-weight: bold; display: inline-block; `;
const EmptyMsg = styled.div` text-align: center; color: #aaa; font-size: 13px; margin-top: 30px; `;

const MainContent = styled.div` flex: 1; background: white; border-radius: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); border: 1px solid #eee; display: flex; flex-direction: column; position: relative; overflow: hidden; `;

// 📊 대시보드 뷰
const DashboardWrapper = styled.div` 
  flex: 1; 
  padding: 40px 50px 100px 50px; 
  overflow-y: auto; 
  box-sizing: border-box; 
  animation: ${fadeIn} 0.4s ease-out; 
  &::-webkit-scrollbar { width: 8px; } 
  &::-webkit-scrollbar-thumb { background: #d8b4fe; border-radius: 4px; }
`;

const DashHeader = styled.div`
  display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 40px;
  h1 { font-size: 28px; font-weight: 800; margin: 0 0 10px 0; color: #333; }
  p { margin: 0; color: #666; font-size: 15px; }
  .create-btn { background: #a855f7; color: white; padding: 12px 24px; border-radius: 12px; border: none; font-size: 15px; font-weight: bold; cursor: pointer; transition: 0.2s; &:hover { background: #9333ea; transform: translateY(-2px); } }
`;

// 🔥 [핵심 수정] 통계 카드 간격 및 글씨 크기 조정
const StatsRow = styled.div` display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 40px; `;
const StatCard = styled.div`
  background: white; padding: 20px 18px; border-radius: 16px; border: 1px solid #eee; display: flex; align-items: center; gap: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.02);
  .icon { font-size: 24px; background: #fdf4ff; min-width: 48px; height: 48px; display: flex; justify-content: center; align-items: center; border-radius: 14px; border: 1px solid #f0abfc; flex-shrink: 0;} 
  .info { display: flex; flex-direction: column; overflow: hidden; }
  .label { font-size: 12px; color: #888; font-weight: bold; margin-bottom: 4px; white-space: nowrap; } 
  .value { font-size: 22px; font-weight: 800; color: #333; white-space: nowrap; span { font-size: 13px; color: #a855f7; margin-left: 4px; } }
  .date-value { font-size: 15px; font-weight: 800; color: #333; white-space: nowrap; letter-spacing: -0.5px; margin-top: 2px;}
`;

const GridTitle = styled.div` display: flex; align-items: center; gap: 15px; margin-bottom: 20px; h3 { margin: 0; font-size: 18px; font-weight: 800; color: #333; } span { background: #f8f9fa; border: 1px solid #eee; color: #666; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; } `;
const NoteGrid = styled.div` display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; `;
const GridCard = styled.div`
  background: white; padding: 25px; border-radius: 16px; border: 1px solid #eee; box-shadow: 0 4px 10px rgba(0,0,0,0.02); cursor: pointer; transition: 0.2s; position: relative;
  &:hover { transform: translateY(-3px); box-shadow: 0 10px 20px rgba(168,85,247,0.1); border-color: #d8b4fe; .del-btn { opacity: 1; } }
  .card-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px; }
  .del-btn { opacity: 0; background: #fff1f2; border: 1px solid #ffe4e6; padding: 4px 8px; border-radius: 6px; font-size: 12px; color: #e11d48; cursor: pointer; transition: 0.2s; &:hover { background: #ffe4e6; } }
  h4 { margin: 0 0 10px 0; font-size: 16px; color: #333; font-weight: bold; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;}
  .preview { font-size: 13.5px; color: #666; line-height: 1.6; margin-bottom: 20px; height: 42px; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
  .card-bottom { display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: #888; font-weight: bold; border-top: 1px solid #f8f9fa; padding-top: 15px; }
  .read-more { color: #a855f7; }
`;

// 📖 상세 보기 뷰 (Paper)
const PaperWrapper = styled.div` flex: 1; display: flex; flex-direction: column; overflow: hidden; animation: ${fadeIn} 0.3s ease-out; `;
const BackBtn = styled.button` align-self: flex-start; margin: 30px 0 0 40px; background: white; border: 1px solid #eee; padding: 8px 16px; border-radius: 8px; font-weight: bold; color: #666; cursor: pointer; transition: 0.2s; &:hover { background: #f8f9fa; color: #333; } `;
const Paper = styled.div` flex: 1; padding: 30px 50px 100px 50px; overflow-y: auto; &::-webkit-scrollbar { width: 8px; } &::-webkit-scrollbar-thumb { background: #d8b4fe; border-radius: 4px; } `;
const PaperHeader = styled.div` display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #f8f9fa; padding-bottom: 25px; margin-bottom: 30px; .big-badge { margin-bottom: 12px; } `;
const PaperTitle = styled.h1` font-size: 26px; font-weight: 800; margin: 0 0 10px 0; color: #333; line-height: 1.4; `;
const NoteDate = styled.div` font-size: 13px; color: #888; `;

const ActionGroup = styled.div` display: flex; gap: 8px; `;
const ActionBtn = styled.button`
  display: flex; align-items: center; gap: 6px; padding: 8px 14px; background: ${props => props.$danger ? '#fff1f2' : '#f8f9fa'}; border: 1px solid ${props => props.$danger ? '#ffe4e6' : '#eee'}; border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: bold; color: ${props => props.$danger ? '#e11d48' : '#555'}; transition: 0.2s;
  &:hover { background: ${props => props.$danger ? '#ffe4e6' : '#eee'}; }
`;

const PaperBody = styled.div` 
  line-height: 1.8; color: #444; font-size: 15px;
  h1, h2, h3 { margin-top: 30px; margin-bottom: 15px; color: #222; } 
  pre { background: #f8f9fa; border: 1px solid #eee; padding: 20px; border-radius: 12px; overflow-x: auto; margin: 20px 0; font-family: monospace; color: #333; } 
  code { background: #f1f5f9; padding: 2px 6px; border-radius: 4px; color: #e11d48; font-family: monospace; font-size: 14px; }
  blockquote { border-left: 4px solid #a855f7; background: #fdf4ff; padding: 15px 20px; border-radius: 0 8px 8px 0; color: #666; margin: 20px 0; font-style: italic; }
`;

const WelcomeScreen = styled.div`
  flex: 1; display: flex; align-items: center; justify-content: center; height: 100%;
  .hero { text-align: center; max-width: 500px; animation: ${fadeIn} 0.5s ease-out; }
  .emoji { font-size: 64px; margin-bottom: 20px; }
  h2 { font-size: 26px; font-weight: 800; color: #333; margin-bottom: 15px; }
  p { font-size: 15px; color: #888; line-height: 1.6; margin-bottom: 30px; }
  .action-btn { display: inline-block; background: #a855f7; color: white; padding: 14px 35px; border-radius: 12px; font-weight: bold; font-size: 16px; cursor: pointer; transition: 0.2s; box-shadow: 0 4px 15px rgba(168, 85, 247, 0.3); &:hover { background: #9333ea; transform: translateY(-2px); } }
`;

const AiFab = styled.button`
  position: absolute; bottom: 30px; right: 30px; background: ${props => props.$isOpen ? '#333' : '#a855f7'}; color: white; padding: 14px 24px; border-radius: 30px; border: none; cursor: pointer; z-index: 10; box-shadow: 0 4px 15px rgba(168,85,247,0.3); font-weight: bold; font-size: 14px; transition: 0.2s;
  &:hover { transform: translateY(-2px); }
`;
const AiPanel = styled.div`
  position: absolute; bottom: 85px; right: 30px; width: 380px; height: 500px; background: white; border-radius: 16px; border: 1px solid #e9d5ff; z-index: 10; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 10px 30px rgba(168,85,247,0.15); animation: ${fadeIn} 0.2s ease-out;
`;
const AiHeader = styled.div` background: linear-gradient(135deg, #a855f7, #9333ea); color: white; padding: 16px 20px; .title { font-size: 16px; font-weight: bold; margin-bottom: 4px; } .sub { font-size: 12px; color: #e9d5ff; } `;
const AiContent = styled.div` flex: 1; padding: 20px; overflow-y: auto; background: #fdfaff; font-size: 14px; line-height: 1.6; color: #444; .loading { color: #a855f7; font-weight: bold; text-align: center; margin-top: 50px; } pre { background: #f8f9fa; border: 1px solid #eee; color: #333; padding: 15px; border-radius: 8px; margin: 10px 0; overflow-x: auto; } `;
const AiInputArea = styled.div` display: flex; padding: 15px; background: white; border-top: 1px solid #eee; gap: 10px; input { flex: 1; padding: 12px; border: 1px solid #ddd; border-radius: 8px; outline: none; transition: 0.2s; &:focus { border-color: #a855f7; } } button { background: #333; color: white; border: none; padding: 0 18px; border-radius: 8px; font-weight: bold; cursor: pointer; transition: 0.2s; &:hover { background: #000; } } `;

const ModalOverlay = styled.div` position: fixed; inset: 0; background: rgba(0, 0, 0, 0.5); display: flex; justify-content: center; align-items: center; z-index: 9999; backdrop-filter: blur(4px); `;
const ModalCard = styled.div` background: white; padding: 40px; border-radius: 20px; width: 550px; max-width: 90%; box-shadow: 0 10px 30px rgba(0,0,0,0.1); h2 { margin: 0 0 25px 0; color: #333; font-size: 22px; } `;
const InputGroup = styled.div` margin-bottom: 20px; label { display: block; margin-bottom: 8px; font-size: 14px; font-weight: bold; color: #555; } input, textarea { width: 100%; padding: 14px; border: 1px solid #ddd; border-radius: 10px; font-size: 14px; outline: none; transition: 0.2s; box-sizing: border-box; } input:focus, textarea:focus { border-color: #a855f7; } textarea { height: 250px; resize: none; line-height: 1.6; font-family: inherit; } `;
const BtnGroup = styled.div` display: flex; justify-content: flex-end; gap: 12px; margin-top: 30px; button { padding: 12px 24px; border-radius: 10px; font-weight: bold; font-size: 15px; cursor: pointer; transition: 0.2s; } .cancel { background: #f8f9fa; color: #555; border: 1px solid #ddd; &:hover { background: #eee; } } .confirm { background: #a855f7; color: white; border: none; &:hover { background: #9333ea; } } `;

const ToastContainer = styled.div` position: fixed; bottom: 50px; left: 50%; transform: translateX(-50%); background: ${props => props.$type === 'error' ? '#ef4444' : '#333'}; color: white; padding: 14px 28px; border-radius: 30px; font-size: 14px; font-weight: bold; z-index: 10000; box-shadow: 0 10px 20px rgba(0,0,0,0.1); display: ${props => props.$show ? 'block' : 'none'}; animation: ${slideUp} 0.3s ease-out; `;